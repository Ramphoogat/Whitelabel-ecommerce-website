import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { CheckoutSession, CheckoutSessionSchema } from './schemas/checkout-session.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { ProductVariant, ProductVariantSchema } from '../catalog/schemas/product-variant.schema';
import { CheckoutService, CHECKOUT_EXPIRY_QUEUE } from './checkout.service';
import { OrderService } from './order.service';
import { CheckoutExpiryProcessor } from './checkout-expiry.processor';
import { CheckoutController } from './checkout.controller';
import { OrderAdminController } from './order-admin.controller';
import { CartModule } from '../cart/cart.module';
import { InventoryModule } from '../inventory/inventory.module';
import { MarketingModule } from '../marketing/marketing.module';
import { NotificationModule } from '../notification/notification.module';
import { PdfService } from '../../providers/pdf/pdf.service';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckoutSession.name, schema: CheckoutSessionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
    BullModule.registerQueue({ name: CHECKOUT_EXPIRY_QUEUE }),
    CartModule,
    InventoryModule,
    MarketingModule,
    NotificationModule,
    TaxModule,
  ],
  controllers: [CheckoutController, OrderAdminController],
  providers: [CheckoutService, OrderService, CheckoutExpiryProcessor, PdfService],
  exports: [CheckoutService, OrderService],
})
export class OrderModule {}
