import { BadRequestException } from '@nestjs/common';
import { GatewayCredentials, SmsProvider } from './sms.interface';
import { Msg91Provider } from './gateways/msg91.provider';
import { TwilioProvider } from './gateways/twilio.provider';

const SMS_REGISTRY: Record<string, new (credentials: GatewayCredentials) => SmsProvider> = {
  msg91: Msg91Provider,
  twilio: TwilioProvider,
  // fast2sms: Fast2SmsProvider,
  // textlocal: TextlocalProvider,
};

export function createSmsProvider(providerName: string, credentials: GatewayCredentials): SmsProvider {
  const ProviderClass = SMS_REGISTRY[providerName];
  if (!ProviderClass) {
    throw new BadRequestException(`Unknown or unimplemented SMS provider: ${providerName}`);
  }
  return new ProviderClass(credentials);
}

export const SUPPORTED_SMS_PROVIDERS = Object.keys(SMS_REGISTRY);
