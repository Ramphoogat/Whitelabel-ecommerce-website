export interface ShippingZone {
  name: string;
  regions: string;
  method: string;
  rate: number;
  eta: string;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  { name: "Metro", regions: "Mumbai, Delhi, Bengaluru, Chennai", method: "Standard", rate: 0, eta: "2–4 days" },
  { name: "Rest of India", regions: "All other pin codes", method: "Standard", rate: 99, eta: "4–7 days" },
  { name: "Metro Express", regions: "Mumbai, Delhi, Bengaluru, Chennai", method: "Express", rate: 250, eta: "1–2 days" },
];

export interface Carrier {
  name: string;
  active: boolean;
}

export const CARRIERS: Carrier[] = [
  { name: "Shiprocket", active: true },
  { name: "Delhivery", active: true },
  { name: "BlueDart", active: false },
  { name: "XpressBees", active: false },
];
