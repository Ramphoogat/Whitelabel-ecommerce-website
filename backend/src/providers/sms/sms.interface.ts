export interface SendSmsParams {
  to: string; // E.164 format, e.g. +919999999999
  message: string;
}

export interface SendSmsResult {
  messageId: string;
}

export interface GatewayCredentials {
  [key: string]: string;
}

export interface SmsProvider {
  readonly name: string;
  send(params: SendSmsParams): Promise<SendSmsResult>;
}
