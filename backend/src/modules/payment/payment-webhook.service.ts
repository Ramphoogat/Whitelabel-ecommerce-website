import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from './schemas/webhook-event.schema';

export const PAYMENT_WEBHOOK_QUEUE = 'payment-webhooks';

export interface PaymentWebhookJobData {
  provider: string;
  providerEventId: string;
  eventType: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signatureForVerification?: string;
}

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(
    @InjectModel(WebhookEvent.name)
    private readonly webhookEventModel: Model<WebhookEventDocument>,
    @InjectQueue(PAYMENT_WEBHOOK_QUEUE) private readonly queue: Queue<PaymentWebhookJobData>,
  ) {}

  async recordAndEnqueue(
    provider: string,
    providerEventId: string,
    payload: Record<string, unknown>,
    jobData: PaymentWebhookJobData,
  ): Promise<{ isNew: boolean }> {
    try {
      await this.webhookEventModel.create({ provider, providerEventId, payload });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        this.logger.log(`Duplicate webhook event ignored: ${provider}/${providerEventId}`);
        return { isNew: false };
      }
      throw err;
    }

    await this.queue.add('process-payment-event', jobData, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return { isNew: true };
  }

  async markProcessed(providerEventId: string): Promise<void> {
    await this.webhookEventModel.updateOne(
      { providerEventId },
      { $set: { processedAt: new Date() } },
    );
  }

  async markFailed(providerEventId: string, error: string): Promise<void> {
    await this.webhookEventModel.updateOne(
      { providerEventId },
      { $set: { processingError: error } },
    );
  }
}
