import { BadRequestException } from '@nestjs/common';
import { GatewayCredentials, MailProvider } from './mail.interface';
import { SmtpProvider } from './gateways/smtp.provider';
import { SendgridProvider } from './gateways/sendgrid.provider';

const MAIL_REGISTRY: Record<string, new (credentials: GatewayCredentials) => MailProvider> = {
  smtp: SmtpProvider,
  sendgrid: SendgridProvider,
  // mailgun: MailgunProvider,
  // ses: SesProvider,
};

export function createMailProvider(providerName: string, credentials: GatewayCredentials): MailProvider {
  const ProviderClass = MAIL_REGISTRY[providerName];
  if (!ProviderClass) {
    throw new BadRequestException(`Unknown or unimplemented mail provider: ${providerName}`);
  }
  return new ProviderClass(credentials);
}

export const SUPPORTED_MAIL_PROVIDERS = Object.keys(MAIL_REGISTRY);
