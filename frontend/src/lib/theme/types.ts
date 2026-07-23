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

export type FontKey =
  | "grotesk"
  | "inter"
  | "plexmono"
  | "system"
  | "serif"
  | "cormorant"
  | "playfair"
  | "fraunces";
export type MonoFontKey = "plexmono" | "sysmono";
export type CornerStyle = "sharp" | "soft" | "round";
export type TypeScale = "compact" | "regular" | "large";
export type HeadingScale = "subtle" | "classic" | "dramatic";

// Storefront structure
export type HeaderStyle = "split" | "centered" | "minimal";
export type NavStyle = "top" | "sidebar";
export type HeroVariant = "editorial" | "immersive" | "minimal";
export type GridDensity = 2 | 3 | 4;
export type CardStyle = "glass" | "flat" | "outlined";
export type CardLayout = "vertical" | "horizontal" | "overlay";
export type SectionSpacing = "airy" | "regular" | "dense";
export type FooterStyle = "columns" | "centered" | "minimal";
/** Home-page bands the merchant can toggle and reorder. */
export type HomeSectionKey =
  | "categories"
  | "arrivals"
  | "campaign"
  | "values"
  | "testimonials"
  | "collection"
  | "blog";

// Admin structure
export type SidebarStyle = "expanded" | "compact" | "rail";
export type Density = "comfortable" | "compact";
export type PanelStyle = "card" | "flat";

/**
 * The full merchant-editable theme, persisted as
 * organization.settings.theme / .adminTheme on the backend (the storefront
 * one served publicly at /storefront/store-config). Every field maps onto a
 * CSS custom property or data attribute — no per-theme CSS forks.
 * Both surfaces share the shape; each ignores the other's structural fields.
 */
export interface StoreThemeConfig {
  accent: string;
  accentInk: string;
  accentSoft: string;
  secondary: string;
  secondarySoft: string;
  background: string;
  surface: string;
  ink: string;
  inkSoft: string;
  line: string;
  fontDisplay: FontKey;
  fontBody: FontKey;
  fontMono: MonoFontKey;
  typeScale: TypeScale;
  headingScale: HeadingScale;
  cornerStyle: CornerStyle;
  // storefront structure
  headerStyle: HeaderStyle;
  navStyle: NavStyle;
  heroVariant: HeroVariant;
  gridDensity: GridDensity;
  cardStyle: CardStyle;
  cardLayout: CardLayout;
  sectionSpacing: SectionSpacing;
  footerStyle: FooterStyle;
  /** ordered list of home-page sections; anything missing is hidden */
  homeSections: HomeSectionKey[];
  /** render product rows as an arrow/keyboard-driven slider instead of a grid */
  productSlider: boolean;
  /** floating back-to-top button once the page is scrolled */
  backToTop: boolean;
  /** animate anchor/programmatic scrolling */
  smoothScroll: boolean;
  // admin structure
  sidebarStyle: SidebarStyle;
  density: Density;
  panelStyle: PanelStyle;
  logoUrl: string;
  darkModeDefault: boolean;
}
