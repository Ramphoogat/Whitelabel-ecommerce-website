"use client";

import { useState } from "react";
import { ACCENT_SWATCHES } from "@/lib/theme/presets";

const TABS = ["General", "Theme", "Organization", "Notifications"] as const;
type Tab = (typeof TABS)[number];

export function SettingsTabs() {
  const [tab, setTab] = useState<Tab>("General");
  const [accent, setAccent] = useState(ACCENT_SWATCHES[0].accent);

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

      <div className="mt-6 max-w-xl">
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
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Brand accent</p>
            <div className="mt-3 flex gap-2.5">
              {ACCENT_SWATCHES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setAccent(s.accent)}
                  aria-label={s.name}
                  className="size-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: s.accent,
                    boxShadow: accent === s.accent ? "0 0 0 2px var(--bone), 0 0 0 3.5px var(--ink)" : "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              This colour updates <code className="font-mono text-ink">organization.settings.theme</code> and
              takes effect on the storefront instantly — no redeploy.
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

        <button className="mt-8 rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
          Save changes
        </button>
      </div>
    </div>
  );
}
