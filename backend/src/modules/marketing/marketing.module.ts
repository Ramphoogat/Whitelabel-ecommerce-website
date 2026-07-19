import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { CouponService } from './coupon.service';
import { BannerService } from './banner.service';
import { MarketingAdminController } from './marketing-admin.controller';
import { MarketingPublicController } from './marketing-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: Banner.name, schema: BannerSchema },
    ]),
  ],
  controllers: [MarketingAdminController, MarketingPublicController],
  providers: [CouponService, BannerService],
  exports: [CouponService, BannerService],
})
export class MarketingModule {}
