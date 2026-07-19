export interface PaymentOptionModeDto {
  code: string;
  label: string;
  icon: string;
  gateways: string[]; // active gateway names supporting this mode, sorted by priority
}

export interface PaymentOptionsResponseDto {
  modes: PaymentOptionModeDto[];
}
