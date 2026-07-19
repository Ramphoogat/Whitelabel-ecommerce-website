"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BusinessType, ThemeTokens } from "@/lib/theme/types";
import { THEME_PRESETS } from "@/lib/theme/presets";

interface ThemeContextValue {
  businessType: BusinessType;
  tokens: ThemeTokens;
  setAccent: (accent: string, accentSoft: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useStoreTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useStoreTheme must be used within ThemeProvider");
  return ctx;
}

/**
 * Reads the store's theme (in production: organization.settings.theme from Mongo).
 * Colour/logo are runtime settings, never a rebuild — this provider is the mechanism.
 */
export function ThemeProvider({
  businessType = "fashion",
  children,
}: {
  businessType?: BusinessType;
  children: React.ReactNode;
}) {
  const preset = THEME_PRESETS[businessType];
  const [tokens, setTokens] = useState<ThemeTokens>(preset.tokens);

  const setAccent = useCallback((accent: string, accentSoft: string) => {
    setTokens((t) => ({ ...t, accent, accentSoft }));
  }, []);

  const style = useMemo(
    () =>
      ({
        "--accent": tokens.accent,
        "--accent-ink": tokens.accentInk,
        "--accent-soft": tokens.accentSoft,
        "--secondary": tokens.secondary,
        "--secondary-soft": tokens.secondarySoft,
      }) as React.CSSProperties,
    [tokens],
  );

  return (
    <ThemeContext.Provider value={{ businessType, tokens, setAccent }}>
      <div style={style} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
