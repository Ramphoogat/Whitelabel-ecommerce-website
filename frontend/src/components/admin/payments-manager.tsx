"use client";

import { useState } from "react";
import { GATEWAY_CONFIGS, ALL_MODES, type GatewayConfig, type PaymentMode } from "@/lib/data/admin-payments";
import { Modal } from "./modal";
import { Pagination, usePagination } from "./pagination";

/* ── helpers ── */
const MODE_META: Record<PaymentMode, { label: string; bg: string; color: string }> = {
  upi:        { label: "UPI",        bg: "rgba(124,58,237,0.12)",  color: "#7c3aed" },
  card:       { label: "Card",       bg: "rgba(14,165,233,0.12)",  color: "#0284c7" },
  netbanking: { label: "Netbanking", bg: "rgba(8,145,178,0.12)",   color: "#0e7490" },
  wallet:     { label: "Wallet",     bg: "rgba(217,119,6,0.12)",   color: "#b45309" },
  emi:        { label: "EMI",        bg: "rgba(22,163,74,0.12)",   color: "#15803d" },
  bnpl:       { label: "BNPL",       bg: "rgba(219,39,119,0.12)",  color: "#be185d" },
  crypto:     { label: "Crypto",     bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
};

function ModeBadge({ mode, dim }: { mode: PaymentMode; dim?: boolean }) {
  const m = MODE_META[mode];
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]"
      style={{ background: m.bg, color: m.color, opacity: dim ? 0.3 : 1 }}
    >
      {m.label}
    </span>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className="relative h-5 w-9 rounded-full transition-colors disabled:opacity-40"
      style={{ background: on ? "var(--success)" : "var(--line)" }}
    >
      <span
        className="absolute top-0.5 size-4 rounded-full bg-ink transition-all"
        style={{ left: on ? "18px" : "2px" }}
      />
    </button>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: ok ? "var(--success)" : "var(--ink-soft)" }}>
      <span className="size-1.5 rounded-full" style={{ background: ok ? "var(--success)" : "var(--line)" }} />
      {label}
    </span>
  );
}

/* ── Preset catalog (gateways available to add) ── */
const PRESET_CATALOG: Omit<GatewayConfig, "isActive" | "enabledModes" | "apiKeyConfigured" | "webhookConfigured" | "testMode">[] = [
  { provider: "razorpay",    label: "Razorpay",       logo: "⚡", supportedModes: ["upi","card","netbanking","wallet","emi","bnpl"], priority: 1, country: "IN",     fees: "2% + ₹0",      settlementDays: 2 },
  { provider: "phonepe",     label: "PhonePe",        logo: "💜", supportedModes: ["upi","wallet"],                                priority: 2, country: "IN",     fees: "0%",           settlementDays: 1 },
  { provider: "cashfree",    label: "Cashfree",       logo: "💸", supportedModes: ["upi","card","netbanking","wallet","emi"],      priority: 3, country: "IN",     fees: "1.9%",         settlementDays: 2 },
  { provider: "payu",        label: "PayU",           logo: "🔵", supportedModes: ["upi","card","netbanking","wallet","emi"],      priority: 3, country: "IN",     fees: "2.5%",         settlementDays: 3 },
  { provider: "ccavenue",    label: "CCAvenue",       logo: "🏦", supportedModes: ["card","netbanking","upi","wallet","emi"],      priority: 4, country: "IN",     fees: "2% + ₹5",      settlementDays: 4 },
  { provider: "stripe",      label: "Stripe",         logo: "🟣", supportedModes: ["card","wallet","bnpl"],                       priority: 1, country: "GLOBAL", fees: "2.9% + $0.30", settlementDays: 2 },
  { provider: "paypal",      label: "PayPal",         logo: "🅿️", supportedModes: ["card","wallet"],                              priority: 5, country: "GLOBAL", fees: "3.49% + $0.49",settlementDays: 3 },
  { provider: "paytm",       label: "Paytm",          logo: "🔷", supportedModes: ["upi","wallet","card","netbanking","emi"],      priority: 5, country: "IN",     fees: "1.99%",        settlementDays: 2 },
  { provider: "billdesk",    label: "BillDesk",       logo: "🏛️", supportedModes: ["netbanking","card","upi"],                    priority: 6, country: "IN",     fees: "1.5%",         settlementDays: 3 },
  { provider: "airpay",      label: "Airpay",         logo: "✈️", supportedModes: ["upi","card","netbanking","wallet"],            priority: 6, country: "IN",     fees: "1.8%",         settlementDays: 2 },
  { provider: "instamojo",   label: "Instamojo",      logo: "⚙️", supportedModes: ["upi","card","netbanking","wallet"],            priority: 7, country: "IN",     fees: "2% + ₹3",      settlementDays: 3 },
  { provider: "zaakpay",     label: "Zaakpay",        logo: "🔐", supportedModes: ["card","netbanking","upi"],                    priority: 7, country: "IN",     fees: "1.75%",        settlementDays: 3 },
  { provider: "easebuzz",    label: "Easebuzz",       logo: "🌀", supportedModes: ["upi","card","netbanking","wallet","emi"],      priority: 7, country: "IN",     fees: "1.9%",         settlementDays: 2 },
  { provider: "juspay",      label: "Juspay",         logo: "🚀", supportedModes: ["upi","card","netbanking","wallet"],            priority: 7, country: "IN",     fees: "Custom",       settlementDays: 2 },
  { provider: "adyen",       label: "Adyen",          logo: "🔶", supportedModes: ["card","wallet","bnpl"],                       priority: 4, country: "GLOBAL", fees: "0.3% + €0.13", settlementDays: 2 },
  { provider: "braintree",   label: "Braintree",      logo: "🌿", supportedModes: ["card","wallet"],                              priority: 5, country: "GLOBAL", fees: "2.59% + $0.49",settlementDays: 2 },
  { provider: "square",      label: "Square",         logo: "⬛", supportedModes: ["card","wallet"],                              priority: 5, country: "US",     fees: "2.6% + $0.10", settlementDays: 1 },
  { provider: "2checkout",   label: "2Checkout",      logo: "2️⃣", supportedModes: ["card","wallet"],                              priority: 6, country: "GLOBAL", fees: "3.5% + $0.35", settlementDays: 5 },
  { provider: "paytabs",     label: "PayTabs",        logo: "📲", supportedModes: ["card","upi","wallet"],                        priority: 6, country: "GLOBAL", fees: "2.85%",        settlementDays: 3 },
  { provider: "custom",      label: "Custom Gateway", logo: "🔧", supportedModes: ["upi","card","netbanking","wallet","emi","bnpl","crypto"], priority: 9, country: "GLOBAL", fees: "—", settlementDays: 0 },
];

/* ── Add-gateway picker modal ── */
function AddGatewayPicker({
  existing,
  onSelect,
  onClose,
}: {
  existing: string[];
  onSelect: (g: GatewayConfig) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "IN" | "GLOBAL" | "US">("all");

  const available = PRESET_CATALOG.filter((p) => {
    if (existing.includes(p.provider)) return false;
    if (regionFilter !== "all" && p.country !== regionFilter) return false;
    if (search && !p.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function pick(preset: typeof PRESET_CATALOG[0]) {
    const newGateway: GatewayConfig = {
      ...preset,
      isActive: false,
      enabledModes: preset.supportedModes.slice(0, 2) as PaymentMode[],
      apiKeyConfigured: false,
      webhookConfigured: false,
      testMode: true,
    };
    onSelect(newGateway);
  }

  return (
    <Modal title="Add Payment Gateway" open onClose={onClose} wide>
      <div className="space-y-4">
        {/* Search + region */}
        <div className="flex gap-3">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gateways…"
            className="input-field flex-1 text-[13px]"
          />
          <div className="flex rounded-full border border-line/60 p-0.5" style={{ background: "var(--bone)" }}>
            {(["all", "IN", "GLOBAL", "US"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegionFilter(r)}
                className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
                style={{
                  background: regionFilter === r ? "var(--accent)" : "transparent",
                  color: regionFilter === r ? "var(--accent-ink)" : "var(--ink-soft)",
                }}
              >
                {r === "IN" ? "🇮🇳" : r === "GLOBAL" ? "🌐" : r === "US" ? "🇺🇸" : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Gateway grid */}
        {available.length === 0 ? (
          <p className="py-10 text-center font-mono text-[13px] text-ink-soft">All matching gateways already added.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {available.map((p) => (
              <button
                key={p.provider}
                type="button"
                onClick={() => pick(p)}
                className="group flex items-start gap-3 rounded-[var(--radius-md)] border border-line/60 p-4 text-left transition-all hover:border-accent/60 hover:shadow-[0_0_0_3px_var(--gold-soft)]"
                style={{ background: "var(--surface)" }}
              >
                <span className="mt-0.5 text-2xl">{p.logo}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink group-hover:text-accent">{p.label}</p>
                  <p className="font-mono text-[10px] text-ink-soft">
                    {p.country === "IN" ? "🇮🇳 India" : p.country === "US" ? "🇺🇸 US" : "🌐 Global"}
                    {" · "}{p.fees}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.supportedModes.slice(0, 3).map((m) => (
                      <ModeBadge key={m} mode={m as PaymentMode} />
                    ))}
                    {p.supportedModes.length > 3 && (
                      <span className="font-mono text-[10px] text-ink-soft/60">+{p.supportedModes.length - 3}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="font-mono text-[10px] text-ink-soft/60">
          Already-added gateways are hidden. Select a gateway to configure its API keys and modes.
        </p>
      </div>
    </Modal>
  );
}

/* ── Gateway detail modal ── */
function GatewayModal({
  gateway,
  onSave,
  onClose,
}: {
  gateway: GatewayConfig;
  onSave: (g: GatewayConfig) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<GatewayConfig>({ ...gateway });

  function toggleMode(mode: PaymentMode) {
    setDraft((d) => ({
      ...d,
      enabledModes: d.enabledModes.includes(mode)
        ? d.enabledModes.filter((m) => m !== mode)
        : [...d.enabledModes, mode],
    }));
  }

  return (
    <Modal title={`${draft.logo} ${draft.label}`} open onClose={onClose} wide>
      <div className="space-y-6">

        {/* Status row */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Active</span>
            <Toggle on={draft.isActive} onChange={() => setDraft((d) => ({ ...d, isActive: !d.isActive }))} />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Test mode</span>
            <Toggle on={draft.testMode} onChange={() => setDraft((d) => ({ ...d, testMode: !d.testMode }))} />
          </div>
          <span className="ml-auto rounded-full border border-line/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
            {draft.country === "IN" ? "🇮🇳 India" : draft.country === "GLOBAL" ? "🌐 Global" : "🇺🇸 US"}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Transaction fee", value: draft.fees },
            { label: "Settlement", value: `T+${draft.settlementDays} days` },
            { label: "Priority", value: `#${draft.priority}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[var(--radius-md)] border border-line/50 px-4 py-3" style={{ background: "var(--bone)" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">{label}</p>
              <p className="mt-1 font-mono text-[15px] font-medium text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Priority input */}
        <label className="block">
          <span className="mb-1.5 block font-mono bg-surface text-[11px] uppercase tracking-[0.08em] text-ink-soft">Priority (lower = tried first)</span>
          <input
            type="number"
            min={1}
            max={99}
            value={draft.priority}
            onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
            className="input-field w-32"
          />
        </label>

        {/* Payment modes */}
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Payment modes</p>
          <div className="flex flex-wrap gap-2">
            {ALL_MODES.map(({ key, label }) => {
              const supported = draft.supportedModes.includes(key);
              const enabled = draft.enabledModes.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!supported}
                  onClick={() => toggleMode(key)}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 transition-all"
                  style={{
                    borderColor: enabled ? "var(--accent)" : "var(--line)",
                    background: enabled ? "var(--accent-soft)" : "var(--surface)",
                    opacity: supported ? 1 : 0.3,
                    cursor: supported ? "pointer" : "not-allowed",
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: enabled ? "var(--accent)" : "var(--line)" }}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink">
                    {label}
                  </span>
                  {!supported && (
                    <span className="font-mono text-[9px] text-ink-soft">N/A</span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-soft/70">Grey = not supported by this gateway. Click to toggle enabled modes.</p>
        </div>

        {/* Integration status */}
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Integration status</p>
          <div className="flex flex-wrap gap-4">
            <StatusDot ok={draft.apiKeyConfigured} label="API key" />
            <StatusDot ok={draft.webhookConfigured} label="Webhook" />
            <StatusDot ok={!draft.testMode} label="Live mode" />
          </div>
        </div>

        {/* API key fields (placeholder) */}
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">API Key</span>
            <input
              type="password"
              placeholder={draft.apiKeyConfigured ? "••••••••••••••••" : "Enter API key…"}
              className="input-field font-mono text-[13px]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">API Secret</span>
            <input
              type="password"
              placeholder={draft.apiKeyConfigured ? "••••••••••••••••" : "Enter API secret…"}
              className="input-field font-mono text-[13px]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Webhook URL (copy to gateway dashboard)</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`https://yourstore.com/api/webhooks/${draft.provider}`}
                className="input-field flex-1 font-mono text-[12px] text-ink-soft"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(`https://yourstore.com/api/webhooks/${draft.provider}`)}
                className="rounded-[var(--radius-sm)] border border-line px-3 py-[0.65rem] font-mono text-[11px] text-ink-soft hover:border-accent hover:text-accent"
              >
                Copy
              </button>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-line/50 pt-4">
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Summary stats ── */
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line/60 px-5 py-4" style={{ background: "var(--surface)" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium text-ink">{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-ink-soft/70">{sub}</p>}
    </div>
  );
}

/* ── Main component ── */
export function PaymentsManager() {
  const [gateways, setGateways] = useState<GatewayConfig[]>(GATEWAY_CONFIGS);
  const [editing, setEditing] = useState<GatewayConfig | null>(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [countryFilter, setCountryFilter] = useState<"all" | "IN" | "GLOBAL">("all");

  function save(updated: GatewayConfig) {
    setGateways((gs) => {
      const exists = gs.some((g) => g.provider === updated.provider);
      return exists ? gs.map((g) => g.provider === updated.provider ? updated : g) : [...gs, updated];
    });
    setEditing(null);
  }

  function quickToggle(provider: string) {
    setGateways((gs) => gs.map((g) => g.provider === provider ? { ...g, isActive: !g.isActive } : g));
  }

  const activeCount = gateways.filter((g) => g.isActive).length;
  const modesLive = [...new Set(gateways.filter((g) => g.isActive).flatMap((g) => g.enabledModes))];

  const visible = gateways.filter((g) => {
    if (filter === "active" && !g.isActive) return false;
    if (filter === "inactive" && g.isActive) return false;
    if (countryFilter !== "all" && g.country !== countryFilter) return false;
    return true;
  });

  const sorted = [...visible].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.priority - b.priority;
  });

  const { pageItems, page, pageCount, setPage, total, pageSize } = usePagination(sorted);

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active gateways" value={activeCount} sub={`of ${gateways.length} configured`} />
        <StatCard label="Live modes" value={modesLive.length} sub={modesLive.map((m) => MODE_META[m].label).join(", ") || "none"} />
        <StatCard label="Configured" value={gateways.filter((g) => g.apiKeyConfigured).length} sub="API keys set" />
        <StatCard label="Webhooks" value={gateways.filter((g) => g.webhookConfigured).length} sub="endpoints confirmed" />
      </div>

      {/* Filters + Add button */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-line/60 p-0.5" style={{ background: "var(--surface)" }}>
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: filter === f ? "var(--accent)" : "transparent",
                color: filter === f ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-line/60 p-0.5" style={{ background: "var(--surface)" }}>
          {(["all", "IN", "GLOBAL"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCountryFilter(c)}
              className="rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: countryFilter === c ? "var(--accent)" : "transparent",
                color: countryFilter === c ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {c === "IN" ? "🇮🇳 India" : c === "GLOBAL" ? "🌐 Global" : "All"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="ml-auto rounded-full bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
        >
          + Add Gateway
        </button>
      </div>

      {/* Gateway table */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70" style={{ background: "var(--surface)" }}>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">Gateway</th>
              <th className="px-5 py-3 font-normal">Enabled modes</th>
              <th className="px-5 py-3 font-normal">Fee</th>
              <th className="px-5 py-3 font-normal">Settlement</th>
              <th className="px-5 py-3 font-normal">Priority</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Active</th>
              <th className="px-5 py-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((g) => (
              <tr
                key={g.provider}
                className="border-b border-line/50 last:border-0 transition-colors hover:bg-bone/40"
                style={{ opacity: g.isActive ? 1 : 0.65 }}
              >
                {/* Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{g.logo}</span>
                    <div>
                      <p className="font-medium text-ink">{g.label}</p>
                      <p className="font-mono text-[10px] text-ink-soft">
                        {g.country === "IN" ? "🇮🇳" : "🌐"} {g.testMode ? "⚠️ test" : "live"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Modes */}
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {g.supportedModes.map((m) => (
                      <ModeBadge key={m} mode={m} dim={!g.enabledModes.includes(m)} />
                    ))}
                  </div>
                </td>

                {/* Fee */}
                <td className="px-5 py-4 font-mono text-[12px] text-ink-soft">{g.fees}</td>

                {/* Settlement */}
                <td className="px-5 py-4 font-mono text-[12px] text-ink-soft">T+{g.settlementDays}d</td>

                {/* Priority */}
                <td className="px-5 py-4">
                  <span className="rounded-full border border-line/60 px-2.5 py-1 font-mono text-[11px] text-ink-soft">
                    #{g.priority}
                  </span>
                </td>

                {/* Integration status */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <StatusDot ok={g.apiKeyConfigured} label="API key" />
                    <StatusDot ok={g.webhookConfigured} label="Webhook" />
                  </div>
                </td>

                {/* Toggle */}
                <td className="px-5 py-4">
                  <Toggle on={g.isActive} onChange={() => quickToggle(g.provider)} />
                </td>

                {/* Edit */}
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(g)}
                    className="font-mono text-[11px] text-accent hover:underline"
                  >
                    Configure →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} label="gateways" />
      </div>

      {/* Mode coverage map */}
      <div className="rounded-[var(--radius-lg)] border border-line/70 p-5" style={{ background: "var(--surface)" }}>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Mode coverage — active gateways</p>
        <div className="space-y-3">
          {ALL_MODES.map(({ key, label }) => {
            const covering = gateways.filter((g) => g.isActive && g.enabledModes.includes(key));
            return (
              <div key={key} className="flex items-center gap-4">
                <div className="w-24 shrink-0">
                  <ModeBadge mode={key} />
                </div>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {covering.length === 0 ? (
                    <span className="font-mono text-[11px] text-ink-soft/50">No active gateway covers this mode</span>
                  ) : (
                    covering.map((g) => (
                      <span
                        key={g.provider}
                        className="rounded-full border border-line/50 px-2.5 py-0.5 font-mono text-[10px] text-ink-soft"
                        style={{ background: "var(--bone)" }}
                      >
                        {g.logo} {g.label}
                      </span>
                    ))
                  )}
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]"
                  style={{
                    background: covering.length > 0 ? "var(--success-soft, #dcfce7)" : "var(--bone)",
                    color: covering.length > 0 ? "var(--success)" : "var(--ink-soft)",
                  }}
                >
                  {covering.length} gateway{covering.length !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add gateway picker */}
      {adding && (
        <AddGatewayPicker
          existing={gateways.map((g) => g.provider)}
          onSelect={(g) => { setAdding(false); setEditing(g); }}
          onClose={() => setAdding(false)}
        />
      )}

      {/* Configure / edit modal */}
      {editing && (
        <GatewayModal gateway={editing} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
