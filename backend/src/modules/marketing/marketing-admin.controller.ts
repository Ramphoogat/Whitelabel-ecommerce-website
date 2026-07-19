import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { BannerService } from './banner.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-marketing')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/marketing')
export class MarketingAdminController {
  constructor(
    private readonly couponService: CouponService,
    private readonly bannerService: BannerService,
  ) {}

  @Post('coupons')
  @ApiOperation({ summary: 'Create a coupon' })
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List all coupons' })
  listCoupons() {
    return this.couponService.list();
  }

  @Patch('coupons/:id')
  @ApiOperation({ summary: 'Update a coupon' })
  updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete a coupon' })
  deleteCoupon(@Param('id') id: string) {
    return this.couponService.delete(id);
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create a banner' })
  createBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @Get('banners')
  @ApiOperation({ summary: 'List all banners' })
  listBanners() {
    return this.bannerService.listForAdmin();
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update a banner' })
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(id, dto);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete a banner' })
  deleteBanner(@Param('id') id: string) {
    return this.bannerService.delete(id);
  }
}
