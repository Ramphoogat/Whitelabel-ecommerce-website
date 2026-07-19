import type { AccentSwatch, BusinessType, ThemePreset } from "./types";

export const THEME_PRESETS: Record<BusinessType, ThemePreset> = {
  fashion: {
    businessType: "fashion",
    label: "Fashion & Apparel",
    note: "size/colour swatches on the card, lookbook-style hero",
    tokens: {
      accent: "#bd5b39",
      accentInk: "#ffffff",
      accentSoft: "#f3ded4",
      secondary: "#5f6b4e",
      secondarySoft: "#e3e6da",
    },
    productCard: {
      showQuantityStepper: false,
      showVariantSwatches: true,
      showUnitSelector: false,
    },
  },
  grocery: {
    businessType: "grocery",
    label: "Grocery & Food",
    note: "quantity stepper + unit selector, denser grid",
    tokens: {
      accent: "#4f7a3f",
      accentInk: "#ffffff",
      accentSoft: "#dfead7",
      secondary: "#c98a3e",
      secondarySoft: "#f2e2c8",
    },
    productCard: {
      showQuantityStepper: true,
      showVariantSwatches: false,
      showUnitSelector: true,
    },
  },
  generic: {
    businessType: "generic",
    label: "General Store",
    note: "neutral base — safe default before a vertical is chosen",
    tokens: {
      accent: "#8a5a9e",
      accentInk: "#ffffff",
      accentSoft: "#e9dcee",
      secondary: "#3f6b6b",
      secondarySoft: "#d9e6e6",
    },
    productCard: {
      showQuantityStepper: false,
      showVariantSwatches: false,
      showUnitSelector: false,
    },
  },
};

/** Shown in the header's live-reskin swatch — proves the same layout takes any brand palette. */
export const ACCENT_SWATCHES: AccentSwatch[] = [
  { name: "Clay", accent: "#bd5b39", accentSoft: "#f3ded4" },
  { name: "Moss", accent: "#4f7a3f", accentSoft: "#dfead7" },
  { name: "Plum", accent: "#8a5a9e", accentSoft: "#e9dcee" },
  { name: "Ink Blue", accent: "#33506b", accentSoft: "#d9e2e9" },
  { name: "Amber", accent: "#c98a3e", accentSoft: "#f2e2c8" },
];
