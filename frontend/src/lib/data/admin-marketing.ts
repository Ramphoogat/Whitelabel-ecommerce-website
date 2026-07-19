export interface Coupon {
  code: string;
  type: "percentage" | "flat";
  value: number;
  usage: number;
  limit: number;
  active: boolean;
  expires: string;
}

export const COUPONS: Coupon[] = [
  { code: "WELCOME10", type: "percentage", value: 10, usage: 342, limit: 1000, active: true, expires: "2026-09-30" },
  { code: "FREESHIP", type: "flat", value: 250, usage: 118, limit: 500, active: true, expires: "2026-08-15" },
  { code: "MONSOON25", type: "percentage", value: 25, usage: 500, limit: 500, active: false, expires: "2026-07-01" },
];

export interface Banner {
  id: string;
  title: string;
  placement: string;
  tone: string;
  active: boolean;
}

export const BANNERS: Banner[] = [
  { id: "b1", title: "Autumn Collection — Week 03", placement: "Homepage Hero", tone: "#bd5b39", active: true },
  { id: "b2", title: "Free Shipping Over ₹3,000", placement: "Top Strip", tone: "#5f6b4e", active: true },
  { id: "b3", title: "Wool Season Preview", placement: "Category Page", tone: "#33506b", active: false },
];
