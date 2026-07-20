import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Coupon } from './schemas/coupon.schema';

function makeCoupon(overrides = {}) {
  return {
    _id: 'cpn-1',
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    minOrderCents: 0,
    maxDiscountCents: null,
    usageLimit: null,
    usedCount: 0,
    expiresAt: null,
    isActive: true,
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('CouponService', () => {
  let service: CouponService;
  let couponModel: any;

  beforeEach(async () => {
    couponModel = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) }),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: getModelToken(Coupon.name), useValue: couponModel },
      ],
    }).compile();
    service = module.get<CouponService>(CouponService);
  });

  describe('validateAndCalculateDiscount', () => {
    it('calculates percentage discount correctly', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ type: 'percentage', value: 10 }));
      const { discountCents } = await service.validateAndCalculateDiscount('SAVE10', 100000);
      expect(discountCents).toBe(10000); // 10% of 100000
    });

    it('calculates fixed discount correctly', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ type: 'fixed', value: 5000 }));
      const { discountCents } = await service.validateAndCalculateDiscount('FLAT50', 100000);
      expect(discountCents).toBe(5000);
    });

    it('caps fixed discount at subtotal (no negative total)', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ type: 'fixed', value: 200000 }));
      const { discountCents } = await service.validateAndCalculateDiscount('HUGE', 100000);
      expect(discountCents).toBeLessThanOrEqual(100000);
    });

    it('throws BadRequestException for unknown coupon code', async () => {
      couponModel.findOne.mockResolvedValue(null);
      await expect(service.validateAndCalculateDiscount('FAKE', 100000)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for inactive coupon', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ isActive: false }));
      await expect(service.validateAndCalculateDiscount('INACTIVE', 100000)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for expired coupon', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ expiresAt: new Date('2000-01-01') }));
      await expect(service.validateAndCalculateDiscount('EXPIRED', 100000)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when usage limit is reached', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ usageLimit: 5, usedCount: 5 }));
      await expect(service.validateAndCalculateDiscount('USED', 100000)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when order is below minOrderCents', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ minOrderCents: 200000 }));
      await expect(service.validateAndCalculateDiscount('MINORDER', 100000)).rejects.toThrow(BadRequestException);
    });

    it('applies maxDiscountCents cap on percentage coupons', async () => {
      couponModel.findOne.mockResolvedValue(makeCoupon({ type: 'percentage', value: 50, maxDiscountCents: 10000 }));
      const { discountCents } = await service.validateAndCalculateDiscount('CAP50', 100000);
      expect(discountCents).toBe(10000); // 50% = 50000, capped at 10000
    });
  });
});
