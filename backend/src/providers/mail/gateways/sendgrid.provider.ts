import { Logger } from '@nestjs/common';
import { GatewayCredentials, MailProvider, SendMailParams, SendMailResult } from '../mail.interface';

const SENDGRID_API_BASE = 'https://api.sendgrid.com/v3';

export class SendgridProvider implements MailProvider {
  readonly name = 'sendgrid';
  private readonly logger = new Logger(SendgridProvider.name);
  private readonly apiKey: string;
  private readonly fromAddress: string;

  constructor(credentials: GatewayCredentials) {
    this.apiKey = credentials.apiKey;
    this.fromAddress = credentials.fromAddress;
    if (!this.apiKey || !this.fromAddress) {
      throw new Error('SendGrid provider requires apiKey and fromAddress credentials');
    }
  }

  async send(params: SendMailParams): Promise<SendMailResult> {
    const response = await fetch(`${SENDGRID_API_BASE}/mail/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: this.fromAddress },
        subject: params.subject,
        content: [
          { type: 'text/plain', value: params.text || params.html.replace(/<[^>]+>/g, '') },
          { type: 'text/html', value: params.html },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`SendGrid send failed: ${response.status} ${errBody}`);
      throw new Error('Failed to send email via SendGrid');
    }

    const messageId = response.headers.get('x-message-id') || '';
    return { messageId };
  }
}
