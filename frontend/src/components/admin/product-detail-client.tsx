"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminProducts, useAdminTaxRates } from "@/hooks/use-admin-data";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";
import { STATUS_BADGE } from "@/lib/data/admin-products";
import { formatPrice } from "@/lib/data/products";
import type { AdminApiTaxRate } from "@/lib/api/admin.api";

function applyTax(priceCents: number, rates: AdminApiTaxRate[]): number {
  let total = priceCents;
  for (const r of rates.filter((r) => r.isActive)) {
    if (r.type === "percentage") total += Math.round(priceCents * r.rate / 100);
    else total += r.rate;
  }
  return total;
}

function totalTaxPct(rates: AdminApiTaxRate[]): number {
  return rates.filter((r) => r.isActive && r.type === "percentage").reduce((s, r) => s + r.rate, 0);
}

export function ProductDetailClient({ id }: { id: string }) {
  const { products, isLoading } = useAdminProducts();
  const { data: taxRates = [] } = useAdminTaxRates();
  const [editing, setEditing] = useState(false);

  const product = products.find((p) => p.id === id);

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Product" />
        <div className="px-6 py-16 text-center font-mono text-[12px] text-ink-soft">Loading…</div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AdminTopbar title="Not found" />
        <div className="px-6 py-8">
          <p className="text-[13px] text-ink-soft">No product found with this ID.</p>
          <Link href="/admin/products" className="mt-4 inline-block font-mono text-[11px] text-accent hover:underline">
            ← Back to Products
          </Link>
        </div>
      </>
    );
  }

  const taxPct = totalTaxPct(taxRates);
  const taxedPrice = applyTax(product.price, taxRates);
  const taxAmount = taxedPrice - product.price;
  const hasTax = taxRates.length > 0;

  return (
    <>
      <AdminTopbar title={product.name} />
      <div className="px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          <Link href="/admin/products" className="hover:text-ink">Products</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        {editing ? (
          <>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="font-display text-xl font-medium italic text-ink">Edit product</h2>
              <button
                onClick={() => setEditing(false)}
                className="font-mono text-[11px] text-ink-soft hover:text-ink"
              >
                ← Cancel
              </button>
            </div>
            <ProductForm product={product} />
          </>
        ) : (
          <div className="grid max-w-5xl gap-8 lg:grid-cols-[280px_1fr]">
            {/* Image panel */}
            <div
              className="flex aspect-square items-center justify-center rounded-[var(--radius-lg)] border border-line/70"
              style={{ background: product.tone }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/30">No image</span>
            </div>

            {/* Detail panel */}
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-medium italic text-ink">{product.name}</h1>
                  <p className="mt-1 font-mono text-[12px] text-ink-soft">{product.sku}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_BADGE[product.status]}`}>
                  {product.status}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "SKU", value: product.sku },
                  { label: "Category", value: product.category },
                  { label: "Stock", value: String(product.stock) },
                  { label: "Base price", value: formatPrice(product.price) },
                  {
                    label: hasTax ? `Tax (${taxPct}%)` : "Tax",
                    value: hasTax ? formatPrice(taxAmount) : "None",
                  },
                  {
                    label: "Price incl. tax",
                    value: hasTax ? formatPrice(taxedPrice) : formatPrice(product.price),
                    highlight: hasTax,
                  },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className="rounded-[var(--radius-md)] border border-line/70 bg-surface p-4"
                    style={highlight ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 6%, var(--surface))" } : {}}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">{label}</p>
                    <p className="mt-1.5 font-mono text-[15px] font-medium text-ink">{value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
                >
                  Edit product
                </button>
                <Link
                  href="/admin/products"
                  className="rounded-full border border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink hover:border-ink"
                >
                  Back
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
