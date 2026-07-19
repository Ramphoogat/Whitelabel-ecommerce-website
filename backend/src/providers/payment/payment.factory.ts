import { BadRequestException } from '@nestjs/common';
import { GatewayCredentials, PaymentProvider } from './payment.interface';
import { RazorpayProvider } from './gateways/razorpay.provider';
import { StripeProvider } from './gateways/stripe.provider';

// Add one entry here per new gateway file — nothing else in the app changes.
const GATEWAY_REGISTRY: Record<
  string,
  new (credentials: GatewayCredentials) => PaymentProvider
> = {
  razorpay: RazorpayProvider,
  stripe: StripeProvider,
  // cashfree: CashfreeProvider,
  // phonepe: PhonePeProvider,
  // payu: PayUProvider,
  // ccavenue: CCAvenueProvider,
  // paytm: PaytmProvider,
  // authorize_net: AuthorizeNetProvider,
};

export function createPaymentProvider(
  gatewayName: string,
  credentials: GatewayCredentials,
): PaymentProvider {
  const ProviderClass = GATEWAY_REGISTRY[gatewayName];
  if (!ProviderClass) {
    throw new BadRequestException(`Unknown or unimplemented payment gateway: ${gatewayName}`);
  }
  return new ProviderClass(credentials);
}

export const SUPPORTED_GATEWAYS = Object.keys(GATEWAY_REGISTRY);
