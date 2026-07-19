import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Order, OrderDocument, OrderStatus, ORDER_STATUS_TRANSITIONS } from './schemas/order.schema';
import { CheckoutSession, CheckoutSessionDocument } from './schemas/checkout-session.schema';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { CouponService } from '../marketing/coupon.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(CheckoutSession.name)
    private readonly sessionModel: Model<CheckoutSessionDocument>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly couponService: CouponService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Called once payment is confirmed (Phase 5's webhook handler calls this
   * after verifying the gateway callback). Converts the reservation into a
   * permanent stock deduction and creates the order in "paid" status.
   */
  async createOrderFromPaidSession(
    sessionId: string,
    paymentGateway: string,
    gatewayPaymentId: string,
    initialStatus: 'paid' | 'pending' = 'paid',
  ): Promise<OrderDocument> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Checkout session not found');
    if (session.status !== 'awaiting_payment') {
      throw new BadRequestException(
        `Session is "${session.status}", expected "awaiting_payment" — cannot create an order twice`,
      );
    }
    if (session.orderId) {
      // Idempotency guard — webhook retries must not create duplicate orders.
      const existing = await this.orderModel.findById(session.orderId);
      if (existing) return existing;
    }

    await this.inventoryService.fulfillReservation(
      session.items.map((i) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
      sessionId,
    );

    const order = await this.orderModel.create({
      customerId: null,
      orderNumber: this.generateOrderNumber(),
      items: session.items,
      status: initialStatus,
      totalCents: session.totalCents,
      couponCode: session.couponCode,
      discountCents: session.discountCents,
      currency: session.currency,
      checkoutSessionId: session._id,
      paymentGateway,
      gatewayPaymentId,
      contactEmail: session.contactEmail,
      contactPhone: session.contactPhone,
    });

    if (session.couponCode) {
      // Usage is only counted once the order actually exists, not when the
      // coupon was applied at checkout -- an abandoned session must not burn
      // a redemption.
      const coupon = await this.couponService.findByCode(session.couponCode);
      if (coupon) await this.couponService.incrementUsage((coupon._id as Types.ObjectId).toString());
    }

    session.status = 'completed';
    session.orderId = order._id as Types.ObjectId;
    await session.save();

    await this.cartService.markConverted(session.cartId);

    // Fire-and-forget -- enqueue() only queues the job and returns; a
    // missing template or inactive channel must never fail order creation.
    // Nothing is sent synchronously, and nothing here blocks the response.
    this.sendOrderConfirmationBestEffort(order);

    return order;
  }

  private sendOrderConfirmationBestEffort(order: OrderDocument): void {
    const data = {
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      currency: order.currency,
    };

    if (order.contactEmail) {
      this.notificationService
        .enqueue('order_confirmation', order.contactEmail, data)
        .catch((err) =>
          this.logger.warn(`Could not enqueue order confirmation email: ${(err as Error).message}`),
        );
    }
    if (order.contactPhone) {
      this.notificationService
        .enqueue('order_confirmation_sms', order.contactPhone, data)
        .catch((err) =>
          this.logger.warn(`Could not enqueue order confirmation sms: ${(err as Error).message}`),
        );
    }
  }

  async getOrder(orderId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listOrders(status?: OrderStatus) {
    const filter = status ? { status } : {};
    return this.orderModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  /** Enforces ORDER_STATUS_TRANSITIONS — no skipping straight from pending to fulfilled, etc. */
  async transitionStatus(orderId: string, nextStatus: OrderStatus): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const allowedNext = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedNext.includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot transition order from "${order.status}" to "${nextStatus}". Allowed: ${
          allowedNext.length ? allowedNext.join(', ') : '(none — terminal state)'
        }`,
      );
    }

    // Cancelling a paid-but-not-yet-fulfilled order restocks the items — they
    // were already deducted permanently by fulfillReservation, so reversing
    // this is a restock (adjustStock), not a reservation release.
    if (nextStatus === 'cancelled' && order.status === 'paid') {
      for (const item of order.items) {
        await this.inventoryService.adjustStock({
          variantId: item.variantId.toString(),
          quantityDelta: item.quantity,
          note: `Order ${order.orderNumber} cancelled`,
        });
      }
    }

    order.status = nextStatus;
    await order.save();
    return order;
  }

  private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }
}
