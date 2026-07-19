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

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay';
  private readonly logger = new Logger(RazorpayProvider.name);
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(credentials: GatewayCredentials) {
    this.keyId = credentials.keyId;
    this.keySecret = credentials.keySecret;
    this.webhookSecret = credentials.webhookSecret || '';
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay provider requires keyId and keySecret credentials');
    }
  }

  private authHeader(): string {
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<CreatePaymentOrderResult> {
    const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountInPaise,
        currency: params.currency,
        receipt: params.receiptId,
        notes: params.notes || {},
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`Razorpay createOrder failed: ${response.status} ${errBody}`);
      throw new Error('Failed to create Razorpay order');
    }

    const order = (await response.json()) as { id: string };

    return {
      gatewayOrderId: order.id,
      clientPayload: {
        keyId: this.keyId,
        orderId: order.id,
        amount: params.amountInPaise,
        currency: params.currency,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    // Razorpay's checkout callback signs: order_id + "|" + payment_id with keySecret (HMAC-SHA256)
    const expectedSignature = createHmac('sha256', this.keySecret)
      .update(`${params.gatewayOrderId}|${params.gatewayPaymentId}`)
      .digest('hex');

    const isValid = expectedSignature === params.signature;

    return {
      isValid,
      status: isValid ? 'paid' : 'failed',
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const response = await fetch(
      `${RAZORPAY_API_BASE}/payments/${params.gatewayPaymentId}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: params.amountInPaise, notes: { reason: params.reason } }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`Razorpay refund failed: ${response.status} ${errBody}`);
      return { refundId: '', status: 'failed' };
    }

    const refund = (await response.json()) as { id: string; status: string };
    return {
      refundId: refund.id,
      status: refund.status === 'processed' ? 'processed' : 'pending',
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!this.webhookSecret) {
      this.logger.error('Razorpay webhookSecret credential is not configured');
      return false;
    }
    const expected = createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(signatureHeader, 'hex');
    if (expectedBuf.length !== actualBuf.length) return false;

    return timingSafeEqual(expectedBuf, actualBuf);
  }
}
