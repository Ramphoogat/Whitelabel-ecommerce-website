/** Shape mirrors GET /checkout/payment-options from white-label-ecommerce-architecture.md §6.2 */
export interface PaymentMode {
  code: "upi" | "card" | "cod" | "netbanking";
  label: string;
  gateways: string[];
}

export const PAYMENT_OPTIONS: { modes: PaymentMode[] } = {
  modes: [
    { code: "upi", label: "UPI", gateways: ["Razorpay", "PhonePe"] },
    { code: "card", label: "Card", gateways: ["Stripe", "Razorpay"] },
    { code: "netbanking", label: "Net Banking", gateways: ["Razorpay"] },
    { code: "cod", label: "Cash on Delivery", gateways: [] },
  ],
};
