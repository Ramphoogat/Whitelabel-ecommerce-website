import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  domain: string;
  description: string;
  logoUrl: string;
  timezone: string;
  language: string;
  currency: string;
  businessType: string;
  address: string;
  city: string;
  country: string;
  pincode: string;
  legalName: string;
  taxId: string;
  website: string;
  socialInstagram: string;
  socialTwitter: string;
  socialFacebook: string;
  socialTiktok: string;
  orderConfirmationEmails: boolean;
  lowStockAlerts: boolean;
  abandonedCartReminders: boolean;
  newOrderAlerts: boolean;
  refundAlerts: boolean;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Aldergate & Co.",
  tagline: "Built to be worn, not just bought.",
  supportEmail: "hello@aldergate.co",
  supportPhone: "",
  domain: "aldergate.co",
  description: "Small-run fashion made from natural fibres.",
  logoUrl: "",
  timezone: "Asia/Kolkata",
  language: "en",
  currency: "INR",
  businessType: "fashion",
  address: "",
  city: "",
  country: "IN",
  pincode: "",
  legalName: "",
  taxId: "",
  website: "",
  socialInstagram: "",
  socialTwitter: "",
  socialFacebook: "",
  socialTiktok: "",
  orderConfirmationEmails: true,
  lowStockAlerts: true,
  abandonedCartReminders: false,
  newOrderAlerts: true,
  refundAlerts: true,
};

interface StoreSettingsState {
  settings: StoreSettings;
  savedAt: string | null;
  save: (s: Partial<StoreSettings>) => void;
}

export const useStoreSettings = create<StoreSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      savedAt: null,
      save: (patch) =>
        set((state) => ({
          settings: { ...state.settings, ...patch },
          savedAt: new Date().toISOString(),
        })),
    }),
    { name: "store-settings" },
  ),
);
