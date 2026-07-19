import { Logger } from '@nestjs/common';
import { GatewayCredentials, SendSmsParams, SendSmsResult, SmsProvider } from '../sms.interface';

export class TwilioProvider implements SmsProvider {
  readonly name = 'twilio';
  private readonly logger = new Logger(TwilioProvider.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;

  constructor(credentials: GatewayCredentials) {
    this.accountSid = credentials.accountSid;
    this.authToken = credentials.authToken;
    this.fromNumber = credentials.fromNumber;
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio provider requires accountSid, authToken, and fromNumber credentials');
    }
  }

  async send(params: SendSmsParams): Promise<SendSmsResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: params.to,
      From: this.fromNumber,
      Body: params.message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`Twilio send failed: ${response.status} ${errBody}`);
      throw new Error('Failed to send SMS via Twilio');
    }

    const data = (await response.json()) as { sid: string };
    return { messageId: data.sid };
  }
}
