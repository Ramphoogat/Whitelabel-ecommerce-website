import { Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  CreatePaymentOrderParams,
  CreatePaymentOrderResult,
  GatewayCredentials,
  PaymentProvider,
  RefundParams,
  RefundResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
} from '../payment.interface';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeProvider.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(credentials: GatewayCredentials) {
    this.secretKey = credentials.secretKey;
    this.webhookSecret = credentials.webhookSecret || '';
    if (!this.secretKey) {
      throw new Error('Stripe provider requires a secretKey credential');
    }
  }

  private authHeader(): string {
    return `Bearer ${this.secretKey}`;
  }

  private toFormBody(payload: Record<string, string | number>): string {
    return Object.entries(payload)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<CreatePaymentOrderResult> {
    const response = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.toFormBody({
        amount: params.amountInPaise,
        currency: params.currency.toLowerCase(),
        'metadata[receiptId]': params.receiptId,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`Stripe createOrder failed: ${response.status} ${errBody}`);
      throw new Error('Failed to create Stripe PaymentIntent');
    }

    const intent = (await response.json()) as { id: string; client_secret: string };

    return {
      gatewayOrderId: intent.id,
      clientPayload: { clientSecret: intent.client_secret },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const response = await fetch(
      `${STRIPE_API_BASE}/payment_intents/${params.gatewayOrderId}`,
      { headers: { Authorization: this.authHeader() } },
    );

    if (!response.ok) {
      return { isValid: false, status: 'failed' };
    }

    const intent = (await response.json()) as { status: string };
    const isPaid = intent.status === 'succeeded';

    return {
      isValid: isPaid,
      status: isPaid ? 'paid' : intent.status === 'processing' ? 'pending' : 'failed',
      rawResponse: intent,
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const response = await fetch(`${STRIPE_API_BASE}/refunds`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.toFormBody({
        payment_intent: params.gatewayPaymentId,
        amount: params.amountInPaise,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`Stripe refund failed: ${response.status} ${errBody}`);
      return { refundId: '', status: 'failed' };
    }

    const refund = (await response.json()) as { id: string; status: string };
    return {
      refundId: refund.id,
      status: refund.status === 'succeeded' ? 'processed' : 'pending',
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!this.webhookSecret) {
      this.logger.error('Stripe webhookSecret credential is not configured');
      return false;
    }

    // Header format: "t=1690000000,v1=abcdef...,v0=..." — we only need v1.
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((part) => {
        const [key, value] = part.split('=');
        return [key, value];
      }),
    );
    const timestamp = parts['t'];
    const v1 = parts['v1'];
    if (!timestamp || !v1) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = createHmac('sha256', this.webhookSecret).update(signedPayload).digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(v1, 'hex');
    if (expectedBuf.length !== actualBuf.length) return false;

    return timingSafeEqual(expectedBuf, actualBuf);
  }
}
