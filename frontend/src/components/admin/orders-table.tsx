"use client";

import { useRouter } from "next/navigation";
import { STATUS_STYLES } from "@/lib/data/admin";
import { useAdminOrders } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";

export function OrdersTable() {
  const router = useRouter();
  const { orders, usingRealData, isLoading } = useAdminOrders();

  return (
    <div>
      {!usingRealData && !isLoading && (
        <p className="mb-2 text-right font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/60">
          Demo data
        </p>
      )}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">Order</th>
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-5 py-3 font-normal">Items</th>
              <th className="px-5 py-3 font-normal">Total</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonTable rows={6} cols={6} />}
            {!isLoading &&
              orders.map((o) => (
                <tr
                  key={o._id}
                  onClick={() => router.push(`/admin/orders/${o._id}`)}
                  className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60"
                >
                  <td className="px-5 py-3 font-mono text-ink">{o.id}</td>
                  <td className="px-5 py-3 text-ink">{o.customer}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{o.date}</td>
                  <td className="px-5 py-3 text-ink-soft">{o.items}</td>
                  <td className="px-5 py-3 font-mono text-ink">{o.total}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_STYLES[o.status]}`}
                    >
                      {o.status}
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
