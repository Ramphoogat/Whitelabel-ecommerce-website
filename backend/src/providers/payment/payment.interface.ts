export interface CreatePaymentOrderParams {
  amountInPaise: number; // always integer minor units — never float rupees/dollars
  currency: string; // e.g. 'INR', 'USD'
  receiptId: string; // our internal order/checkout-session id, for reconciliation
  notes?: Record<string, string>;
}

export interface CreatePaymentOrderResult {
  gatewayOrderId: string;
  // Whatever the frontend SDK needs to open the payment sheet for this gateway
  // (Razorpay: key_id + order_id; Stripe: client_secret; etc.)
  clientPayload: Record<string, unknown>;
}

export interface VerifyPaymentParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature?: string; // some gateways (Razorpay) sign the callback; others don't
}

export interface VerifyPaymentResult {
  isValid: boolean;
  status: 'paid' | 'failed' | 'pending';
  rawResponse?: Record<string, unknown>;
}

export interface RefundParams {
  gatewayPaymentId: string;
  amountInPaise: number;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  status: 'processed' | 'pending' | 'failed';
}

/**
 * Every gateway (Razorpay, Cashfree, PhonePe, PayU, Stripe, CCAvenue, Paytm,
 * Authorize.Net...) implements exactly this. The checkout/order services only
 * ever depend on this interface — never a vendor SDK type — so adding a new
 * gateway is "add one file that implements this", nothing else changes.
 */
export interface PaymentProvider {
  readonly name: string;
  createOrder(params: CreatePaymentOrderParams): Promise<CreatePaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  refund(params: RefundParams): Promise<RefundResult>;
  /**
   * Verifies an inbound webhook's signature using the gateway's own scheme.
   * This is a DIFFERENT secret/scheme from the checkout-callback signature
   * verified in verifyPayment — webhooks are signed with a separate
   * "webhook secret" configured in the gateway's dashboard.
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
}

export interface GatewayCredentials {
  [key: string]: string;
}
