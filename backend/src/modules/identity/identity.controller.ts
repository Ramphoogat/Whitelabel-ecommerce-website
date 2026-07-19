import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IdentityService } from './identity.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { JwtStaffPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a staff/admin account. First registrant becomes the store owner.',
  })
  register(@Body() dto: RegisterDto) {
    return this.identityService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Log in with email + password' })
  login(@Body() dto: LoginDto) {
    return this.identityService.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new access + refresh token pair' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.identityService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke a refresh token (and its whole rotation family)' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.identityService.logout(dto.refreshToken);
    return { success: true };
  }

  @UseGuards(JwtStaffGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Current authenticated staff user (from the access token)' })
  me(@CurrentUser() user: JwtStaffPayload) {
    return user;
  }
}
