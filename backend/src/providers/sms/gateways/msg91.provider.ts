import { Logger } from '@nestjs/common';
import { GatewayCredentials, SendSmsParams, SendSmsResult, SmsProvider } from '../sms.interface';

const MSG91_API_BASE = 'https://control.msg91.com/api/v5';

export class Msg91Provider implements SmsProvider {
  readonly name = 'msg91';
  private readonly logger = new Logger(Msg91Provider.name);
  private readonly authKey: string;
  private readonly senderId: string;

  constructor(credentials: GatewayCredentials) {
    this.authKey = credentials.authKey;
    this.senderId = credentials.senderId;
    if (!this.authKey || !this.senderId) {
      throw new Error('MSG91 provider requires authKey and senderId credentials');
    }
  }

  async send(params: SendSmsParams): Promise<SendSmsResult> {
    const response = await fetch(`${MSG91_API_BASE}/flow/`, {
      method: 'POST',
      headers: {
        authkey: this.authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: this.senderId,
        mobiles: params.to.replace('+', ''),
        message: params.message,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`MSG91 send failed: ${response.status} ${errBody}`);
      throw new Error('Failed to send SMS via MSG91');
    }

    const data = (await response.json()) as { request_id?: string };
    return { messageId: data.request_id || '' };
  }
}
