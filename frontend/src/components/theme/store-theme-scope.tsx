"use client";

import { useMemo } from "react";
import { useStoreTheme } from "./theme-provider";
import {
  CORNER_STYLES,
  HEADING_SCALES,
  SECTION_SPACINGS,
  TYPE_SCALES,
  fontStack,
  monoStack,
} from "@/lib/theme/presets";

/**
 * Applies the merchant's full saved theme to the customer storefront only —
 * canvas colours, typography (family + scale), corner radius, section
 * rhythm, and the default appearance. Brand accent vars already cascade
 * from ThemeProvider at the root; the admin dashboard deliberately keeps
 * its own separately-themed canvas.
 *
 * Custom canvas colours are light-theme values, so when the merchant
 * defaults the storefront to dark we let the [data-theme="dark"] token set
 * win instead of pinning light neutrals inline.
 */
export function StoreThemeScope({ children }: { children: React.ReactNode }) {
  const { storeTheme } = useStoreTheme();

  const style = useMemo(() => {
    const corners = CORNER_STYLES[storeTheme.cornerStyle] ?? CORNER_STYLES.soft;
    const vars: Record<string, string> = {
      "--radius-sm": corners.sm,
      "--radius-md": corners.md,
      "--radius-lg": corners.lg,
      "--font-display": fontStack(storeTheme.fontDisplay),
      "--font-body": fontStack(storeTheme.fontBody),
      "--font-mono": monoStack(storeTheme.fontMono),
      "--type-body": (TYPE_SCALES[storeTheme.typeScale] ?? TYPE_SCALES.regular).body,
      "--type-display": (HEADING_SCALES[storeTheme.headingScale] ?? HEADING_SCALES.classic).display,
      "--section-y": (SECTION_SPACINGS[storeTheme.sectionSpacing] ?? SECTION_SPACINGS.regular).y,
    };
    if (!storeTheme.darkModeDefault) {
      vars["--bone"] = storeTheme.background;
      vars["--surface"] = storeTheme.surface;
      vars["--ink"] = storeTheme.ink;
      vars["--ink-soft"] = storeTheme.inkSoft;
      vars["--line"] = storeTheme.line;
    }
    return {
      ...vars,
      // Same layered wash as body in globals.css, but reading the (possibly
      // overridden) tokens on this scope.
      background:
        "radial-gradient(ellipse 70% 45% at 50% -8%, color-mix(in srgb, var(--accent) 9%, transparent), transparent), var(--bone)",
      color: "var(--ink)",
      fontFamily: "var(--font-body)",
    } as React.CSSProperties;
  }, [storeTheme]);

  return (
    <div
      data-theme={storeTheme.darkModeDefault ? "dark" : undefined}
      data-cards={storeTheme.cardStyle}
      style={style}
      className="flex min-h-full flex-1 flex-col"
    >
      {children}
    </div>
  );
}
