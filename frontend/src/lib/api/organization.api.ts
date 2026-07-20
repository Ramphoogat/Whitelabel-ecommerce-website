import { apiRequest } from "./client";
import type { StoreThemeConfig } from "@/lib/theme/types";

export interface StorefrontConfig {
  storeName: string;
  businessType: string;
  currency: string;
  language: string;
  theme: Partial<StoreThemeConfig>;
}

/** Public, unauthenticated — the storefront reads its own branding from here. */
export function getStorefrontConfig() {
  return apiRequest<StorefrontConfig>("/storefront/store-config");
}
