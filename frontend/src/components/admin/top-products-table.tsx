"use client";

import { useState } from "react";

interface ProductRow {
  name: string;
  sku: string;
  unitPrice: number; // paise
  daily: number;     // units sold today
  weekly: number;
  monthly: number;
  yearly: number;
}

const PRODUCTS: ProductRow[] = [
  { name: "Field Overshirt",     sku: "FOS-001", unitPrice: 349900, daily: 6,  weekly: 38,  monthly: 128, yearly: 1420 },
  { name: "Selvedge Denim",      sku: "SDJ-002", unitPrice: 529900, daily: 4,  weekly: 27,  monthly: 96,  yearly: 1104 },
  { name: "Washed Linen Shirt",  sku: "WLS-003", unitPrice: 219900, daily: 3,  weekly: 22,  monthly: 84,  yearly:  980 },
  { name: "Wool Crew Sweater",   sku: "WCS-004", unitPrice: 449900, daily: 2,  weekly: 14,  monthly: 51,  yearly:  612 },
  { name: "Canvas Work Pant",    sku: "CWP-005", unitPrice: 379900, daily: 2,  weekly: 11,  monthly: 43,  yearly:  498 },
  { name: "Merino Base Layer",   sku: "MBL-006", unitPrice: 189900, daily: 1,  weekly:  8,  monthly: 29,  yearly:  344 },
];

type Period = "daily" | "weekly" | "monthly" | "yearly";

function fmt(paise: number) {
  return "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "daily",   label: "Daily"   },
  { key: "weekly",  label: "Weekly"  },
  { key: "monthly", label: "Monthly" },
  { key: "yearly",  label: "Yearly"  },
];

export function TopProductsTable() {
  const [period, setPeriod] = useState<Period>("monthly");

  const rows = PRODUCTS.map((p) => ({
    ...p,
    units: p[period],
    revenue: p[period] * p.unitPrice,
  })).sort((a, b) => b.revenue - a.revenue);

  const totalUnits = rows.reduce((s, r) => s + r.units, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const maxRevenue = rows[0]?.revenue ?? 1;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-medium text-ink">Top Products</h2>
        <div className="flex gap-1 rounded-full border border-line/70 bg-surface p-0.5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: period === key ? "var(--accent)" : "transparent",
                color: period === key ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-line/70 bg-surface">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">#</th>
              <th className="px-5 py-3 font-normal">Product</th>
              <th className="px-5 py-3 font-normal">SKU</th>
              <th className="px-5 py-3 font-normal text-right">Unit price</th>
              <th className="px-5 py-3 font-normal text-right">Units sold</th>
              <th className="px-5 py-3 font-normal text-right" style={{ color: "var(--accent)" }}>Revenue</th>
              <th className="w-32 px-5 py-3 font-normal">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const barWidth = Math.round((p.revenue / maxRevenue) * 100);
              return (
                <tr key={p.sku} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                  <td className="px-5 py-3 font-mono text-[11px] text-ink-soft">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-ink-soft">{p.sku}</td>
                  <td className="px-5 py-3 text-right font-mono text-ink-soft">{fmt(p.unitPrice)}</td>
                  <td className="px-5 py-3 text-right font-mono text-ink">{p.units.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right font-mono font-medium" style={{ color: "var(--accent)" }}>
                    {fmt(p.revenue)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/60">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, background: "var(--accent)" }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-ink-soft">
                        {Math.round((p.revenue / totalRevenue) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-line/70 bg-bone/40">
              <td colSpan={4} className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Total</td>
              <td className="px-5 py-3 text-right font-mono font-medium text-ink">{totalUnits.toLocaleString("en-IN")}</td>
              <td className="px-5 py-3 text-right font-mono font-medium" style={{ color: "var(--accent)" }}>{fmt(totalRevenue)}</td>
              <td className="px-5 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
