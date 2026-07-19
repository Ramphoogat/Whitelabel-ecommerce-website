import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CheckoutService } from './checkout.service';
import { CartToken } from '../cart/cart-token.decorator';
import { Public } from '../../shared/decorators/public.decorator';

class GuestTokenBodyDto {
  @IsOptional()
  @IsString()
  guestToken?: string;
}

class ApplyCouponDto {
  @IsString()
  code!: string;
}

class SetContactInfoDto {
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}

@ApiTags('storefront-checkout')
@Public()
@Controller('storefront/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('sessions')
  @ApiOperation({
    summary:
      'Begin checkout from the current cart — reserves stock atomically (§5.1). Returns failing items if any are unavailable.',
  })
  createSession(@CartToken() token: string, @Body() _body: GuestTokenBodyDto) {
    const guestToken = token || _body?.guestToken;
    if (!guestToken) {
      throw new BadRequestException(
        'No cart token provided — call GET /storefront/cart at least once first to get one',
      );
    }
    return this.checkoutService.createSession(guestToken);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a checkout session (status, total, expiry) — poll this after selecting a gateway to see when payment completes' })
  getSession(@Param('id') id: string) {
    return this.checkoutService.getSession(id);
  }

  @Post('sessions/:id/coupon')
  @ApiOperation({ summary: 'Apply a coupon code — must happen before selecting a payment gateway' })
  applyCoupon(@Param('id') id: string, @Body() dto: ApplyCouponDto) {
    return this.checkoutService.applyCoupon(id, dto.code);
  }

  @Post('sessions/:id/contact')
  @ApiOperation({ summary: 'Set the email/phone to send the order confirmation to' })
  setContactInfo(@Param('id') id: string, @Body() dto: SetContactInfoDto) {
    return this.checkoutService.setContactInfo(id, dto.contactEmail, dto.contactPhone);
  }

  @Delete('sessions/:id/coupon')
  @ApiOperation({ summary: 'Remove the applied coupon from a session' })
  removeCoupon(@Param('id') id: string) {
    return this.checkoutService.removeCoupon(id);
  }

  @Post('sessions/:id/cancel')
  @ApiOperation({ summary: 'Cancel a checkout session and release its stock reservation' })
  async cancelSession(@Param('id') id: string) {
    await this.checkoutService.cancelSession(id);
    return { success: true };
  }
}
