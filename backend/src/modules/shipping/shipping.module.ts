import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShippingCarrierConfig,
  ShippingCarrierConfigSchema,
} from './schemas/shipping-carrier-config.schema';
import { Shipment, ShipmentSchema } from './schemas/shipment.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { ShippingService } from './shipping.service';
import { ShippingAdminController } from './shipping-admin.controller';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingCarrierConfig.name, schema: ShippingCarrierConfigSchema },
      { name: Shipment.name, schema: ShipmentSchema },
      // Registered here too (harmless -- Nest dedupes) so this module can
      // read order details for shipment creation without importing all of
      // OrderModule's providers just for schema access.
      { name: Order.name, schema: OrderSchema },
    ]),
    OrganizationModule,
  ],
  controllers: [ShippingAdminController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
