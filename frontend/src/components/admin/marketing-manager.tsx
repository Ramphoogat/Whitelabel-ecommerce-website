"use client";

import { useState } from "react";
import { COUPONS, BANNERS, type Coupon, type Banner } from "@/lib/data/admin-marketing";
import { createCoupon, createBanner } from "@/lib/api/admin.api";
import { Modal } from "./modal";

const BANNER_TONES = ["#4b9ec4", "#74b0a0", "#9d8fc7", "#3d5a76", "#c2a878"];

export function MarketingManager() {
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [banners, setBanners] = useState<Banner[]>(BANNERS);
  const [couponOpen, setCouponOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  // Coupon form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "flat">("percentage");
  const [value, setValue] = useState(10);
  const [limit, setLimit] = useState(500);
  const [expires, setExpires] = useState("");

  // Banner form state
  const [bannerTitle, setBannerTitle] = useState("");
  const [placement, setPlacement] = useState("Homepage Hero");

  async function submitCoupon(e: React.FormEvent) {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    // Send to the real API when the backend is up; the visible list updates
    // either way so the flow works in demo mode too.
    await createCoupon({
      code: normalized,
      type,
      value,
      usageLimit: limit,
      expiresAt: expires || undefined,
    }).catch(() => {});
    setCoupons((c) => [
      { code: normalized, type, value, usage: 0, limit, active: true, expires: expires || "—" },
      ...c,
    ]);
    setCouponOpen(false);
    setCode("");
  }

  async function submitBanner(e: React.FormEvent) {
    e.preventDefault();
    const title = bannerTitle.trim();
    if (!title) return;
    await createBanner({ title, placement }).catch(() => {});
    setBanners((b) => [
      {
        id: `local-${Date.now()}`,
        title,
        placement,
        tone: BANNER_TONES[b.length % BANNER_TONES.length],
        active: true,
      },
      ...b,
    ]);
    setBannerOpen(false);
    setBannerTitle("");
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Coupons</h2>
          <button
            onClick={() => setCouponOpen(true)}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            + New Coupon
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Code</th>
                <th className="px-5 py-3 font-normal">Discount</th>
                <th className="px-5 py-3 font-normal">Usage</th>
                <th className="px-5 py-3 font-normal">Expires</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                  <td className="px-5 py-3 font-mono text-ink">{c.code}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">
                    {c.usage} / {c.limit}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{c.expires}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                        c.active ? "bg-success/10 text-success" : "bg-line-soft text-ink-soft"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Banners</h2>
          <button
            onClick={() => setBannerOpen(true)}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            + New Banner
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
              <div className="h-24" style={{ background: b.tone }} />
              <div className="p-4">
                <p className="font-display text-[14px] text-ink">{b.title}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                  {b.placement}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                    b.active ? "bg-success/10 text-success" : "bg-line-soft text-ink-soft"
                  }`}
                >
                  {b.active ? "Live" : "Hidden"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal title="New Coupon" open={couponOpen} onClose={() => setCouponOpen(false)}>
        <form onSubmit={submitCoupon} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Code</span>
            <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" className="input-field" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as "percentage" | "flat")} className="input-field">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat ₹</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Value</span>
              <input required type="number" min={1} value={value} onChange={(e) => setValue(Number(e.target.value))} className="input-field" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Usage limit</span>
              <input required type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="input-field" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Expires</span>
              <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="input-field" />
            </label>
          </div>
          <button type="submit" className="w-full rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
            Create coupon
          </button>
        </form>
      </Modal>

      <Modal title="New Banner" open={bannerOpen} onClose={() => setBannerOpen(false)}>
        <form onSubmit={submitBanner} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Title</span>
            <input required value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Winter Sale — 20% off knitwear" className="input-field" />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Placement</span>
            <select value={placement} onChange={(e) => setPlacement(e.target.value)} className="input-field">
              <option>Homepage Hero</option>
              <option>Top Strip</option>
              <option>Category Page</option>
            </select>
          </label>
          <button type="submit" className="w-full rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
            Create banner
          </button>
        </form>
      </Modal>
    </div>
  );
}
