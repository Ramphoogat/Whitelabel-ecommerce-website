export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendMailResult {
  messageId: string;
}

export interface GatewayCredentials {
  [key: string]: string;
}

export interface MailProvider {
  readonly name: string;
  send(params: SendMailParams): Promise<SendMailResult>;
}
