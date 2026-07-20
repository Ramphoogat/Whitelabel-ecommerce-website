"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BusinessType, StoreThemeConfig, ThemeTokens } from "@/lib/theme/types";
import { DEFAULT_STORE_THEME, THEME_PRESETS } from "@/lib/theme/presets";
import { getStorefrontConfig } from "@/lib/api/organization.api";

/** postMessage payload the theme studio sends into its preview iframes. */
export interface ThemePreviewMessage {
  type: "THEME_PREVIEW";
  surface: "store" | "admin";
  theme: Partial<StoreThemeConfig> | null;
}

export function isThemePreviewMessage(data: unknown): data is ThemePreviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as ThemePreviewMessage).type === "THEME_PREVIEW"
  );
}

interface ThemeContextValue {
  businessType: BusinessType;
  tokens: ThemeTokens;
  /** Full effective storefront theme: saved config, overridden by a studio preview draft when present. */
  storeTheme: StoreThemeConfig;
  setAccent: (accent: string, accentSoft: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useStoreTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useStoreTheme must be used within ThemeProvider");
  return ctx;
}

/**
 * Reads the store's saved theme (organization.settings.theme via the public
 * /storefront/store-config endpoint) and applies the brand colour tokens at
 * the root. Colour/logo are runtime settings, never a rebuild — this provider
 * is the mechanism. Falls back to the businessType preset when the backend
 * is unreachable.
 *
 * When this document is rendered inside the theme studio's preview iframe,
 * the studio posts draft themes into it; the draft overrides the saved theme
 * for this window only — the real storefront never sees a draft.
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
  const [previewDraft, setPreviewDraft] = useState<Partial<StoreThemeConfig> | null>(null);

  const configQuery = useQuery({
    queryKey: ["store-config"],
    queryFn: getStorefrontConfig,
    retry: 0,
    staleTime: 60_000,
  });

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!isThemePreviewMessage(e.data) || e.data.surface !== "store") return;
      setPreviewDraft(e.data.theme);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const storeTheme: StoreThemeConfig = useMemo(
    () => ({ ...DEFAULT_STORE_THEME, ...(configQuery.data?.theme ?? {}), ...(previewDraft ?? {}) }),
    [configQuery.data, previewDraft],
  );

  // Saved theme (or a preview draft) becomes the live token set — until the
  // visitor plays with the header's live-reskin swatch, which is ephemeral.
  useEffect(() => {
    if (!configQuery.isSuccess && !previewDraft) return;
    setTokens({
      accent: storeTheme.accent,
      accentInk: storeTheme.accentInk,
      accentSoft: storeTheme.accentSoft,
      secondary: storeTheme.secondary,
      secondarySoft: storeTheme.secondarySoft,
    });
  }, [configQuery.isSuccess, previewDraft, storeTheme]);

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
    <ThemeContext.Provider value={{ businessType, tokens, storeTheme, setAccent }}>
      <div style={style} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
