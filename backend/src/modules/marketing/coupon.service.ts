import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

export interface CouponValidationResult {
  coupon: CouponDocument;
  discountCents: number;
}

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>) {}

  async create(dto: CreateCouponDto) {
    return this.couponModel.create({
      ...dto,
      code: dto.code.toUpperCase(),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  async list() {
    return this.couponModel.find().sort({ createdAt: -1 }).lean();
  }

  async update(id: string, dto: UpdateCouponDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.code) update.code = dto.code.toUpperCase();
    if (dto.expiresAt) update.expiresAt = new Date(dto.expiresAt);

    const coupon = await this.couponModel.findByIdAndUpdate(id, update, { new: true });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async delete(id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return { success: true };
  }

  /**
   * Called by CheckoutService when a coupon code is applied at checkout.
   * Validates eligibility and returns the computed discount -- does NOT
   * increment usedCount yet, since the checkout might still be abandoned.
   * incrementUsage() is called separately, only once payment succeeds.
   */
  async validateAndCalculateDiscount(
    code: string,
    subtotalCents: number,
  ): Promise<CouponValidationResult> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (subtotalCents < coupon.minOrderCents) {
      throw new BadRequestException(
        `This coupon requires a minimum order of ${(coupon.minOrderCents / 100).toFixed(2)}`,
      );
    }

    let discountCents =
      coupon.type === 'percentage'
        ? Math.round((subtotalCents * coupon.value) / 100)
        : coupon.value;

    if (coupon.type === 'percentage' && coupon.maxDiscountCents !== null) {
      discountCents = Math.min(discountCents, coupon.maxDiscountCents);
    }

    discountCents = Math.min(discountCents, subtotalCents);

    return { coupon, discountCents };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await this.couponModel.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } });
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    return this.couponModel.findOne({ code: code.toUpperCase() });
  }
}
