"use client";

import { ACCENT_SWATCHES } from "@/lib/theme/presets";
import { useStoreTheme } from "./theme-provider";

/**
 * The signature element: this single row of dots retints the entire storefront
 * live, in place — the visible proof that one codebase becomes any brand
 * through settings, not a redeploy. See white-label-ecommerce-architecture.md §4.
 */
export function ThemeSwatch() {
  const { tokens, setAccent } = useStoreTheme();

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Preview another brand palette">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft hidden sm:inline">
        Retint
      </span>
      <div className="flex items-center gap-1.5">
        {ACCENT_SWATCHES.map((s) => {
          const active = s.accent.toLowerCase() === tokens.accent.toLowerCase();
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setAccent(s.accent, s.accentSoft)}
              aria-label={`Preview ${s.name} palette`}
              aria-pressed={active}
              className="size-4 rounded-full transition-transform hover:scale-110 focus-visible:scale-110"
              style={{
                background: s.accent,
                boxShadow: active
                  ? `0 0 0 2px var(--bone), 0 0 0 3.5px ${s.accent}`
                  : "0 0 0 1px rgba(0,0,0,0.08)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
