import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { UpdateCarrierConfigDto } from './dto/update-carrier-config.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-shipping')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/shipping')
export class ShippingAdminController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('carriers')
  @ApiOperation({ summary: 'List all configured shipping carriers (credentials excluded)' })
  listCarriers() {
    return this.shippingService.listCarriersForAdmin();
  }

  @Patch('carriers/:carrier')
  @ApiOperation({ summary: 'Enable/disable a carrier or update its credentials' })
  updateCarrier(@Param('carrier') carrier: string, @Body() dto: UpdateCarrierConfigDto) {
    return this.shippingService.upsertCarrierForAdmin(carrier, dto);
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Create a shipment/label for a paid order via the given carrier' })
  createShipment(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipmentForOrder(dto.orderId, dto.carrier);
  }

  @Get('shipments/:orderId/track')
  @ApiOperation({ summary: 'Fetch the latest tracking status for the shipment on an order' })
  track(@Param('orderId') orderId: string) {
    return this.shippingService.trackShipment(orderId);
  }
}
