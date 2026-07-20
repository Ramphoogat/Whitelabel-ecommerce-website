"use client";

import { useState } from "react";
import { ThemeCustomizer } from "./theme-customizer";
import { useUiStore } from "@/stores/ui-store";

const TABS = ["General", "Theme", "Organization", "Notifications"] as const;
type Tab = (typeof TABS)[number];

export function SettingsTabs() {
  const [tab, setTab] = useState<Tab>("General");
  const { themeMode, setThemeMode } = useUiStore();

  return (
    <div>
      <div className="flex gap-1 border-b border-line/70">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
            style={{
              color: tab === t ? "var(--ink)" : "var(--ink-soft)",
              borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={tab === "Theme" ? "mt-6" : "mt-6 max-w-xl"}>
        {tab === "General" && (
          <div className="space-y-4">
            <label>
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Store name
              </span>
              <input defaultValue="Aldergate & Co." className="input-field" />
            </label>
            <label>
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Support email
              </span>
              <input defaultValue="hello@aldergate.co" className="input-field" />
            </label>
            <label>
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Domain
              </span>
              <input defaultValue="aldergate.co" className="input-field" />
            </label>
          </div>
        )}

        {tab === "Theme" && (
          <div>
            <ThemeCustomizer />

            <p className="mt-10 border-t border-line/70 pt-8 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Dashboard appearance
            </p>
            <div className="mt-3 flex gap-2">
              {(["light", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  aria-pressed={themeMode === mode}
                  className="rounded-full border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
                  style={{
                    borderColor: themeMode === mode ? "var(--accent)" : "var(--line)",
                    background: themeMode === mode ? "var(--accent-soft)" : "transparent",
                    color: themeMode === mode ? "var(--accent)" : "var(--ink)",
                  }}
                >
                  {mode === "light" ? "☀ Light" : "☾ Dark"}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              Saved to your preferences — the dashboard keeps this choice across sessions.
            </p>
          </div>
        )}

        {tab === "Organization" && (
          <div className="space-y-4">
            <label>
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Business type
              </span>
              <select defaultValue="fashion" className="input-field">
                <option value="fashion">Fashion & Apparel</option>
                <option value="grocery">Grocery & Food</option>
                <option value="generic">General Store</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Currency
              </span>
              <select defaultValue="INR" className="input-field">
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </label>
          </div>
        )}

        {tab === "Notifications" && (
          <div className="space-y-3">
            {["Order confirmation emails", "Low-stock alerts", "Abandoned cart reminders"].map((n) => (
              <label key={n} className="flex items-center justify-between rounded-[var(--radius-md)] border border-line px-4 py-3">
                <span className="text-[13px] text-ink">{n}</span>
                <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
              </label>
            ))}
          </div>
        )}

        {tab !== "Theme" && (
          <button className="mt-8 rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
            Save changes
          </button>
        )}
      </div>
    </div>
  );
}
