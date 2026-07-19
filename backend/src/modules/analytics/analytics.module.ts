import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { InventoryItem, InventoryItemSchema } from '../inventory/schemas/inventory-item.schema';
import { ProductVariant, ProductVariantSchema } from '../catalog/schemas/product-variant.schema';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAdminController } from './analytics-admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
  controllers: [AnalyticsAdminController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
