/** Mirrors payment_gateway_configs from white-label-ecommerce-architecture.md §6.1 */
export interface GatewayConfig {
  provider: string;
  label: string;
  isActive: boolean;
  supportedModes: ("upi" | "card" | "netbanking" | "wallet")[];
  priority: number;
}

export const GATEWAY_CONFIGS: GatewayConfig[] = [
  { provider: "razorpay", label: "Razorpay", isActive: true, supportedModes: ["upi", "card", "netbanking"], priority: 1 },
  { provider: "phonepe", label: "PhonePe", isActive: true, supportedModes: ["upi", "wallet"], priority: 2 },
  { provider: "stripe", label: "Stripe", isActive: true, supportedModes: ["card"], priority: 1 },
  { provider: "cashfree", label: "Cashfree", isActive: false, supportedModes: ["upi", "card", "netbanking"], priority: 3 },
  { provider: "payu", label: "PayU", isActive: false, supportedModes: ["card", "netbanking"], priority: 3 },
  { provider: "ccavenue", label: "CCAvenue", isActive: false, supportedModes: ["card", "netbanking"], priority: 4 },
];
