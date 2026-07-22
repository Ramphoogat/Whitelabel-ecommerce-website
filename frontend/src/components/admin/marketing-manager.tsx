"use client";

import { useState, useRef } from "react";
import { COUPONS, BANNERS, type Coupon, type Banner } from "@/lib/data/admin-marketing";
import { createCoupon, createBanner } from "@/lib/api/admin.api";
import { Modal } from "./modal";

const BANNER_TONES = ["#4b9ec4", "#74b0a0", "#9d8fc7", "#3d5a76", "#c2a878"];
const PLACEMENTS = ["Homepage Hero", "Top Strip", "Category Page"];

/* ─── Coupon form state shape ─── */
interface CouponDraft {
  code: string;
  type: "percentage" | "flat";
  value: number;
  limit: number;
  expires: string;
  active: boolean;
}

const BLANK_COUPON: CouponDraft = { code: "", type: "percentage", value: 10, limit: 500, expires: "", active: true };

function couponToDraft(c: Coupon): CouponDraft {
  return { code: c.code, type: c.type, value: c.value, limit: c.limit, expires: c.expires === "—" ? "" : c.expires, active: c.active };
}

/* ─── Banner form state shape ─── */
interface BannerDraft {
  title: string;
  placement: string;
  imageUrl: string;
  tags: string[];
  active: boolean;
}

const BLANK_BANNER: BannerDraft = { title: "", placement: "Homepage Hero", imageUrl: "", tags: [], active: true };

function bannerToDraft(b: Banner): BannerDraft {
  return { title: b.title, placement: b.placement, imageUrl: b.imageUrl ?? "", tags: b.tags ?? [], active: b.active };
}

export function MarketingManager() {
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [banners, setBanners] = useState<Banner[]>(BANNERS);

  /* ── Coupon modal ── */
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCouponOpen, setNewCouponOpen] = useState(false);
  const [couponDraft, setCouponDraft] = useState<CouponDraft>(BLANK_COUPON);
  const couponModalOpen = newCouponOpen || editingCoupon !== null;
  const couponIsEdit = editingCoupon !== null;

  function openNewCoupon() { setCouponDraft(BLANK_COUPON); setNewCouponOpen(true); }
  function openEditCoupon(c: Coupon) { setCouponDraft(couponToDraft(c)); setEditingCoupon(c); }
  function closeCouponModal() { setNewCouponOpen(false); setEditingCoupon(null); }

  function setCouponField<K extends keyof CouponDraft>(k: K, v: CouponDraft[K]) {
    setCouponDraft((d) => ({ ...d, [k]: v }));
  }

  async function submitCoupon(e: React.FormEvent) {
    e.preventDefault();
    const normalized = couponDraft.code.trim().toUpperCase();
    if (!normalized) return;

    if (couponIsEdit) {
      setCoupons((cs) =>
        cs.map((c) =>
          c.code === editingCoupon!.code
            ? { ...c, code: normalized, type: couponDraft.type, value: couponDraft.value, limit: couponDraft.limit, active: couponDraft.active, expires: couponDraft.expires || "—" }
            : c,
        ),
      );
    } else {
      await createCoupon({ code: normalized, type: couponDraft.type, value: couponDraft.value, usageLimit: couponDraft.limit, expiresAt: couponDraft.expires || undefined }).catch(() => {});
      setCoupons((cs) => [{ code: normalized, type: couponDraft.type, value: couponDraft.value, usage: 0, limit: couponDraft.limit, active: couponDraft.active, expires: couponDraft.expires || "—" }, ...cs]);
    }
    closeCouponModal();
  }

  function deleteCoupon(code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setCoupons((cs) => cs.filter((c) => c.code !== code));
    closeCouponModal();
  }

  /* ── Banner modal ── */
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBannerOpen, setNewBannerOpen] = useState(false);
  const [bannerDraft, setBannerDraft] = useState<BannerDraft>(BLANK_BANNER);
  const [tagInput, setTagInput] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerModalOpen = newBannerOpen || editingBanner !== null;
  const bannerIsEdit = editingBanner !== null;

  function openNewBanner() { setBannerDraft(BLANK_BANNER); setTagInput(""); setUploadPreview(""); setNewBannerOpen(true); }
  function openEditBanner(b: Banner) { setBannerDraft(bannerToDraft(b)); setTagInput(""); setUploadPreview(b.imageUrl ?? ""); setEditingBanner(b); }
  function closeBannerModal() { setNewBannerOpen(false); setEditingBanner(null); setUploadPreview(""); }

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadPreview(dataUrl);
      setBannerField("imageUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }

  function setBannerField<K extends keyof BannerDraft>(k: K, v: BannerDraft[K]) {
    setBannerDraft((d) => ({ ...d, [k]: v }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || bannerDraft.tags.includes(t)) { setTagInput(""); return; }
    setBannerField("tags", [...bannerDraft.tags, t]);
    setTagInput("");
  }
  function removeTag(tag: string) { setBannerField("tags", bannerDraft.tags.filter((t) => t !== tag)); }
  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !tagInput && bannerDraft.tags.length) setBannerField("tags", bannerDraft.tags.slice(0, -1));
  }

  async function submitBanner(e: React.FormEvent) {
    e.preventDefault();
    const title = bannerDraft.title.trim();
    if (!title) return;

    if (bannerIsEdit) {
      setBanners((bs) =>
        bs.map((b) =>
          b.id === editingBanner!.id
            ? { ...b, title, placement: bannerDraft.placement, imageUrl: bannerDraft.imageUrl.trim() || undefined, tags: bannerDraft.tags.length ? bannerDraft.tags : undefined, active: bannerDraft.active }
            : b,
        ),
      );
    } else {
      await createBanner({ title, placement: bannerDraft.placement }).catch(() => {});
      setBanners((bs) => [{
        id: `local-${Date.now()}`, title, placement: bannerDraft.placement,
        tone: BANNER_TONES[bs.length % BANNER_TONES.length], active: bannerDraft.active,
        tags: bannerDraft.tags.length ? bannerDraft.tags : undefined,
        imageUrl: bannerDraft.imageUrl.trim() || undefined,
      }, ...bs]);
    }
    closeBannerModal();
  }

  function deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;
    setBanners((bs) => bs.filter((b) => b.id !== id));
    closeBannerModal();
  }

  return (
    <div className="space-y-10">

      {/* ── Coupons ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Coupons</h2>
          <button onClick={openNewCoupon} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
            + New Coupon
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Code</th>
                <th className="px-5 py-3 font-normal">Discount</th>
                <th className="px-5 py-3 font-normal">Usage</th>
                <th className="px-5 py-3 font-normal">Expires</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr
                  key={c.code}
                  className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60"
                  onClick={() => openEditCoupon(c)}
                >
                  <td className="px-5 py-3 font-mono font-medium text-ink">{c.code}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{c.usage} / {c.limit}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{c.expires}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${c.active ? "bg-success/10 text-success" : "bg-bone text-ink-soft"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[11px] text-accent">
                    Edit →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Banners ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Banners</h2>
          <button onClick={openNewBanner} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
            + New Banner
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {banners.map((b) => (
            <button
              key={b.id}
              onClick={() => openEditBanner(b)}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface text-left transition-all hover:border-accent hover:shadow-md"
            >
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt={b.title} className="h-24 w-full object-cover" />
              ) : (
                <div className="relative h-24" style={{ background: b.tone }}>
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.1em] text-white/0 transition-colors group-hover:text-white/70">
                    Click to edit
                  </span>
                </div>
              )}
              <div className="p-4">
                <p className="font-display text-[14px] text-ink">{b.title}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">{b.placement}</p>
                {b.tags && b.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {b.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-line/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-ink-soft">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${b.active ? "bg-success/10 text-success" : "bg-bone text-ink-soft"}`}>
                    {b.active ? "Live" : "Hidden"}
                  </span>
                  <span className="font-mono text-[11px] text-accent opacity-0 transition-opacity group-hover:opacity-100">Edit →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Coupon modal (create + edit) ── */}
      <Modal title={couponIsEdit ? "Edit Coupon" : "New Coupon"} open={couponModalOpen} onClose={closeCouponModal}>
        <form onSubmit={submitCoupon} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Code</span>
            <input
              required
              value={couponDraft.code}
              onChange={(e) => setCouponField("code", e.target.value)}
              placeholder="WELCOME10"
              className="input-field"
              readOnly={couponIsEdit}
              style={couponIsEdit ? { opacity: 0.6, cursor: "not-allowed" } : {}}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Type</span>
              <select value={couponDraft.type} onChange={(e) => setCouponField("type", e.target.value as "percentage" | "flat")} className="input-field">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat ₹</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Value</span>
              <input required type="number" min={1} value={couponDraft.value} onChange={(e) => setCouponField("value", Number(e.target.value))} className="input-field" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Usage limit</span>
              <input required type="number" min={1} value={couponDraft.limit} onChange={(e) => setCouponField("limit", Number(e.target.value))} className="input-field" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Expires</span>
              <input type="date" value={couponDraft.expires} onChange={(e) => setCouponField("expires", e.target.value)} className="input-field" />
            </label>
          </div>

          <div>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Status</span>
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => {
                const selected = s === "active" ? couponDraft.active : !couponDraft.active;
                return (
                  <button key={s} type="button" onClick={() => setCouponField("active", s === "active")}
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
              {couponIsEdit ? "Save changes" : "Create coupon"}
            </button>
            {couponIsEdit && (
              <button
                type="button"
                onClick={() => deleteCoupon(editingCoupon!.code)}
                className="rounded-full border border-danger/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger hover:bg-danger/5"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Banner modal (create + edit) ── */}
      <Modal title={bannerIsEdit ? "Edit Banner" : "New Banner"} open={bannerModalOpen} onClose={closeBannerModal}>
        <form onSubmit={submitBanner} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Title</span>
            <input required value={bannerDraft.title} onChange={(e) => setBannerField("title", e.target.value)} placeholder="Winter Sale — 20% off knitwear" className="input-field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Placement</span>
            <select value={bannerDraft.placement} onChange={(e) => setBannerField("placement", e.target.value)} className="input-field">
              {PLACEMENTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>

          <div>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Image <span className="normal-case opacity-50">(optional)</span>
            </span>

            {/* Preview */}
            {uploadPreview ? (
              <div className="relative mb-2 overflow-hidden rounded-[var(--radius-sm)] border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uploadPreview} alt="preview" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setUploadPreview(""); setBannerField("imageUrl", ""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 font-mono text-[10px] text-white hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mb-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 border-dashed py-6 transition-colors"
                style={{ borderColor: isDragging ? "var(--accent)" : "var(--line)", background: isDragging ? "var(--accent-soft, color-mix(in srgb, var(--accent) 8%, transparent))" : "transparent" }}
              >
                <span className="text-xl opacity-40">🖼</span>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  Drop image or <span className="text-accent">browse</span>
                </p>
                <p className="font-mono text-[10px] text-ink-soft/50">PNG, JPG, WebP · max 10 MB</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            />

            {/* URL fallback */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-line/60" />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/50">or paste URL</span>
              <div className="h-px flex-1 bg-line/60" />
            </div>
            <input
              type="url"
              value={uploadPreview.startsWith("data:") ? "" : bannerDraft.imageUrl}
              onChange={(e) => { setBannerField("imageUrl", e.target.value); setUploadPreview(e.target.value); }}
              placeholder="https://…"
              className="input-field mt-2"
            />
          </div>

          <div>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Tags <span className="normal-case opacity-50">(optional)</span>
            </span>
            <div
              className="flex min-h-[2.6rem] flex-wrap items-center gap-1.5 rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 focus-within:border-accent"
              style={{ transition: "border-color 150ms" }}
            >
              {bannerDraft.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-accent">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="leading-none opacity-60 hover:opacity-100">✕</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={bannerDraft.tags.length ? "" : "sale, new, featured…"}
                className="min-w-[80px] flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-soft/60"
              />
            </div>
            <p className="mt-1 font-mono text-[10px] text-ink-soft/60">Press Enter to add a tag</p>
          </div>

          <div>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Visibility</span>
            <div className="flex gap-2">
              {(["live", "hidden"] as const).map((s) => {
                const selected = s === "live" ? bannerDraft.active : !bannerDraft.active;
                return (
                  <button key={s} type="button" onClick={() => setBannerField("active", s === "live")}
                    className="rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
                    style={{
                      background: selected ? (s === "live" ? "var(--success)" : "var(--line-soft)") : "transparent",
                      color: selected ? (s === "live" ? "white" : "var(--ink-soft)") : "var(--ink-soft)",
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
              {bannerIsEdit ? "Save changes" : "Create banner"}
            </button>
            {bannerIsEdit && (
              <button
                type="button"
                onClick={() => deleteBanner(editingBanner!.id)}
                className="rounded-full border border-danger/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger hover:bg-danger/5"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
