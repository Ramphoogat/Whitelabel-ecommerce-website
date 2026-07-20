"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUiStore } from "@/stores/ui-store";
import { getOrganizationSettings } from "@/lib/api/admin.api";
import { CORNER_STYLES, DEFAULT_STORE_THEME, fontStack, monoStack } from "@/lib/theme/presets";
import { isThemePreviewMessage } from "@/components/theme/theme-provider";
import type { StoreThemeConfig } from "@/lib/theme/types";

const AdminThemeContext = createContext<StoreThemeConfig>(DEFAULT_STORE_THEME);

/** The effective admin-panel theme (saved adminTheme, or a studio preview draft in the preview iframe). */
export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

/**
 * Applies the saved organization.settings.adminTheme to the dashboard —
 * edited independently from the storefront theme in Settings › Theme — plus
 * the staff user's own persisted light/dark preference.
 *
 * Structure matters here: the custom vars sit on an OUTER wrapper and the
 * [data-theme] attribute on an INNER one, so in dark mode the arctic-night
 * CSS token set (globals.css) beats the inherited light-theme customs — the
 * dark variant stays a designed palette, never an inversion of the customs.
 *
 * Inside the theme studio's preview iframe, a posted draft overrides the
 * saved theme for this window only.
 */
export function AdminThemeScope({ children }: { children: React.ReactNode }) {
  const mode = useUiStore((s) => s.themeMode);
  const [previewDraft, setPreviewDraft] = useState<Partial<StoreThemeConfig> | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin-organization-settings"],
    queryFn: getOrganizationSettings,
    retry: 0,
    staleTime: 60_000,
  });

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!isThemePreviewMessage(e.data) || e.data.surface !== "admin") return;
      setPreviewDraft(e.data.theme);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const theme: StoreThemeConfig = useMemo(
    () => ({
      ...DEFAULT_STORE_THEME,
      ...(settingsQuery.data?.adminTheme ?? {}),
      ...(previewDraft ?? {}),
    }),
    [settingsQuery.data, previewDraft],
  );

  const style = useMemo(() => {
    const corners = CORNER_STYLES[theme.cornerStyle] ?? CORNER_STYLES.soft;
    const vars: Record<string, string> = {
      "--radius-sm": corners.sm,
      "--radius-md": corners.md,
      "--radius-lg": corners.lg,
      "--font-display": fontStack(theme.fontDisplay),
      "--font-body": fontStack(theme.fontBody),
      "--font-mono": monoStack(theme.fontMono),
      fontFamily: "var(--font-body)",
    };
    if (mode === "light") {
      vars["--accent"] = theme.accent;
      vars["--accent-ink"] = theme.accentInk;
      vars["--accent-soft"] = theme.accentSoft;
      vars["--secondary"] = theme.secondary;
      vars["--secondary-soft"] = theme.secondarySoft;
      vars["--bone"] = theme.background;
      vars["--surface"] = theme.surface;
      vars["--ink"] = theme.ink;
      vars["--ink-soft"] = theme.inkSoft;
      vars["--line"] = theme.line;
    }
    return vars as React.CSSProperties;
  }, [theme, mode]);

  return (
    <AdminThemeContext.Provider value={theme}>
      <div style={style} className="contents">
        <div
          data-theme={mode}
          data-density={theme.density}
          data-panels={theme.panelStyle}
          className="contents"
        >
          {children}
        </div>
      </div>
    </AdminThemeContext.Provider>
  );
}
