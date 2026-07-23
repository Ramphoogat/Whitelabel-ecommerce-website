export type TxnType = "collection" | "refund" | "gateway_fee" | "withdrawal";
export type TxnStatus = "settled" | "pending" | "failed";
export type WithdrawalStatus = "completed" | "processing" | "failed";

export interface WalletTxn {
  id: string;
  type: TxnType;
  status: TxnStatus;
  amount: number;          // paise-free rupees; negative for money leaving the wallet
  gateway: string;         // provider key, e.g. "razorpay"
  gatewayLogo: string;
  reference: string;       // order no / payout ref
  date: string;            // ISO date
  note?: string;
}

export interface PayoutAccount {
  id: string;
  kind: "bank" | "upi";
  label: string;           // e.g. "HDFC Current ****4521"
  holder: string;
  detail: string;          // masked account no or UPI id
  ifsc?: string;
  isDefault: boolean;
  verified: boolean;
}

export interface Withdrawal {
  id: string;
  amount: number;
  accountId: string;
  accountLabel: string;
  status: WithdrawalStatus;
  requestedAt: string;
  completedAt?: string;
  utr?: string;            // bank reference
}

export const WALLET_TXNS: WalletTxn[] = [
  { id: "txn_1041", type: "collection", status: "settled", amount: 12499, gateway: "razorpay", gatewayLogo: "⚡", reference: "ORD-2189", date: "2026-07-22" },
  { id: "txn_1040", type: "collection", status: "settled", amount: 3299,  gateway: "phonepe",  gatewayLogo: "💜", reference: "ORD-2188", date: "2026-07-22" },
  { id: "txn_1039", type: "gateway_fee", status: "settled", amount: -250, gateway: "razorpay", gatewayLogo: "⚡", reference: "ORD-2189", date: "2026-07-22", note: "2% gateway fee" },
  { id: "txn_1038", type: "collection", status: "pending", amount: 8750,  gateway: "razorpay", gatewayLogo: "⚡", reference: "ORD-2187", date: "2026-07-21", note: "T+2 settlement" },
  { id: "txn_1037", type: "refund", status: "settled", amount: -1899, gateway: "phonepe", gatewayLogo: "💜", reference: "ORD-2174", date: "2026-07-21", note: "Customer refund" },
  { id: "txn_1036", type: "collection", status: "settled", amount: 5499,  gateway: "stripe",   gatewayLogo: "🟣", reference: "ORD-2186", date: "2026-07-20" },
  { id: "txn_1035", type: "withdrawal", status: "settled", amount: -30000, gateway: "—", gatewayLogo: "🏦", reference: "PAYOUT-0092", date: "2026-07-19", note: "To HDFC ****4521" },
  { id: "txn_1034", type: "collection", status: "settled", amount: 15998, gateway: "razorpay", gatewayLogo: "⚡", reference: "ORD-2185", date: "2026-07-19" },
  { id: "txn_1033", type: "collection", status: "settled", amount: 2199,  gateway: "phonepe",  gatewayLogo: "💜", reference: "ORD-2184", date: "2026-07-18" },
  { id: "txn_1032", type: "collection", status: "failed",  amount: 4599,  gateway: "payu",     gatewayLogo: "🔵", reference: "ORD-2183", date: "2026-07-18", note: "Capture failed" },
  { id: "txn_1031", type: "collection", status: "settled", amount: 9899,  gateway: "razorpay", gatewayLogo: "⚡", reference: "ORD-2182", date: "2026-07-17" },
  { id: "txn_1030", type: "gateway_fee", status: "settled", amount: -320, gateway: "stripe",  gatewayLogo: "🟣", reference: "ORD-2186", date: "2026-07-17", note: "2.9% + $0.30" },
  { id: "txn_1029", type: "collection", status: "settled", amount: 7250,  gateway: "cashfree", gatewayLogo: "💸", reference: "ORD-2181", date: "2026-07-16" },
  { id: "txn_1028", type: "collection", status: "settled", amount: 11499, gateway: "razorpay", gatewayLogo: "⚡", reference: "ORD-2180", date: "2026-07-15" },
  { id: "txn_1027", type: "withdrawal", status: "settled", amount: -25000, gateway: "—", gatewayLogo: "🏦", reference: "PAYOUT-0091", date: "2026-07-12", note: "To HDFC ****4521" },
  { id: "txn_1026", type: "collection", status: "settled", amount: 6399,  gateway: "phonepe",  gatewayLogo: "💜", reference: "ORD-2179", date: "2026-07-12" },
];

export const PAYOUT_ACCOUNTS: PayoutAccount[] = [
  { id: "acc_1", kind: "bank", label: "HDFC Current", holder: "Shoplux Retail Pvt Ltd", detail: "XXXXXX4521", ifsc: "HDFC0001234", isDefault: true, verified: true },
  { id: "acc_2", kind: "bank", label: "ICICI Savings", holder: "Shoplux Retail Pvt Ltd", detail: "XXXXXX8837", ifsc: "ICIC0004567", isDefault: false, verified: true },
  { id: "acc_3", kind: "upi",  label: "Business UPI", holder: "Shoplux Retail", detail: "shoplux@okhdfcbank", isDefault: false, verified: false },
];

export const WITHDRAWALS: Withdrawal[] = [
  { id: "wd_0092", amount: 30000, accountId: "acc_1", accountLabel: "HDFC Current ****4521", status: "completed", requestedAt: "2026-07-19", completedAt: "2026-07-20", utr: "UTR2607198812" },
  { id: "wd_0091", amount: 25000, accountId: "acc_1", accountLabel: "HDFC Current ****4521", status: "completed", requestedAt: "2026-07-12", completedAt: "2026-07-13", utr: "UTR2607124409" },
  { id: "wd_0090", amount: 25000, accountId: "acc_2", accountLabel: "ICICI Savings ****8837", status: "failed", requestedAt: "2026-07-08", utr: undefined },
];

export const MIN_WITHDRAWAL = 500;
