import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import { CheckoutSession, CheckoutSessionDocument } from './schemas/checkout-session.schema';
import { ProductVariant, ProductVariantDocument } from '../catalog/schemas/product-variant.schema';
import { CartService } from '../cart/cart.service';
import { InventoryService, ReservationLineItem } from '../inventory/inventory.service';
import { CouponService } from '../marketing/coupon.service';

export const CHECKOUT_EXPIRY_QUEUE = 'checkout-expiry';
const CHECKOUT_SESSION_TTL_MINUTES = 15;

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(CheckoutSession.name)
    private readonly sessionModel: Model<CheckoutSessionDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly couponService: CouponService,
    @InjectQueue(CHECKOUT_EXPIRY_QUEUE) private readonly expiryQueue: Queue<{ sessionId: string }>,
  ) {}

  /**
   * §5.1 step 2: begin checkout. Re-reads live prices/availability from the
   * cart, creates the session document first (so we have an id to use as the
   * reservation's audit reference), then attempts to reserve every line item.
   * If reservation fails for any line, the session is marked expired
   * immediately and the failing lines are returned so the storefront can
   * show "no longer available" for exactly those items.
   */
  async createSession(guestToken: string) {
    const cart = await this.cartService.getCartForCheckout(guestToken);

    const variantIds = cart.items.map((i) => i.variantId);
    const variants = await this.variantModel.find({ _id: { $in: variantIds } }).lean();
    const variantById = new Map(variants.map((v) => [v._id.toString(), v]));

    const lineItems = cart.items.map((item) => {
      const variant = variantById.get(item.variantId.toString());
      if (!variant || !variant.isActive) {
        throw new BadRequestException(`Variant ${item.variantId.toString()} is no longer available`);
      }
      return {
        variantId: item.variantId,
        sku: variant.sku,
        quantity: item.quantity,
        unitPriceCents: variant.priceCents, // always the live price, never the cart snapshot
      };
    });

    const totalCents = lineItems.reduce((sum, li) => sum + li.unitPriceCents * li.quantity, 0);
    const expiresAt = new Date(Date.now() + CHECKOUT_SESSION_TTL_MINUTES * 60 * 1000);

    const session = await this.sessionModel.create({
      cartId: cart._id,
      items: lineItems,
      subtotalCents: totalCents,
      totalCents,
      status: 'open',
      expiresAt,
    });

    const reservationItems: ReservationLineItem[] = lineItems.map((li) => ({
      variantId: li.variantId.toString(),
      quantity: li.quantity,
    }));

    const result = await this.inventoryService.reserveStock(
      reservationItems,
      (session._id as Types.ObjectId).toString(),
    );

    if (!result.success) {
      session.status = 'expired';
      await session.save();
      return {
        success: false as const,
        failures: result.failures,
      };
    }

    session.status = 'awaiting_payment';
    await session.save();

    // §5.1 step 3: schedule a delayed job to release this exact reservation
    // if payment never completes — precise (fires at exactly expiresAt),
    // unlike a polling cron.
    await this.expiryQueue.add(
      'expire-checkout-session',
      { sessionId: (session._id as Types.ObjectId).toString() },
      { delay: CHECKOUT_SESSION_TTL_MINUTES * 60 * 1000 },
    );

    return {
      success: true as const,
      sessionId: (session._id as Types.ObjectId).toString(),
      totalCents,
      currency: session.currency,
      expiresAt: session.expiresAt,
      items: lineItems,
    };
  }

  async getSession(sessionId: string): Promise<CheckoutSessionDocument> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Checkout session not found');
    return session;
  }

  /**
   * Must be called before a payment gateway is selected — once
   * select-gateway creates the real gateway order, its amount is locked on
   * the gateway's side, so changing totalCents afterward would desync it.
   */
  async applyCoupon(sessionId: string, couponCode: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Checkout session not found');
    if (session.status !== 'awaiting_payment') {
      throw new BadRequestException(`Session is "${session.status}", not open for coupon changes`);
    }
    if (session.paymentGateway) {
      throw new BadRequestException(
        'A payment gateway has already been selected for this session — coupons must be applied before that step',
      );
    }

    const { coupon, discountCents } = await this.couponService.validateAndCalculateDiscount(
      couponCode,
      session.subtotalCents,
    );

    session.couponCode = coupon.code;
    session.discountCents = discountCents;
    session.totalCents = session.subtotalCents - discountCents;
    await session.save();

    return {
      couponCode: coupon.code,
      discountCents,
      subtotalCents: session.subtotalCents,
      totalCents: session.totalCents,
    };
  }

  async removeCoupon(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Checkout session not found');
    if (session.paymentGateway) {
      throw new BadRequestException('A payment gateway has already been selected for this session');
    }

    session.couponCode = null;
    session.discountCents = 0;
    session.totalCents = session.subtotalCents;
    await session.save();

    return { subtotalCents: session.subtotalCents, totalCents: session.totalCents };
  }

  /** Captures where to send the order confirmation once payment completes. */
  async setContactInfo(sessionId: string, contactEmail?: string, contactPhone?: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Checkout session not found');

    if (contactEmail !== undefined) session.contactEmail = contactEmail || null;
    if (contactPhone !== undefined) session.contactPhone = contactPhone || null;
    await session.save();

    return { contactEmail: session.contactEmail, contactPhone: session.contactPhone };
  }

  /** Cancel a still-open session — releases the reservation immediately, no need to wait for TTL. */
  async cancelSession(sessionId: string): Promise<void> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session || session.status === 'completed' || session.status === 'expired') return;

    await this.inventoryService.releaseStock(
      session.items.map((i) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
      sessionId,
      'checkout cancelled',
    );

    session.status = 'expired';
    await session.save();
  }

  /** Called by the delayed BullMQ job scheduled in createSession — releases
   *  this one session's reservation if it's still sitting unpaid past its TTL. */
  async expireSessionIfStillOpen(sessionId: string): Promise<void> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session || session.status !== 'awaiting_payment') return; // already paid/cancelled

    await this.inventoryService.releaseStock(
      session.items.map((i) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
      sessionId,
      'reservation expired',
    );
    session.status = 'expired';
    await session.save();
  }

  /**
   * §5.1 step 3: releases reservations for sessions past their expiresAt
   * that never completed payment. This is a fallback sweep for anything the
   * per-session delayed job might miss (e.g. a queue outage) — the delayed
   * job in createSession() is the precise mechanism; this is the safety net.
   */
  async releaseExpiredSessions(): Promise<number> {
    const expiredSessions = await this.sessionModel.find({
      status: 'awaiting_payment',
      expiresAt: { $lt: new Date() },
    });

    for (const session of expiredSessions) {
      await this.inventoryService.releaseStock(
        session.items.map((i) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
        (session._id as Types.ObjectId).toString(),
        'reservation expired',
      );
      session.status = 'expired';
      await session.save();
    }

    return expiredSessions.length;
  }
}
