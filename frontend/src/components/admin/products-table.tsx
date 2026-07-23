"use client";

import { useState } from "react";
import Link from "next/link";
import { STATUS_BADGE } from "@/lib/data/admin-products";
import { formatPrice } from "@/lib/data/products";
import { useAdminProducts, useAdminTaxRates } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination, usePagination } from "./pagination";
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

export function ProductsTable() {
  const [query, setQuery] = useState("");
  const { products, usingRealData, isLoading } = useAdminProducts();
  const { data: taxRates = [] } = useAdminTaxRates();

  const taxPct = totalTaxPct(taxRates);
  const hasTax = taxRates.length > 0;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()),
  );

  const { pageItems, page, pageCount, setPage, total, pageSize } = usePagination(filtered);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or SKU…"
          className="input-field max-w-xs"
        />
        <Link
          href="/admin/products/new"
          className="shrink-0 rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
        >
          + New Product
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">Product</th>
              <th className="px-5 py-3 font-normal">SKU</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Base price</th>
              <th className="px-5 py-3 font-normal">
                Tax {hasTax && <span className="ml-1 text-accent">({taxPct}%)</span>}
              </th>
              <th className="px-5 py-3 font-normal" style={{ color: "var(--accent)" }}>
                Incl. tax
              </th>
              <th className="px-5 py-3 font-normal">Stock</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonTable rows={5} cols={8} />}
            {!isLoading && pageItems.map((p) => {
              const taxedPrice = applyTax(p.price, taxRates);
              const taxAmount = taxedPrice - p.price;
              return (
                <tr
                  key={p.id}
                  className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60"
                  onClick={() => (window.location.href = `/admin/products/${p.id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="size-8 shrink-0 rounded-[var(--radius-sm)]" style={{ background: p.tone }} />
                      <span className="text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{p.sku}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.category}</td>
                  <td className="px-5 py-3 font-mono text-ink">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">
                    {hasTax ? formatPrice(taxAmount) : <span className="text-ink-soft/40">—</span>}
                  </td>
                  <td className="px-5 py-3 font-mono font-medium" style={{ color: hasTax ? "var(--accent)" : "var(--ink)" }}>
                    {formatPrice(taxedPrice)}
                  </td>
                  <td
                    className="px-5 py-3 font-mono"
                    style={{ color: p.stock === 0 ? "var(--danger)" : p.stock < 10 ? "var(--accent)" : "var(--ink)" }}
                  >
                    {p.stock}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} label="products" />
      </div>
    </div>
  );
}
