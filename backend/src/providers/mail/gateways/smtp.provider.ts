import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { GatewayCredentials, MailProvider, SendMailParams, SendMailResult } from '../mail.interface';

export class SmtpProvider implements MailProvider {
  readonly name = 'smtp';
  private readonly logger = new Logger(SmtpProvider.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(credentials: GatewayCredentials) {
    const { host, port, user, password, fromAddress, secure } = credentials;
    if (!host || !user || !password) {
      throw new Error('SMTP provider requires host, user, and password credentials');
    }

    this.fromAddress = fromAddress || user;
    this.transporter = nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: secure === 'true',
      auth: { user, pass: password },
    });
  }

  async send(params: SendMailParams): Promise<SendMailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      return { messageId: info.messageId };
    } catch (err) {
      this.logger.error(`SMTP send failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
