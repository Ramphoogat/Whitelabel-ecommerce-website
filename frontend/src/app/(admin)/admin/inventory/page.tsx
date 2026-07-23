"use client";

import { AdminTopbar } from "@/components/admin/topbar";
import { useAdminInventory, useAdminProducts, useAdminTaxRates } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination, usePagination } from "@/components/admin/pagination";
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

export default function AdminInventoryPage() {
  const { inventory, fallback, usingRealData, isLoading } = useAdminInventory();
  const { products } = useAdminProducts();
  const { data: taxRates = [] } = useAdminTaxRates();

  const taxPct = totalTaxPct(taxRates);
  const hasTax = taxRates.length > 0;

  // SKU → price lookup from products list
  const priceMap = new Map(products.map((p) => [p.sku, p.price]));

  const realPager = usePagination(inventory);
  const fallbackPager = usePagination(fallback ?? []);
  const pager = usingRealData ? realPager : fallbackPager;

  return (
    <>
      <AdminTopbar title="Inventory" />
      <div className="px-6 py-8">

        <div className="overflow-x-auto overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">SKU</th>
                <th className="px-5 py-3 font-normal">Product</th>
                <th className="px-5 py-3 font-normal">On hand</th>
                <th className="px-5 py-3 font-normal">Reserved</th>
                <th className="px-5 py-3 font-normal">Available</th>
                <th className="px-5 py-3 font-normal">Base price</th>
                <th className="px-5 py-3 font-normal">
                  Tax {hasTax && <span className="ml-1 text-accent">({taxPct}%)</span>}
                </th>
                <th className="px-5 py-3 font-normal" style={{ color: "var(--accent)" }}>
                  Incl. tax
                </th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTable rows={8} cols={9} />}

              {usingRealData &&
                realPager.pageItems.map((row) => {
                  const low = row.availableQuantity <= row.lowStockThreshold;
                  const basePrice = priceMap.get(row.sku) ?? null;
                  const taxedPrice = basePrice !== null ? applyTax(basePrice, taxRates) : null;
                  return (
                    <tr key={row._id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.sku}</td>
                      <td className="px-5 py-3 text-ink">{row.productTitle}</td>
                      <td className="px-5 py-3 font-mono text-ink">
                        {(row.availableQuantity ?? 0) + (row.reservedQuantity ?? 0)}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.reservedQuantity}</td>
                      <td className="px-5 py-3 font-mono" style={{ color: low ? "var(--danger)" : "var(--ink)" }}>
                        {row.availableQuantity}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink">
                        {basePrice !== null ? formatPrice(basePrice) : <span className="text-ink-soft/40">—</span>}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-soft">
                        {basePrice !== null && hasTax
                          ? formatPrice(taxedPrice! - basePrice)
                          : <span className="text-ink-soft/40">—</span>}
                      </td>
                      <td className="px-5 py-3 font-mono font-medium" style={{ color: hasTax ? "var(--accent)" : "var(--ink)" }}>
                        {taxedPrice !== null ? formatPrice(taxedPrice) : <span className="text-ink-soft/40">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${low ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                          {low ? "Reorder" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

              {!usingRealData && !isLoading &&
                fallbackPager.pageItems.map((row) => {
                  const available = row.onHand - row.reserved;
                  const low = available <= row.reorderPoint;
                  const basePrice = priceMap.get(row.sku) ?? null;
                  const taxedPrice = basePrice !== null ? applyTax(basePrice, taxRates) : null;
                  return (
                    <tr key={row.sku} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.sku}</td>
                      <td className="px-5 py-3 text-ink">{row.name}</td>
                      <td className="px-5 py-3 font-mono text-ink">{row.onHand}</td>
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.reserved}</td>
                      <td className="px-5 py-3 font-mono" style={{ color: low ? "var(--danger)" : "var(--ink)" }}>
                        {available}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink">
                        {basePrice !== null ? formatPrice(basePrice) : <span className="text-ink-soft/40">—</span>}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-soft">
                        {basePrice !== null && hasTax
                          ? formatPrice(taxedPrice! - basePrice)
                          : <span className="text-ink-soft/40">—</span>}
                      </td>
                      <td className="px-5 py-3 font-mono font-medium" style={{ color: hasTax ? "var(--accent)" : "var(--ink)" }}>
                        {taxedPrice !== null ? formatPrice(taxedPrice) : <span className="text-ink-soft/40">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${low ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                          {low ? "Reorder" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <Pagination
            page={pager.page}
            pageCount={pager.pageCount}
            total={pager.total}
            pageSize={pager.pageSize}
            onPage={pager.setPage}
            label="SKUs"
          />
        </div>
      </div>
    </>
  );
}
