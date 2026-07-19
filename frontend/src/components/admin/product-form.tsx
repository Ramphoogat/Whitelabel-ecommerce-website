"use client";

import { useRouter } from "next/navigation";
import type { AdminProduct } from "@/lib/data/admin-products";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/admin/products");
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-8">
      <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">General</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Product name
            </span>
            <input
              required
              defaultValue={product?.name}
              placeholder="e.g. Field Overshirt"
              className="input-field"
            />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">SKU</span>
            <input required defaultValue={product?.sku} placeholder="AGT-XXX-000" className="input-field" />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Category</span>
            <input required defaultValue={product?.category} placeholder="Outerwear" className="input-field" />
          </label>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Pricing & Inventory</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Price (₹)</span>
            <input required type="number" min={0} defaultValue={product?.price} className="input-field" />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Stock</span>
            <input required type="number" min={0} defaultValue={product?.stock} className="input-field" />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Status</span>
            <select defaultValue={product?.status ?? "draft"} className="input-field">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Image</p>
        <div
          className="mt-4 flex aspect-video items-center justify-center rounded-[var(--radius-md)] border border-dashed border-line text-[13px] text-ink-soft"
          style={{ background: product?.tone ?? "var(--line-soft)" }}
        >
          Drop an image or click to upload
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
        >
          {isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-line px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink hover:border-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
