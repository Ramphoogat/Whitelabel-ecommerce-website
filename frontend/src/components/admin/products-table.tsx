"use client";

import { useState } from "react";
import Link from "next/link";
import { ADMIN_PRODUCTS, STATUS_BADGE } from "@/lib/data/admin-products";
import { formatPrice } from "@/lib/data/products";

export function ProductsTable() {
  const [query, setQuery] = useState("");

  const filtered = ADMIN_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()),
  );

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
            <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">Product</th>
              <th className="px-5 py-3 font-normal">SKU</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Price</th>
              <th className="px-5 py-3 font-normal">Stock</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
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
                <td className="px-5 py-3 font-mono" style={{ color: p.stock === 0 ? "var(--danger)" : p.stock < 10 ? "var(--accent)" : "var(--ink)" }}>
                  {p.stock}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_BADGE[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
