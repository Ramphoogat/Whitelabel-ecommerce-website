export type BusinessType = "fashion" | "grocery" | "generic";

export interface ThemeTokens {
  accent: string;
  accentInk: string;
  accentSoft: string;
  secondary: string;
  secondarySoft: string;
}

export interface ThemePreset {
  businessType: BusinessType;
  label: string;
  /** short line describing what this vertical's storefront needs that others don't */
  note: string;
  tokens: ThemeTokens;
  /** feature toggles the theme bundle exposes on the product card */
  productCard: {
    showQuantityStepper: boolean;
    showVariantSwatches: boolean;
    showUnitSelector: boolean;
  };
}

/** A small set of accent swatches the storefront can retint into live — the signature element. */
export interface AccentSwatch {
  name: string;
  accent: string;
  accentSoft: string;
}
