"use client";

import { AdminTopbar } from "@/components/admin/topbar";
import { useAdminInventory } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";

export default function AdminInventoryPage() {
  const { inventory, fallback, usingRealData, isLoading } = useAdminInventory();

  return (
    <>
      <AdminTopbar title="Inventory" />
      <div className="px-6 py-8">
        {!usingRealData && !isLoading && (
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-soft">
              Demo data
            </span>
            <span className="text-[12px] text-ink-soft">
              Connect the backend to see live stock levels.
            </span>
          </div>
        )}

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">SKU</th>
                <th className="px-5 py-3 font-normal">Product</th>
                <th className="px-5 py-3 font-normal">On Hand</th>
                <th className="px-5 py-3 font-normal">Reserved</th>
                <th className="px-5 py-3 font-normal">Available</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTable rows={8} cols={6} />}

              {usingRealData &&
                inventory.map((row) => {
                  const low = row.availableQuantity <= row.lowStockThreshold;
                  return (
                    <tr
                      key={row._id}
                      className="border-b border-line/50 last:border-0 hover:bg-bone/60"
                    >
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.sku}</td>
                      <td className="px-5 py-3 text-ink">{row.productTitle}</td>
                      <td className="px-5 py-3 font-mono text-ink">
                        {row.availableQuantity + row.reservedQuantity}
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.reservedQuantity}</td>
                      <td
                        className="px-5 py-3 font-mono"
                        style={{ color: low ? "var(--danger)" : "var(--ink)" }}
                      >
                        {row.availableQuantity}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                            low ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                          }`}
                        >
                          {low ? "Reorder" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

              {/* Demo fallback */}
              {!usingRealData &&
                !isLoading &&
                fallback?.map((row) => {
                  const available = row.onHand - row.reserved;
                  const low = available <= row.reorderPoint;
                  return (
                    <tr
                      key={row.sku}
                      className="border-b border-line/50 last:border-0 hover:bg-bone/60"
                    >
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.sku}</td>
                      <td className="px-5 py-3 text-ink">{row.name}</td>
                      <td className="px-5 py-3 font-mono text-ink">{row.onHand}</td>
                      <td className="px-5 py-3 font-mono text-ink-soft">{row.reserved}</td>
                      <td
                        className="px-5 py-3 font-mono"
                        style={{ color: low ? "var(--danger)" : "var(--ink)" }}
                      >
                        {available}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                            low ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                          }`}
                        >
                          {low ? "Reorder" : "In stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
