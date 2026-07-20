"use client";

import { AdminTopbar } from "@/components/admin/topbar";
import { useAdminCustomers } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/data/products";

export default function AdminCustomersPage() {
  const { customers, fallback, usingRealData, isLoading } = useAdminCustomers();

  return (
    <>
      <AdminTopbar title="Customers" />
      <div className="px-6 py-8">
        {!usingRealData && !isLoading && (
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-soft">
              Demo data
            </span>
            <span className="text-[12px] text-ink-soft">
              Connect the backend to see live customers.
            </span>
          </div>
        )}
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Email</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal">Points</th>
                <th className="px-5 py-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTable rows={6} cols={5} />}

              {usingRealData &&
                customers.map((c) => (
                  <tr key={c._id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-line-soft font-mono text-[11px] text-ink-soft">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                        <span className="text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                          c.isActive
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {c.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">
                      {c.loyaltyPoints ?? 0}
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">
                      {c.createdAt?.slice(0, 10) ?? "—"}
                    </td>
                  </tr>
                ))}

              {/* Demo fallback */}
              {!usingRealData &&
                !isLoading &&
                fallback?.map((c) => (
                  <tr key={c.id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-line-soft font-mono text-[11px] text-ink-soft">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                        <span className="text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.email}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-success">
                        Active
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.orders}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">
                      {formatPrice(c.lifetimeValue)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
