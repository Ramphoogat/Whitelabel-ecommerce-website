export interface ShippingZone {
  id: string;
  name: string;
  regions: string;
  method: string;
  rate: number;
  eta: string;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  { id: "z1", name: "Metro", regions: "Mumbai, Delhi, Bengaluru, Chennai", method: "Standard", rate: 0, eta: "2–4 days" },
  { id: "z2", name: "Rest of India", regions: "All other pin codes", method: "Standard", rate: 9900, eta: "4–7 days" },
  { id: "z3", name: "Metro Express", regions: "Mumbai, Delhi, Bengaluru, Chennai", method: "Express", rate: 25000, eta: "1–2 days" },
];

export interface Carrier {
  id: string;
  name: string;
  active: boolean;
  apiKey?: string;
  accountEmail?: string;
  accountId?: string;
  webhookSecret?: string;
}

export const CARRIERS: Carrier[] = [
  { id: "shiprocket", name: "Shiprocket", active: true, apiKey: "sr_live_••••••••", accountEmail: "logistics@mystore.com" },
  { id: "delhivery", name: "Delhivery", active: true, apiKey: "dl_••••••••", accountId: "DL-00412" },
  { id: "bluedart", name: "BlueDart", active: false },
  { id: "xpressbees", name: "XpressBees", active: false },
];
