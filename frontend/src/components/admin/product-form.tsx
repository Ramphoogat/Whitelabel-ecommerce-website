"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, createVariant, updateProduct } from "@/lib/api/admin.api";
import { toast } from "@/stores/toast-store";
import type { AdminProduct } from "@/lib/data/admin-products";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [brand, setBrand] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product?.price ? String(Math.round(product.price / 100)) : "");
  const [stock, setStock] = useState(product?.stock ? String(product.stock) : "");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    (product?.status as "draft" | "active" | "archived") ?? "draft",
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const prod = await createProduct({ title, brand, status });
      if (sku && price) {
        await createVariant({
          productId: prod._id,
          sku,
          priceCents: Math.round(Number(price) * 100),
          initialQuantity: stock ? Number(stock) : 0,
        });
      }
      return prod;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created");
      router.push("/admin/products");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProduct(product!.id, { title, brand, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product saved");
      router.push("/admin/products");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) updateMutation.mutate();
    else createMutation.mutate();
  }

  const busy = createMutation.isPending || updateMutation.isPending;

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Field Overshirt"
              className="input-field"
            />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              {isEdit ? "SKU (read-only)" : "SKU (first variant)"}
            </span>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="AGT-XXX-000"
              disabled={isEdit}
              className="input-field disabled:opacity-50"
            />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Brand / Category
            </span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Outerwear"
              className="input-field"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          Pricing & Inventory
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Price (₹)
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isEdit}
              placeholder="999"
              className="input-field disabled:opacity-50"
            />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Initial stock
            </span>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={isEdit}
              placeholder="0"
              className="input-field disabled:opacity-50"
            />
          </label>
          <label>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        {isEdit && (
          <p className="mt-3 text-[12px] text-ink-soft">
            Pricing and stock are managed via the Inventory page per-variant.
          </p>
        )}
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
          disabled={busy}
          className="rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create product"}
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
