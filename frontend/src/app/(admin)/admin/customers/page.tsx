"use client";

import { useState, useRef, useEffect } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { useAdminCustomers } from "@/hooks/use-admin-data";
import { SkeletonTable } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/data/products";
import { CUSTOMERS } from "@/lib/data/admin-customers";

type SpendPeriod = "daily" | "weekly" | "monthly" | "yearly";

const PERIOD_LABELS: Record<SpendPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const JOIN_ICONS: Record<string, string> = {
  google: "G",
  facebook: "f",
  apple: "",
  email: "@",
  phone: "#",
};

const JOIN_COLORS: Record<string, string> = {
  google: "#4285F4",
  facebook: "#1877F2",
  apple: "var(--ink)",
  email: "var(--ink-soft)",
  phone: "var(--ink-soft)",
};

function JoinBadge({ via }: { via: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-line/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]"
      style={{ color: JOIN_COLORS[via] ?? "var(--ink-soft)" }}
    >
      <span className="font-bold">{JOIN_ICONS[via] ?? "?"}</span>
      {via}
    </span>
  );
}

function SpendDropdown({ value, onChange }: { value: SpendPeriod; onChange: (v: SpendPeriod) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft hover:text-ink"
      >
        {PERIOD_LABELS[value]}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[100px] overflow-hidden rounded-[var(--radius-md)] border border-line/70 bg-surface shadow-lg">
          {(Object.keys(PERIOD_LABELS) as SpendPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { onChange(p); setOpen(false); }}
              className="block w-full px-4 py-2 text-left font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-bone/80"
              style={{ color: p === value ? "var(--accent)" : "var(--ink-soft)" }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmt(paise: number) {
  if (paise === 0) return <span className="text-ink-soft/50">—</span>;
  return <>{formatPrice(paise)}</>;
}

export default function AdminCustomersPage() {
  const { customers, fallback, usingRealData, isLoading } = useAdminCustomers();
  const [spendPeriod, setSpendPeriod] = useState<SpendPeriod>("monthly");

  const spendKey: keyof typeof CUSTOMERS[0] = `spend${spendPeriod.charAt(0).toUpperCase() + spendPeriod.slice(1)}` as keyof typeof CUSTOMERS[0];

  return (
    <>
      <AdminTopbar title="Customers" />
      <div className="px-6 py-8">

        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Email</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal">Points</th>
                <th className="px-5 py-3 font-normal">Joined</th>
                <th className="px-5 py-3 font-normal">
                  <div className="flex items-center gap-2">
                    <span>Spend</span>
                    <SpendDropdown value={spendPeriod} onChange={setSpendPeriod} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTable rows={6} cols={6} />}

              {usingRealData &&
                customers.map((c) => (
                  <tr key={c._id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bone font-mono text-[11px] text-ink-soft">
                          {c.name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                        <span className="text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${c.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {c.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.loyaltyPoints ?? 0}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.createdAt?.slice(0, 10) ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">—</td>
                  </tr>
                ))}

              {/* Demo fallback */}
              {!usingRealData && !isLoading &&
                CUSTOMERS.map((c) => (
                  <tr key={c.id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bone font-mono text-[11px] text-ink-soft">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                        <span className="text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.email}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-success">Active</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.orders}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[12px] text-ink">{fmtDate(c.joined)}</span>
                        <JoinBadge via={c.joinVia} />
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-medium" style={{ color: (c[spendKey] as number) > 0 ? "var(--accent)" : undefined }}>
                      {fmt(c[spendKey] as number)}
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
