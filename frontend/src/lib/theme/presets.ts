import type {
  AccentSwatch,
  BusinessType,
  CornerStyle,
  FontKey,
  GridDensity,
  HeadingScale,
  MonoFontKey,
  SectionSpacing,
  StoreThemeConfig,
  ThemePreset,
  TypeScale,
} from "./types";

export const THEME_PRESETS: Record<BusinessType, ThemePreset> = {
  fashion: {
    businessType: "fashion",
    label: "Fashion & Apparel",
    note: "size/colour swatches on the card, lookbook-style hero",
    tokens: {
      accent: "#4b9ec4",
      accentInk: "#0c2431",
      accentSoft: "#dcecf4",
      secondary: "#74b0a0",
      secondarySoft: "#dceee7",
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
      accent: "#74b0a0",
      accentInk: "#0d2a23",
      accentSoft: "#dceee7",
      secondary: "#4b9ec4",
      secondarySoft: "#dcecf4",
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
      accent: "#9d8fc7",
      accentInk: "#241d3a",
      accentSoft: "#e9e4f4",
      secondary: "#4b9ec4",
      secondarySoft: "#dcecf4",
    },
    productCard: {
      showQuantityStepper: false,
      showVariantSwatches: false,
      showUnitSelector: false,
    },
  },
};

/**
 * Curated font stacks the merchant can pick from. Keys are what's stored in
 * organization.settings.theme; the var()-based stacks resolve to the fonts
 * already loaded by next/font in the root layout.
 */
export const FONT_OPTIONS: { key: FontKey; label: string; stack: string }[] = [
  { key: "grotesk", label: "Space Grotesk", stack: "var(--font-grotesk), ui-sans-serif, system-ui, sans-serif" },
  { key: "inter", label: "Inter", stack: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" },
  { key: "plexmono", label: "IBM Plex Mono", stack: "var(--font-plexmono), ui-monospace, monospace" },
  { key: "system", label: "System Sans", stack: "ui-sans-serif, system-ui, sans-serif" },
  { key: "serif", label: "Editorial Serif", stack: "Georgia, 'Times New Roman', serif" },
];

export function fontStack(key: FontKey): string {
  return (FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0]).stack;
}

/** Each corner style is a bundle for the three radius tokens the whole UI reads. */
export const CORNER_STYLES: Record<CornerStyle, { label: string; sm: string; md: string; lg: string }> = {
  sharp: { label: "Sharp", sm: "2px", md: "4px", lg: "6px" },
  soft: { label: "Soft", sm: "8px", md: "12px", lg: "20px" },
  round: { label: "Round", sm: "14px", md: "22px", lg: "32px" },
};

export const MONO_FONT_OPTIONS: { key: MonoFontKey; label: string; stack: string }[] = [
  { key: "plexmono", label: "IBM Plex Mono", stack: "var(--font-plexmono), ui-monospace, monospace" },
  { key: "sysmono", label: "System Mono", stack: "ui-monospace, 'Cascadia Mono', Consolas, monospace" },
];

export function monoStack(key: MonoFontKey): string {
  return (MONO_FONT_OPTIONS.find((f) => f.key === key) ?? MONO_FONT_OPTIONS[0]).stack;
}

/** Body-copy multiplier (--type-body) — consumed by prose on the storefront. */
export const TYPE_SCALES: Record<TypeScale, { label: string; body: string }> = {
  compact: { label: "Compact", body: "0.92" },
  regular: { label: "Regular", body: "1" },
  large: { label: "Large", body: "1.09" },
};

/** Display-heading multiplier (--type-display) — hero + section headings. */
export const HEADING_SCALES: Record<HeadingScale, { label: string; display: string }> = {
  subtle: { label: "Subtle", display: "0.86" },
  classic: { label: "Classic", display: "1" },
  dramatic: { label: "Dramatic", display: "1.16" },
};

/** Vertical rhythm between storefront sections (--section-y). */
export const SECTION_SPACINGS: Record<SectionSpacing, { label: string; y: string }> = {
  dense: { label: "Dense", y: "2.25rem" },
  regular: { label: "Regular", y: "4rem" },
  airy: { label: "Airy", y: "6.5rem" },
};

/** Desktop column count → grid classes (mobile always stays 2-up). */
export const GRID_DENSITY_CLASSES: Record<GridDensity, string> = {
  2: "grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2",
  3: "grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4",
};

/** Matches the :root light-theme values in globals.css and the backend schema defaults. */
export const DEFAULT_STORE_THEME: StoreThemeConfig = {
  accent: "#4b9ec4",
  accentInk: "#0c2431",
  accentSoft: "#dcecf4",
  secondary: "#74b0a0",
  secondarySoft: "#dceee7",
  background: "#f6f3ec",
  surface: "#fdfbf7",
  ink: "#232830",
  inkSoft: "#7c828c",
  line: "#e4e0d4",
  fontDisplay: "grotesk",
  fontBody: "inter",
  fontMono: "plexmono",
  typeScale: "regular",
  headingScale: "classic",
  cornerStyle: "soft",
  headerStyle: "split",
  heroVariant: "editorial",
  gridDensity: 4,
  cardStyle: "glass",
  sectionSpacing: "regular",
  sidebarStyle: "expanded",
  density: "comfortable",
  panelStyle: "card",
  logoUrl: "",
  darkModeDefault: false,
};

export interface StylePreset {
  name: string;
  note: string;
  /**
   * Merged over the current draft — a style preset defines visual identity
   * (palette, type, shape, surface treatment), never page layout, so the
   * merchant's header/hero/grid/sidebar choices survive a preset switch.
   */
  theme: Partial<StoreThemeConfig>;
}

/**
 * One-click looks for the theme studio. Every palette here passes the
 * contrast guardrails (lib/theme/contrast.ts) out of the box — presets are
 * the safe starting points, the colour fields are the fine-tuning.
 * "Dark" presets are dark via their canvas colours (darkModeDefault stays
 * false) so the designed arctic-night variant remains untouched.
 */
export const STYLE_PRESETS: StylePreset[] = [
  {
    name: "Glacier",
    note: "the house look — creamy ice, glacier blue",
    theme: {
      accent: "#4b9ec4", accentInk: "#0c2431", accentSoft: "#dcecf4",
      secondary: "#74b0a0", secondarySoft: "#dceee7",
      background: "#f6f3ec", surface: "#fdfbf7", ink: "#232830", inkSoft: "#7c828c", line: "#e4e0d4",
      fontDisplay: "grotesk", fontBody: "inter", cornerStyle: "soft", cardStyle: "glass", panelStyle: "card",
    },
  },
  {
    name: "Cyberpunk",
    note: "modern neon — deep violet night, cyan + magenta glow",
    theme: {
      accent: "#00e5ff", accentInk: "#00181d", accentSoft: "#0b2f38",
      secondary: "#ff2ec4", secondarySoft: "#38102e",
      background: "#0a0714", surface: "#151022", ink: "#ece8ff", inkSoft: "#9c93bd", line: "#2b2144",
      fontDisplay: "grotesk", fontBody: "inter", fontMono: "plexmono",
      cornerStyle: "sharp", cardStyle: "glass", panelStyle: "card",
    },
  },
  {
    name: "Neo-Brutalist",
    note: "retro brutalism — raw paper, hard black lines, mono headings",
    theme: {
      accent: "#d33a10", accentInk: "#ffffff", accentSoft: "#ffd9c9",
      secondary: "#1f3fb8", secondarySoft: "#dbe1f9",
      background: "#f2ede1", surface: "#ffffff", ink: "#111111", inkSoft: "#4d4a44", line: "#111111",
      fontDisplay: "plexmono", fontBody: "system",
      cornerStyle: "sharp", cardStyle: "outlined", panelStyle: "flat",
    },
  },
  {
    name: "Monochrome",
    note: "simple black & white — no colour, all typography",
    theme: {
      accent: "#111111", accentInk: "#ffffff", accentSoft: "#ebebeb",
      secondary: "#555555", secondarySoft: "#efefef",
      background: "#ffffff", surface: "#f6f6f6", ink: "#111111", inkSoft: "#666666", line: "#e3e3e3",
      fontDisplay: "inter", fontBody: "inter",
      cornerStyle: "soft", cardStyle: "flat", panelStyle: "flat",
    },
  },
  {
    name: "Midnight",
    note: "simple dark — near-black canvas, white accents",
    theme: {
      accent: "#dfe3e7", accentInk: "#0c0e11", accentSoft: "#23282e",
      secondary: "#8a93a6", secondarySoft: "#1c2127",
      background: "#0c0e11", surface: "#15181c", ink: "#f2f4f6", inkSoft: "#9ba3ab", line: "#262b31",
      fontDisplay: "inter", fontBody: "inter",
      cornerStyle: "soft", cardStyle: "flat", panelStyle: "flat",
    },
  },
  {
    name: "Ember",
    note: "bold orange against white and black",
    theme: {
      accent: "#ea580c", accentInk: "#ffffff", accentSoft: "#ffe4d1",
      secondary: "#16110d", secondarySoft: "#ebe5e0",
      background: "#ffffff", surface: "#fff6ef", ink: "#191310", inkSoft: "#6e5f55", line: "#f0ddcd",
      fontDisplay: "grotesk", fontBody: "inter",
      cornerStyle: "round", cardStyle: "flat", panelStyle: "card",
    },
  },
  {
    name: "Botanical",
    note: "garden greens, serif headings, warm gold",
    theme: {
      accent: "#3c7d4f", accentInk: "#ffffff", accentSoft: "#dcead9",
      secondary: "#b3873b", secondarySoft: "#f0e4c9",
      background: "#f3f6ee", surface: "#fcfef7", ink: "#22301f", inkSoft: "#66755f", line: "#dbe4cf",
      fontDisplay: "serif", fontBody: "inter",
      cornerStyle: "round", cardStyle: "outlined", panelStyle: "card",
    },
  },
  {
    name: "Lilac Pop",
    note: "playful violet + pink, rounded everything",
    theme: {
      accent: "#7c3aed", accentInk: "#ffffff", accentSoft: "#ebe1fc",
      secondary: "#db2777", secondarySoft: "#fadceb",
      background: "#faf8ff", surface: "#ffffff", ink: "#251d38", inkSoft: "#6f6590", line: "#e7e1f5",
      fontDisplay: "grotesk", fontBody: "inter",
      cornerStyle: "round", cardStyle: "glass", panelStyle: "card",
    },
  },
  // The business-vertical palettes, as brand-colour-only presets.
  {
    name: "Fashion & Apparel",
    note: "vertical palette — glacier + mint",
    theme: { accent: "#4b9ec4", accentInk: "#0c2431", accentSoft: "#dcecf4", secondary: "#74b0a0", secondarySoft: "#dceee7" },
  },
  {
    // Accent runs slightly deeper than the vertical's mint token so links
    // stay readable on light canvases (the raw mint sits ~2.2:1 on cream).
    name: "Grocery & Food",
    note: "vertical palette — mint + glacier",
    theme: { accent: "#55a189", accentInk: "#0d2a23", accentSoft: "#dceee7", secondary: "#4b9ec4", secondarySoft: "#dcecf4" },
  },
  {
    name: "General Store",
    note: "vertical palette — frost lavender",
    theme: { accent: "#9d8fc7", accentInk: "#241d3a", accentSoft: "#e9e4f4", secondary: "#4b9ec4", secondarySoft: "#dcecf4" },
  },
];

/** Shown in the header's live-reskin swatch — proves the same layout takes any brand palette. */
export const ACCENT_SWATCHES: AccentSwatch[] = [
  { name: "Glacier", accent: "#4b9ec4", accentSoft: "#dcecf4" },
  { name: "Mint", accent: "#74b0a0", accentSoft: "#dceee7" },
  { name: "Frost Lavender", accent: "#9d8fc7", accentSoft: "#e9e4f4" },
  { name: "Arctic Navy", accent: "#3d5a76", accentSoft: "#dde5ec" },
  { name: "Dune", accent: "#c2a878", accentSoft: "#f0e9da" },
];
