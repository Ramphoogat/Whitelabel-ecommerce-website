import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import {
  PaymentGatewayConfig,
  PaymentGatewayConfigSchema,
} from './schemas/payment-gateway-config.schema';
import { PaymentMode, PaymentModeSchema } from './schemas/payment-mode.schema';
import { WebhookEvent, WebhookEventSchema } from './schemas/webhook-event.schema';
import { CheckoutSession, CheckoutSessionSchema } from '../order/schemas/checkout-session.schema';
import { PaymentGatewayConfigService } from './payment-gateway-config.service';
import { PaymentGatewaySelectionService } from './payment-gateway-selection.service';
import { PaymentWebhookService, PAYMENT_WEBHOOK_QUEUE } from './payment-webhook.service';
import { PaymentWebhookProcessor } from './payment-webhook.processor';
import { PaymentAdminController } from './payment-admin.controller';
import { PaymentCheckoutController } from './payment-checkout.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentGatewayConfig.name, schema: PaymentGatewayConfigSchema },
      { name: PaymentMode.name, schema: PaymentModeSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      // Registered again here (harmless -- Nest dedupes by name) so this
      // module can read/update sessions directly for gateway selection and
      // webhook processing, without importing all of OrderModule's providers
      // just for schema access.
      { name: CheckoutSession.name, schema: CheckoutSessionSchema },
    ]),
    BullModule.registerQueue({ name: PAYMENT_WEBHOOK_QUEUE }),
    // Needed for OrderService.createOrderFromPaidSession and
    // CheckoutService.cancelSession, called from the webhook processor.
    OrderModule,
  ],
  controllers: [PaymentAdminController, PaymentCheckoutController, PaymentWebhookController],
  providers: [
    PaymentGatewayConfigService,
    PaymentGatewaySelectionService,
    PaymentWebhookService,
    PaymentWebhookProcessor,
  ],
  exports: [PaymentGatewayConfigService],
})
export class PaymentModule {}
