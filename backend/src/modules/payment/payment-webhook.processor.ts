import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PAYMENT_WEBHOOK_QUEUE, PaymentWebhookJobData, PaymentWebhookService } from './payment-webhook.service';
import { CheckoutSession, CheckoutSessionDocument } from '../order/schemas/checkout-session.schema';
import { OrderService } from '../order/order.service';
import { CheckoutService } from '../order/checkout.service';

const SUCCESS_EVENT_TYPES = new Set(['payment.captured', 'order.paid', 'payment_intent.succeeded']);
const FAILURE_EVENT_TYPES = new Set(['payment.failed', 'payment_intent.payment_failed']);

@Processor(PAYMENT_WEBHOOK_QUEUE)
export class PaymentWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentWebhookProcessor.name);

  constructor(
    @InjectModel(CheckoutSession.name)
    private readonly sessionModel: Model<CheckoutSessionDocument>,
    private readonly orderService: OrderService,
    private readonly checkoutService: CheckoutService,
    private readonly webhookService: PaymentWebhookService,
  ) {
    super();
  }

  async process(job: Job<PaymentWebhookJobData>): Promise<void> {
    const { provider, providerEventId, eventType, gatewayOrderId, gatewayPaymentId } = job.data;

    try {
      const session = await this.sessionModel.findOne({ gatewayOrderId });
      if (!session) {
        this.logger.warn(
          `No checkout session found for gatewayOrderId "${gatewayOrderId}" (${provider}/${eventType}) — ignoring`,
        );
        await this.webhookService.markProcessed(providerEventId);
        return;
      }

      if (SUCCESS_EVENT_TYPES.has(eventType)) {
        if (session.status === 'completed') {
          // Already turned into an order by an earlier delivery of this (or
          // an equivalent) event — nothing to do, this is expected on retry.
          await this.webhookService.markProcessed(providerEventId);
          return;
        }
        await this.orderService.createOrderFromPaidSession(
          (session._id as any).toString(),
          provider,
          gatewayPaymentId,
        );
      } else if (FAILURE_EVENT_TYPES.has(eventType)) {
        await this.checkoutService.cancelSession((session._id as any).toString());
      } else {
        this.logger.log(`Ignoring unhandled event type "${eventType}" from ${provider}`);
      }

      await this.webhookService.markProcessed(providerEventId);
    } catch (err) {
      await this.webhookService.markFailed(providerEventId, (err as Error).message);
      throw err; // let BullMQ's retry/backoff handle it
    }
  }
}
