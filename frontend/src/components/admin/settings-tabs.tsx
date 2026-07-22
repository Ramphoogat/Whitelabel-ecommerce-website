"use client";

import { useState } from "react";
import { ThemeCustomizer } from "./theme-customizer";
import { useUiStore } from "@/stores/ui-store";
import { useStoreSettings, DEFAULT_SETTINGS, type StoreSettings } from "@/stores/store-settings-store";

const TABS = ["General", "Theme", "Organization", "Notifications"] as const;
type Tab = (typeof TABS)[number];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "UTC",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-line/60 pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft/60">
      {children}
    </p>
  );
}

export function SettingsTabs() {
  const [tab, setTab] = useState<Tab>("General");
  const { themeMode, setThemeMode } = useUiStore();
  const { settings, savedAt, save } = useStoreSettings();

  /* ── draft state for each tab ── */
  const [general, setGeneral] = useState({
    storeName: settings.storeName,
    tagline: settings.tagline,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    domain: settings.domain,
    description: settings.description,
    logoUrl: settings.logoUrl,
  });

  const [org, setOrg] = useState({
    businessType: settings.businessType,
    legalName: settings.legalName,
    taxId: settings.taxId,
    website: settings.website,
    currency: settings.currency,
    timezone: settings.timezone,
    language: settings.language,
    address: settings.address,
    city: settings.city,
    country: settings.country,
    pincode: settings.pincode,
    socialInstagram: settings.socialInstagram,
    socialTwitter: settings.socialTwitter,
    socialFacebook: settings.socialFacebook,
    socialTiktok: settings.socialTiktok,
  });

  const [notifs, setNotifs] = useState({
    orderConfirmationEmails: settings.orderConfirmationEmails,
    lowStockAlerts: settings.lowStockAlerts,
    abandonedCartReminders: settings.abandonedCartReminders,
    newOrderAlerts: settings.newOrderAlerts,
    refundAlerts: settings.refundAlerts,
  });

  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function saveGeneral() {
    save(general);
    showToast("General settings saved.");
  }

  function saveOrg() {
    save(org);
    showToast("Organisation settings saved.");
  }

  function saveNotifs() {
    save(notifs);
    showToast("Notification preferences saved.");
  }

  function setG<K extends keyof typeof general>(k: K, v: (typeof general)[K]) {
    setGeneral((d) => ({ ...d, [k]: v }));
  }
  function setO<K extends keyof typeof org>(k: K, v: (typeof org)[K]) {
    setOrg((d) => ({ ...d, [k]: v }));
  }
  function setN<K extends keyof typeof notifs>(k: K, v: (typeof notifs)[K]) {
    setNotifs((d) => ({ ...d, [k]: v }));
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-[var(--radius-md)] px-5 py-3 font-mono text-[12px] text-white shadow-lg"
          style={{ background: "var(--success, #2a7a4b)" }}
        >
          ✓ {toast}
        </div>
      )}

      {/* Tabs */}
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

        {/* ── General ── */}
        {tab === "General" && (
          <div className="space-y-5">
            <SectionHeading>Store identity</SectionHeading>

            {general.logoUrl && (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={general.logoUrl} alt="Logo" className="h-12 rounded object-contain" />
                <button
                  type="button"
                  onClick={() => setG("logoUrl", "")}
                  className="font-mono text-[11px] text-ink-soft hover:text-danger"
                >
                  Remove
                </button>
              </div>
            )}

            <Field label="Logo URL (optional)">
              <input
                value={general.logoUrl}
                onChange={(e) => setG("logoUrl", e.target.value)}
                placeholder="https://…/logo.png"
                className="input-field"
              />
            </Field>

            <Field label="Store name">
              <input
                value={general.storeName}
                onChange={(e) => setG("storeName", e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Tagline">
              <input
                value={general.tagline}
                onChange={(e) => setG("tagline", e.target.value)}
                placeholder="A short line shown under your store name"
                className="input-field"
              />
            </Field>

            <Field label="Store description">
              <textarea
                value={general.description}
                onChange={(e) => setG("description", e.target.value)}
                rows={3}
                placeholder="Used in SEO meta descriptions and about sections"
                className="input-field resize-none"
              />
            </Field>

            <SectionHeading>Contact & domain</SectionHeading>

            <Field label="Support email">
              <input
                type="email"
                value={general.supportEmail}
                onChange={(e) => setG("supportEmail", e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Support phone">
              <input
                type="tel"
                value={general.supportPhone}
                onChange={(e) => setG("supportPhone", e.target.value)}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </Field>

            <Field label="Domain">
              <div className="flex items-center rounded-[var(--radius-sm)] border border-line bg-bone px-3 focus-within:border-accent" style={{ transition: "border-color 150ms" }}>
                <span className="font-mono text-[12px] text-ink-soft">https://</span>
                <input
                  value={general.domain}
                  onChange={(e) => setG("domain", e.target.value)}
                  className="flex-1 bg-transparent py-2.5 pl-1 font-mono text-[13px] text-ink outline-none"
                />
              </div>
            </Field>

            <button
              onClick={saveGeneral}
              className="mt-2 rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
            >
              Save changes
            </button>

            {savedAt && (
              <p className="font-mono text-[11px] text-ink-soft/60">
                Last saved {new Date(savedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {/* ── Theme ── */}
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

        {/* ── Organisation ── */}
        {tab === "Organization" && (
          <div className="space-y-5">
            <SectionHeading>Business</SectionHeading>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Business type">
                <select value={org.businessType} onChange={(e) => setO("businessType", e.target.value)} className="input-field">
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="grocery">Grocery & Food</option>
                  <option value="electronics">Electronics</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="home">Home & Furniture</option>
                  <option value="generic">General Store</option>
                </select>
              </Field>
              <Field label="Legal / trade name">
                <input
                  value={org.legalName}
                  onChange={(e) => setO("legalName", e.target.value)}
                  placeholder="e.g. Aldergate Trading Pvt. Ltd."
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="GST / Tax ID">
                <input
                  value={org.taxId}
                  onChange={(e) => setO("taxId", e.target.value)}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  className="input-field"
                />
              </Field>
              <Field label="Website">
                <input
                  type="url"
                  value={org.website}
                  onChange={(e) => setO("website", e.target.value)}
                  placeholder="https://yourstore.com"
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Currency">
                <select value={org.currency} onChange={(e) => setO("currency", e.target.value)} className="input-field">
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="SGD">SGD — Singapore Dollar</option>
                </select>
              </Field>

              <Field label="Language">
                <select value={org.language} onChange={(e) => setO("language", e.target.value)} className="input-field">
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Timezone">
              <select value={org.timezone} onChange={(e) => setO("timezone", e.target.value)} className="input-field">
                {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
              </select>
            </Field>

            <SectionHeading>Business address</SectionHeading>

            <Field label="Street address">
              <input value={org.address} onChange={(e) => setO("address", e.target.value)} placeholder="123, MG Road" className="input-field" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input value={org.city} onChange={(e) => setO("city", e.target.value)} placeholder="Mumbai" className="input-field" />
              </Field>
              <Field label="PIN / ZIP">
                <input value={org.pincode} onChange={(e) => setO("pincode", e.target.value)} placeholder="400001" className="input-field" />
              </Field>
            </div>

            <Field label="Country">
              <select value={org.country} onChange={(e) => setO("country", e.target.value)} className="input-field">
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">UAE</option>
                <option value="SG">Singapore</option>
              </select>
            </Field>

            <SectionHeading>Social links</SectionHeading>

            <Field label="Instagram">
              <div className="flex items-center rounded-[var(--radius-sm)] border border-line bg-bone px-3 focus-within:border-accent" style={{ transition: "border-color 150ms" }}>
                <span className="font-mono text-[12px] text-ink-soft">instagram.com/</span>
                <input
                  value={org.socialInstagram}
                  onChange={(e) => setO("socialInstagram", e.target.value)}
                  placeholder="yourhandle"
                  className="flex-1 bg-transparent py-2.5 pl-1 font-mono text-[13px] text-ink outline-none"
                />
              </div>
            </Field>

            <Field label="Twitter / X">
              <div className="flex items-center rounded-[var(--radius-sm)] border border-line bg-bone px-3 focus-within:border-accent" style={{ transition: "border-color 150ms" }}>
                <span className="font-mono text-[12px] text-ink-soft">x.com/</span>
                <input
                  value={org.socialTwitter}
                  onChange={(e) => setO("socialTwitter", e.target.value)}
                  placeholder="yourhandle"
                  className="flex-1 bg-transparent py-2.5 pl-1 font-mono text-[13px] text-ink outline-none"
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Facebook">
                <div className="flex items-center rounded-[var(--radius-sm)] border border-line bg-bone px-3 focus-within:border-accent" style={{ transition: "border-color 150ms" }}>
                  <span className="font-mono text-[12px] text-ink-soft">facebook.com/</span>
                  <input
                    value={org.socialFacebook}
                    onChange={(e) => setO("socialFacebook", e.target.value)}
                    placeholder="yourpage"
                    className="flex-1 bg-transparent py-2.5 pl-1 font-mono text-[13px] text-ink outline-none"
                  />
                </div>
              </Field>
              <Field label="TikTok">
                <div className="flex items-center rounded-[var(--radius-sm)] border border-line bg-bone px-3 focus-within:border-accent" style={{ transition: "border-color 150ms" }}>
                  <span className="font-mono text-[12px] text-ink-soft">tiktok.com/@</span>
                  <input
                    value={org.socialTiktok}
                    onChange={(e) => setO("socialTiktok", e.target.value)}
                    placeholder="yourhandle"
                    className="flex-1 bg-transparent py-2.5 pl-1 font-mono text-[13px] text-ink outline-none"
                  />
                </div>
              </Field>
            </div>

            <button
              onClick={saveOrg}
              className="mt-2 rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
            >
              Save changes
            </button>

            {savedAt && (
              <p className="font-mono text-[11px] text-ink-soft/60">
                Last saved {new Date(savedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === "Notifications" && (
          <div className="space-y-5">
            <SectionHeading>Order notifications</SectionHeading>

            {([
              { key: "orderConfirmationEmails", label: "Order confirmation emails", desc: "Send to customer on every new order" },
              { key: "newOrderAlerts",          label: "New order alerts",           desc: "Notify admin when a new order is placed" },
              { key: "refundAlerts",            label: "Refund & cancellation alerts", desc: "Notify admin on refund or cancellation" },
            ] as const).map(({ key, label, desc }) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border border-line px-4 py-3.5">
                <span>
                  <span className="block text-[13px] text-ink">{label}</span>
                  <span className="block font-mono text-[11px] text-ink-soft">{desc}</span>
                </span>
                <input
                  type="checkbox"
                  checked={notifs[key]}
                  onChange={(e) => setN(key, e.target.checked)}
                  className="accent-[var(--accent)] size-4"
                />
              </label>
            ))}

            <SectionHeading>Inventory & marketing</SectionHeading>

            {([
              { key: "lowStockAlerts",          label: "Low-stock alerts",           desc: "Alert when a product drops below reorder level" },
              { key: "abandonedCartReminders",  label: "Abandoned cart reminders",   desc: "Email customers who left items in cart" },
            ] as const).map(({ key, label, desc }) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border border-line px-4 py-3.5">
                <span>
                  <span className="block text-[13px] text-ink">{label}</span>
                  <span className="block font-mono text-[11px] text-ink-soft">{desc}</span>
                </span>
                <input
                  type="checkbox"
                  checked={notifs[key]}
                  onChange={(e) => setN(key, e.target.checked)}
                  className="accent-[var(--accent)] size-4"
                />
              </label>
            ))}

            <button
              onClick={saveNotifs}
              className="mt-2 rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
            >
              Save changes
            </button>

            {savedAt && (
              <p className="font-mono text-[11px] text-ink-soft/60">
                Last saved {new Date(savedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
