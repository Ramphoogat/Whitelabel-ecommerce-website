import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { CustomerRefreshTokenDto } from './dto/customer-refresh-token.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentCustomer } from '../../shared/decorators/current-customer.decorator';
import { JwtCustomerGuard } from '../../shared/guards/jwt-customer.guard';
import { JwtCustomerPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('customer-auth')
@Controller('auth/customer')
export class CustomerAuthController {
  constructor(private readonly customerService: CustomerService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a storefront customer account' })
  register(@Body() dto: RegisterCustomerDto) {
    return this.customerService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Log in with email + password' })
  login(@Body() dto: LoginCustomerDto) {
    return this.customerService.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new access + refresh token pair' })
  refresh(@Body() dto: CustomerRefreshTokenDto) {
    return this.customerService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke a refresh token (and its whole rotation family)' })
  async logout(@Body() dto: CustomerRefreshTokenDto) {
    await this.customerService.logout(dto.refreshToken);
    return { success: true };
  }

  @UseGuards(JwtCustomerGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Current authenticated customer (from the access token)' })
  me(@CurrentCustomer() customer: JwtCustomerPayload) {
    return customer;
  }
}
