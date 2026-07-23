import type {
  AccentSwatch,
  BusinessType,
  CornerStyle,
  FontKey,
  GridDensity,
  HeadingScale,
  HomeSectionKey,
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
  { key: "cormorant", label: "Cormorant Garamond", stack: "var(--font-cormorant), Georgia, serif" },
  { key: "playfair", label: "Playfair Display", stack: "var(--font-playfair), Georgia, serif" },
  { key: "fraunces", label: "Fraunces", stack: "var(--font-fraunces), Georgia, serif" },
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

/** Labels + descriptions for the reorderable home-page section builder. */
export const HOME_SECTION_META: Record<HomeSectionKey, { label: string; hint: string }> = {
  categories:   { label: "Category strip",  hint: "pill links to each category" },
  arrivals:     { label: "New arrivals",    hint: "latest products, grid or slider" },
  campaign:     { label: "Campaign band",   hint: "editorial image + copy block" },
  values:       { label: "Value props",     hint: "the four brand promises" },
  testimonials: { label: "Testimonials",    hint: "customer quotes" },
  collection:   { label: "Full collection", hint: "the complete product grid" },
  blog:         { label: "From the blog",   hint: "latest published posts" },
};

export const DEFAULT_HOME_SECTIONS: HomeSectionKey[] = [
  "categories",
  "arrivals",
  "campaign",
  "values",
  "testimonials",
  "collection",
  "blog",
];

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
  navStyle: "top",
  heroVariant: "editorial",
  gridDensity: 4,
  cardStyle: "glass",
  cardLayout: "vertical",
  sectionSpacing: "regular",
  footerStyle: "columns",
  homeSections: DEFAULT_HOME_SECTIONS,
  productSlider: false,
  backToTop: true,
  smoothScroll: true,
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
  // The business-vertical palettes, as brand-colour-only presets. (The
  // fashion vertical is omitted — it's identical to Glacier's palette.)
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

/**
 * Premium presets: complete branded looks — every colour token plus display
 * and body fonts. Design rules: one restrained accent used sparingly (never
 * as a background wash), near-black or warm-ivory canvases instead of pure
 * #000/#fff, muted desaturated secondaries, hairline borders, pill buttons.
 * Like STYLE_PRESETS they never touch layout choices.
 */
export const PREMIUM_PRESETS: StylePreset[] = [
  {
    name: "Noir Atelier",
    note: "near-black · warm gold",
    theme: {
      accent: "#C8A96E", accentInk: "#14120c", accentSoft: "#23202c",
      secondary: "#8a8fa3", secondarySoft: "#1c1c26",
      background: "#0b0b12", surface: "#16161f", ink: "#ece7dc", inkSoft: "#9a97a5", line: "#28283a",
      fontDisplay: "cormorant", fontBody: "inter",
    },
  },
  {
    name: "Ivory & Gold",
    note: "gallery white · brass",
    theme: {
      accent: "#b08d4f", accentInk: "#ffffff", accentSoft: "#f3ead9",
      secondary: "#2b2724", secondarySoft: "#eeeae2",
      background: "#faf7f0", surface: "#ffffff", ink: "#1f1b16", inkSoft: "#857d6f", line: "#eae3d5",
      fontDisplay: "cormorant", fontBody: "inter",
    },
  },
  {
    name: "Emerald Estate",
    note: "deep green · gilt",
    theme: {
      accent: "#1e5c46", accentInk: "#f2efe4", accentSoft: "#e2ebe4",
      secondary: "#b3873b", secondarySoft: "#f0e6cf",
      background: "#f5f4ec", surface: "#fbfbf5", ink: "#1d2721", inkSoft: "#6b7a70", line: "#e0e2d5",
      fontDisplay: "playfair", fontBody: "inter",
    },
  },
  {
    name: "Sapphire Maison",
    note: "ink navy · brass",
    theme: {
      accent: "#1e3a5f", accentInk: "#eef2f7", accentSoft: "#e3e9f1",
      secondary: "#a8894e", secondarySoft: "#f0e9d8",
      background: "#f6f6f1", surface: "#fcfcf8", ink: "#1a2330", inkSoft: "#6e7889", line: "#e3e4dd",
      fontDisplay: "playfair", fontBody: "inter",
    },
  },
  {
    name: "Bordeaux",
    note: "wine · champagne",
    theme: {
      accent: "#6e1e2e", accentInk: "#f7ecd9", accentSoft: "#f1e2e2",
      secondary: "#c8b087", secondarySoft: "#f3ecdd",
      background: "#faf6f1", surface: "#fffdf9", ink: "#2a1b1c", inkSoft: "#867470", line: "#ecdfd6",
      fontDisplay: "cormorant", fontBody: "inter",
    },
  },
  {
    name: "Onyx Rosé",
    note: "charcoal · rose gold",
    theme: {
      accent: "#d9a3a0", accentInk: "#241417", accentSoft: "#2a2023",
      secondary: "#8d8593", secondarySoft: "#201c24",
      background: "#121014", surface: "#1b181e", ink: "#efe9e7", inkSoft: "#a29aa0", line: "#2c272e",
      fontDisplay: "fraunces", fontBody: "inter",
    },
  },
  {
    name: "Café Crème",
    note: "espresso · latte",
    theme: {
      accent: "#4a3728", accentInk: "#f4ede4", accentSoft: "#e9ddd0",
      secondary: "#a5866b", secondarySoft: "#efe5d9",
      background: "#f4ede4", surface: "#fdf9f3", ink: "#2e241c", inkSoft: "#8b7c6c", line: "#e7dbcc",
      fontDisplay: "cormorant", fontBody: "inter",
    },
  },
  {
    name: "Terra Atelier",
    note: "clay · forest",
    theme: {
      accent: "#a85a35", accentInk: "#fdf6ee", accentSoft: "#f3e3d8",
      secondary: "#33523f", secondarySoft: "#dfe8e0",
      background: "#f7f2ea", surface: "#fffdf8", ink: "#26211a", inkSoft: "#7f7666", line: "#e9e0d1",
      fontDisplay: "fraunces", fontBody: "inter",
    },
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
