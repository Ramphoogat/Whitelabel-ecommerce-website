"use client";

import { useState, Fragment } from "react";
import { STATUS_STYLES, RECENT_ORDERS } from "@/lib/data/admin";
import { useAdminOrders } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";
import type { AdminOrder, OrderStatus } from "@/lib/data/admin";

/* ── Order journey steps ──────────────────────────────────────────────── */
const STEPS: { key: OrderStatus | "placed"; label: string }[] = [
  { key: "placed",     label: "Order Placed" },
  { key: "pending",    label: "Awaiting Payment" },
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
];

const STEP_ORDER = ["placed", "pending", "processing", "shipped", "delivered"];

function stepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  const idx = STEP_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l2.5 2.5L8 3" />
    </svg>
  );
}

function TrackingBar({ status }: { status: OrderStatus }) {
  const cancelled = status === "cancelled";
  const active = stepIndex(status);

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-danger/20 bg-danger/5 px-4 py-3">
        <span className="flex size-6 items-center justify-center rounded-full bg-danger/15 text-danger">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l6 6M8 2L2 8" />
          </svg>
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-danger">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {STEPS.filter(s => s.key !== "pending" || status === "pending").map((step, i, arr) => {
        const steps = arr;
        const stepIdx = steps.indexOf(step);
        const done = stepIdx <= active;
        const current = stepIdx === active;
        const last = stepIdx === steps.length - 1;

        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex size-6 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  borderColor: done ? "var(--accent)" : "var(--line)",
                  background: done ? "var(--accent)" : "var(--bone)",
                  color: done ? "var(--accent-ink)" : "var(--ink-soft)",
                }}
              >
                {done ? <CheckIcon /> : (
                  <span className="text-[8px] font-mono">{stepIdx + 1}</span>
                )}
              </div>
              <span
                className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em]"
                style={{ color: current ? "var(--accent)" : done ? "var(--ink)" : "var(--ink-soft)" }}
              >
                {step.label}
              </span>
            </div>
            {!last && (
              <div
                className="mx-2 mb-4 h-[2px] flex-1 rounded-full"
                style={{ background: stepIdx < active ? "var(--accent)" : "var(--line)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Expanded row panel ───────────────────────────────────────────────── */
function ExpandedPanel({ order }: { order: AdminOrder }) {
  return (
    <tr>
      <td colSpan={6} className="border-b border-line/50 bg-bone/40 px-5 pb-5 pt-4">
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Customer info */}
          <div className="space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">Customer</p>
            <div className="rounded-[var(--radius-md)] border border-line/60 bg-surface p-4 text-[13px]">
              <p className="font-medium text-ink">{order.customer}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-ink-soft">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 2.5h9M1 5.5h6M1 8.5h4" />
                  </svg>
                  <span className="font-mono text-[11px]">{order.email}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 1.5h2l1 2.5-1.5 1a6 6 0 002.5 2.5l1-1.5L9.5 7v2a1 1 0 01-1 1A8 8 0 011.5 2.5a1 1 0 011-1z" />
                  </svg>
                  <span className="font-mono text-[11px]">{order.phone}</span>
                </div>
              </div>

              <div className="mt-3 border-t border-line/50 pt-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft">Delivery address</p>
                <div className="mt-1.5 flex items-start gap-2">
                  <svg className="mt-0.5 shrink-0 text-accent" width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5.5 1C3.5 1 2 2.5 2 4.5c0 3 3.5 5.5 3.5 5.5S9 7.5 9 4.5C9 2.5 7.5 1 5.5 1z" />
                    <circle cx="5.5" cy="4.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  <p className="text-[12px] leading-relaxed text-ink">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">Order progress</p>
            <div className="rounded-[var(--radius-md)] border border-line/60 bg-surface p-4">
              <TrackingBar status={order.status} />
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── Table ────────────────────────────────────────────────────────────── */
export function OrdersTable() {
  const { orders, isLoading } = useAdminOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge real orders with demo address fields when using real data
  const enriched = orders.map((o) => {
    const demo = RECENT_ORDERS.find((d) => d.id === o.id);
    return {
      ...o,
      email: demo?.email ?? "—",
      phone: demo?.phone ?? "—",
      address: demo?.address ?? "Address not available",
    } as AdminOrder;
  });

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
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
              enriched.map((o) => {
                const expanded = expandedId === o._id;
                return (
                  <Fragment key={o._id}>
                    <tr
                      onClick={() => toggle(o._id)}
                      className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60"
                      style={{ background: expanded ? "var(--accent-soft)" : undefined }}
                    >
                      <td className="px-5 py-3 font-mono text-ink">{o.id}</td>
                      <td className="px-5 py-3 text-ink">
                        <span className="flex items-center gap-2">
                          {o.customer}
                          <svg
                            width="10" height="10" viewBox="0 0 10 10" fill="none"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            className="text-ink-soft transition-transform"
                            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          >
                            <path d="M2 3.5l3 3 3-3" />
                          </svg>
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-ink-soft">{o.date}</td>
                      <td className="px-5 py-3 text-ink-soft">{o.items}</td>
                      <td className="px-5 py-3 font-mono text-ink">{o.total}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_STYLES[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                    {expanded && <ExpandedPanel order={o} />}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
