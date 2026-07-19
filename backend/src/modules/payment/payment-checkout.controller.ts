import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentGatewayConfigService } from './payment-gateway-config.service';
import { PaymentGatewaySelectionService } from './payment-gateway-selection.service';
import { SelectPaymentGatewayDto } from './dto/select-payment-gateway.dto';

@ApiTags('checkout')
@Controller('checkout')
export class PaymentCheckoutController {
  constructor(
    private readonly service: PaymentGatewayConfigService,
    private readonly selectionService: PaymentGatewaySelectionService,
  ) {}

  @Get('payment-options')
  @ApiOperation({
    summary:
      'Modes (UPI/Card/COD/Netbanking) with their currently-active gateways, for the checkout page',
  })
  getPaymentOptions() {
    return this.service.getCheckoutPaymentOptions();
  }

  @Post('sessions/:id/select-gateway')
  @ApiOperation({
    summary:
      'Customer picks a mode + gateway — creates the real gateway order and returns whatever the frontend SDK needs to open the payment sheet',
  })
  selectGateway(@Param('id') sessionId: string, @Body() dto: SelectPaymentGatewayDto) {
    return this.selectionService.selectGateway(sessionId, dto.mode, dto.gateway);
  }
}
