"use client";

import { useState } from "react";
import { SHIPPING_ZONES, CARRIERS, type ShippingZone, type Carrier } from "@/lib/data/admin-shipping";
import { formatPrice } from "@/lib/data/products";
import { Modal } from "./modal";
import { Pagination, usePagination } from "./pagination";

/* ── Zone draft ── */
interface ZoneDraft {
  name: string;
  regions: string;
  method: string;
  rate: string;
  freeShipping: boolean;
  eta: string;
}

const BLANK_ZONE: ZoneDraft = { name: "", regions: "", method: "Standard", rate: "", freeShipping: false, eta: "" };

function zoneToDraft(z: ShippingZone): ZoneDraft {
  return {
    name: z.name,
    regions: z.regions,
    method: z.method,
    rate: z.rate === 0 ? "" : String(z.rate / 100),
    freeShipping: z.rate === 0,
    eta: z.eta,
  };
}

/* ── Carrier draft ── */
interface CarrierDraft {
  name: string;
  apiKey: string;
  accountEmail: string;
  accountId: string;
  webhookSecret: string;
  active: boolean;
}

const BLANK_CARRIER: CarrierDraft = { name: "", apiKey: "", accountEmail: "", accountId: "", webhookSecret: "", active: true };

function carrierToDraft(c: Carrier): CarrierDraft {
  return {
    name: c.name,
    apiKey: c.apiKey ?? "",
    accountEmail: c.accountEmail ?? "",
    accountId: c.accountId ?? "",
    webhookSecret: c.webhookSecret ?? "",
    active: c.active,
  };
}

/* ── Icons ── */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6l3.5 3.5L11 2" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4.5" cy="5.5" r="2.5" />
      <path d="M6.5 7.5l5 5M9.5 9.5l1.5-1.5" />
    </svg>
  );
}

export function ShippingManager() {
  const [zones, setZones] = useState<ShippingZone[]>(SHIPPING_ZONES);
  const [carriers, setCarriers] = useState<Carrier[]>(CARRIERS);

  /* ── Zone modal ── */
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [newZoneOpen, setNewZoneOpen] = useState(false);
  const [zoneDraft, setZoneDraft] = useState<ZoneDraft>(BLANK_ZONE);
  const zoneModalOpen = newZoneOpen || editingZone !== null;
  const zoneIsEdit = editingZone !== null;

  function openNewZone() { setZoneDraft(BLANK_ZONE); setNewZoneOpen(true); }
  function openEditZone(z: ShippingZone) { setZoneDraft(zoneToDraft(z)); setEditingZone(z); }
  function closeZoneModal() { setNewZoneOpen(false); setEditingZone(null); }

  function setZoneField<K extends keyof ZoneDraft>(k: K, v: ZoneDraft[K]) {
    setZoneDraft((d) => ({ ...d, [k]: v }));
  }

  function submitZone(e: React.FormEvent) {
    e.preventDefault();
    const rateCents = zoneDraft.freeShipping ? 0 : Math.round(Number(zoneDraft.rate) * 100);
    const updated: ShippingZone = {
      id: zoneIsEdit ? editingZone!.id : `z-${Date.now()}`,
      name: zoneDraft.name.trim(),
      regions: zoneDraft.regions.trim(),
      method: zoneDraft.method.trim(),
      rate: rateCents,
      eta: zoneDraft.eta.trim(),
    };
    if (zoneIsEdit) {
      setZones((zs) => zs.map((z) => z.id === editingZone!.id ? updated : z));
    } else {
      setZones((zs) => [...zs, updated]);
    }
    closeZoneModal();
  }

  function deleteZone(id: string) {
    if (!confirm("Delete this shipping zone?")) return;
    setZones((zs) => zs.filter((z) => z.id !== id));
    closeZoneModal();
  }

  /* ── Carrier modal ── */
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [newCarrierOpen, setNewCarrierOpen] = useState(false);
  const [carrierDraft, setCarrierDraft] = useState<CarrierDraft>(BLANK_CARRIER);
  const [showSecrets, setShowSecrets] = useState(false);
  const carrierModalOpen = editingCarrier !== null || newCarrierOpen;
  const carrierIsEdit = editingCarrier !== null;

  function openNewCarrier() { setCarrierDraft(BLANK_CARRIER); setShowSecrets(false); setNewCarrierOpen(true); }
  function openCarrierModal(c: Carrier) {
    setCarrierDraft(carrierToDraft(c));
    setShowSecrets(false);
    setEditingCarrier(c);
  }
  function closeCarrierModal() { setEditingCarrier(null); setNewCarrierOpen(false); }

  function setCarrierField<K extends keyof CarrierDraft>(k: K, v: CarrierDraft[K]) {
    setCarrierDraft((d) => ({ ...d, [k]: v }));
  }

  function submitCarrier(e: React.FormEvent) {
    e.preventDefault();
    const isConnected = carrierDraft.apiKey.trim().length > 0;
    if (carrierIsEdit) {
      setCarriers((cs) =>
        cs.map((c) =>
          c.id === editingCarrier!.id
            ? {
                ...c,
                active: carrierDraft.active && isConnected,
                apiKey: carrierDraft.apiKey.trim() || undefined,
                accountEmail: carrierDraft.accountEmail.trim() || undefined,
                accountId: carrierDraft.accountId.trim() || undefined,
                webhookSecret: carrierDraft.webhookSecret.trim() || undefined,
              }
            : c,
        ),
      );
    } else {
      const name = carrierDraft.name.trim();
      if (!name) return;
      setCarriers((cs) => [...cs, {
        id: `carrier-${Date.now()}`,
        name,
        active: carrierDraft.active && isConnected,
        apiKey: carrierDraft.apiKey.trim() || undefined,
        accountEmail: carrierDraft.accountEmail.trim() || undefined,
        accountId: carrierDraft.accountId.trim() || undefined,
        webhookSecret: carrierDraft.webhookSecret.trim() || undefined,
      }]);
    }
    closeCarrierModal();
  }

  function disconnectCarrier(id: string) {
    if (!confirm("Disconnect this carrier? All credentials will be removed.")) return;
    setCarriers((cs) =>
      cs.map((c) =>
        c.id === id ? { id: c.id, name: c.name, active: false } : c,
      ),
    );
    closeCarrierModal();
  }

  const zonePager = usePagination(zones);

  return (
    <div className="space-y-10">

      {/* ── Zones & Rates ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg italic text-ink">Zones & Rates</h2>
          <button
            onClick={openNewZone}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            + New Zone
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Zone</th>
                <th className="px-5 py-3 font-normal">Regions</th>
                <th className="px-5 py-3 font-normal">Method</th>
                <th className="px-5 py-3 font-normal">Rate</th>
                <th className="px-5 py-3 font-normal">ETA</th>
                <th className="px-5 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {zonePager.pageItems.map((z) => (
                <tr
                  key={z.id}
                  className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60"
                  onClick={() => openEditZone(z)}
                >
                  <td className="px-5 py-3 font-medium text-ink">{z.name}</td>
                  <td className="px-5 py-3 text-ink-soft">{z.regions}</td>
                  <td className="px-5 py-3 text-ink-soft">{z.method}</td>
                  <td className="px-5 py-3 font-mono text-ink">
                    {z.rate === 0
                      ? <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-success">Free</span>
                      : formatPrice(z.rate)}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{z.eta}</td>
                  <td className="px-5 py-3 text-right font-mono text-[11px] text-accent">Edit →</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={zonePager.page}
            pageCount={zonePager.pageCount}
            total={zonePager.total}
            pageSize={zonePager.pageSize}
            onPage={zonePager.setPage}
            label="zones"
          />
        </div>
      </section>

      {/* ── Carriers ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg italic text-ink">Carriers</h2>
          <div className="flex items-center gap-4">
            <p className="font-mono text-[11px] text-ink-soft">Click a carrier to connect or edit</p>
            <button
              onClick={openNewCarrier}
              className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
            >
              + New Carrier
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {carriers.map((c) => {
            const hasCredentials = Boolean(c.apiKey);
            return (
              <button
                key={c.id}
                onClick={() => openCarrierModal(c)}
                className="group flex flex-col gap-4 rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5 text-left transition-all hover:border-accent hover:shadow-md"
              >
                {/* Carrier logo placeholder */}
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-line/70 bg-bone font-mono text-[11px] font-medium uppercase text-ink">
                    {c.name.slice(0, 2)}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${c.active ? "bg-success/10 text-success" : "bg-bone text-ink-soft"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                    {hasCredentials ? "Credentials configured" : "Not connected"}
                  </p>
                </div>

                {/* Credential indicators */}
                <div className="flex flex-wrap gap-1.5">
                  {hasCredentials && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-success">
                      <CheckIcon /> API Key
                    </span>
                  )}
                  {c.accountEmail && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-success">
                      <CheckIcon /> Email
                    </span>
                  )}
                  {c.accountId && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-success">
                      <CheckIcon /> Account ID
                    </span>
                  )}
                  {!hasCredentials && (
                    <span className="flex items-center gap-1 rounded-full border border-dashed border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-ink-soft">
                      <KeyIcon /> Add credentials
                    </span>
                  )}
                </div>

                <span className="font-mono text-[11px] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  {hasCredentials ? "Edit connection →" : "Connect →"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Zone modal (create + edit) ── */}
      <Modal title={zoneIsEdit ? "Edit Zone" : "New Zone"} open={zoneModalOpen} onClose={closeZoneModal}>
        <form onSubmit={submitZone} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Zone name</span>
              <input
                required
                value={zoneDraft.name}
                onChange={(e) => setZoneField("name", e.target.value)}
                placeholder="Metro"
                className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Method</span>
              <select value={zoneDraft.method} onChange={(e) => setZoneField("method", e.target.value)} className="input-field">
                <option>Standard</option>
                <option>Express</option>
                <option>Same Day</option>
                <option>Economy</option>
                <option>Click & Collect</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Regions / Pin codes</span>
            <input
              required
              value={zoneDraft.regions}
              onChange={(e) => setZoneField("regions", e.target.value)}
              placeholder="Mumbai, Delhi, Bengaluru…"
              className="input-field"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Rate (₹)</span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zoneDraft.freeShipping}
                    onChange={(e) => setZoneField("freeShipping", e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-mono text-[12px] text-ink">Free shipping</span>
                </label>
                {!zoneDraft.freeShipping && (
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={zoneDraft.rate}
                    onChange={(e) => setZoneField("rate", e.target.value)}
                    placeholder="99"
                    className="input-field"
                  />
                )}
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">ETA</span>
              <input
                required
                value={zoneDraft.eta}
                onChange={(e) => setZoneField("eta", e.target.value)}
                placeholder="2–4 days"
                className="input-field"
              />
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
              {zoneIsEdit ? "Save changes" : "Create zone"}
            </button>
            {zoneIsEdit && (
              <button
                type="button"
                onClick={() => deleteZone(editingZone!.id)}
                className="rounded-full border border-danger/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger hover:bg-danger/5"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Carrier modal ── */}
      <Modal
        title={carrierIsEdit ? (editingCarrier!.active ? `Edit — ${editingCarrier!.name}` : `Connect — ${editingCarrier!.name}`) : "New Carrier"}
        open={carrierModalOpen}
        onClose={closeCarrierModal}
      >
        <form onSubmit={submitCarrier} className="space-y-4">
          {!carrierIsEdit && (
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Carrier name</span>
              <input
                required
                value={carrierDraft.name}
                onChange={(e) => setCarrierField("name", e.target.value)}
                placeholder="e.g. FedEx, Ekart…"
                className="input-field"
              />
            </label>
          )}

          <p className="rounded-[var(--radius-md)] border border-line/60 bg-bone px-4 py-3 font-mono text-[11px] text-ink-soft">
            {carrierIsEdit
              ? <>Enter your <span className="text-ink">{editingCarrier!.name}</span> API credentials. These are stored locally and used to fetch live rates and book shipments.</>
              : "Enter the API credentials for your carrier. These are stored locally and used to fetch live rates and book shipments."}
          </p>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">API Key / Token</span>
            <div className="relative">
              <input
                type={showSecrets ? "text" : "password"}
                value={carrierDraft.apiKey}
                onChange={(e) => setCarrierField("apiKey", e.target.value)}
                placeholder="Paste your API key here"
                className="input-field pr-16"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowSecrets((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft hover:text-ink"
              >
                {showSecrets ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Account Email</span>
              <input
                type="email"
                value={carrierDraft.accountEmail}
                onChange={(e) => setCarrierField("accountEmail", e.target.value)}
                placeholder="you@company.com"
                className="input-field"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Account / Merchant ID</span>
              <input
                value={carrierDraft.accountId}
                onChange={(e) => setCarrierField("accountId", e.target.value)}
                placeholder="e.g. DL-00412"
                className="input-field"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Webhook Secret <span className="normal-case opacity-50">(optional)</span>
            </span>
            <input
              type={showSecrets ? "text" : "password"}
              value={carrierDraft.webhookSecret}
              onChange={(e) => setCarrierField("webhookSecret", e.target.value)}
              placeholder="For tracking callbacks"
              className="input-field"
              autoComplete="off"
            />
          </label>

          <div>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Status</span>
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => {
                const selected = s === "active" ? carrierDraft.active : !carrierDraft.active;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCarrierField("active", s === "active")}
                    className="rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
                    style={{
                      background: selected ? (s === "active" ? "var(--success)" : "var(--line-soft)") : "transparent",
                      color: selected ? (s === "active" ? "white" : "var(--ink-soft)") : "var(--ink-soft)",
                      border: selected ? "none" : "1px solid var(--line)",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
              {carrierIsEdit ? (editingCarrier!.active ? "Save changes" : "Connect carrier") : "Add carrier"}
            </button>
            {carrierIsEdit && editingCarrier!.active && (
              <button
                type="button"
                onClick={() => disconnectCarrier(editingCarrier!.id)}
                className="rounded-full border border-danger/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger hover:bg-danger/5"
              >
                Disconnect
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
