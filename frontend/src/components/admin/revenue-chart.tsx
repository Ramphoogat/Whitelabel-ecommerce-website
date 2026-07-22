"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/data/products";

type Range = "Daily" | "Weekly" | "Monthly" | "Yearly";

const REVENUE_BY_RANGE: Record<Range, { label: string; value: number }[]> = {
  Daily: [
    { label: "6a", value: 2400 }, { label: "9a", value: 6800 }, { label: "12p", value: 11200 },
    { label: "3p", value: 9400 }, { label: "6p", value: 15800 }, { label: "9p", value: 13100 },
    { label: "12a", value: 4200 },
  ],
  Weekly: [
    { label: "Mon", value: 42000 }, { label: "Tue", value: 38000 }, { label: "Wed", value: 51000 },
    { label: "Thu", value: 47000 }, { label: "Fri", value: 63000 }, { label: "Sat", value: 71000 },
    { label: "Sun", value: 58000 },
  ],
  Monthly: [
    { label: "W1", value: 214000 }, { label: "W2", value: 246000 },
    { label: "W3", value: 198000 }, { label: "W4", value: 271000 },
  ],
  Yearly: [
    { label: "Jan", value: 820000 }, { label: "Feb", value: 760000 }, { label: "Mar", value: 910000 },
    { label: "Apr", value: 870000 }, { label: "May", value: 940000 }, { label: "Jun", value: 1020000 },
    { label: "Jul", value: 980000 }, { label: "Aug", value: 890000 }, { label: "Sep", value: 950000 },
    { label: "Oct", value: 1110000 }, { label: "Nov", value: 1230000 }, { label: "Dec", value: 1340000 },
  ],
};

export function RevenueChart() {
  const [range, setRange] = useState<Range>("Weekly");
  const data = REVENUE_BY_RANGE[range];
  const max = Math.max(...data.map((d) => d.value));
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <section className="rounded-[var(--radius-lg)] p-6" style={{ background: "var(--surface)", border: "1px solid var(--surface)", boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-medium text-ink">Revenue</h2>
          <p className="mt-0.5 font-mono text-[12px] text-ink-soft">
            {formatPrice(total)} · {range.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-line p-1">
          {(Object.keys(REVENUE_BY_RANGE) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className="rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors"
              style={{
                background: range === r ? "var(--accent)" : "transparent",
                color: range === r ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {/* Fixed-height bar area — percentage heights need a sized parent. */}
        <div className="flex h-36 items-end gap-2">
          {data.map((d) => (
            <div
              key={d.label}
              title={`${d.label}: ${formatPrice(d.value)}`}
              className="group relative flex-1 rounded-t-[6px] transition-all duration-300 hover:opacity-80"
              style={{
                height: `${Math.max(4, (d.value / max) * 100)}%`,
                background: "linear-gradient(to top, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--surface)))",
              }}
            >
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-ink opacity-0 transition-opacity group-hover:opacity-100">
                {formatPrice(d.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {data.map((d) => (
            <span key={d.label} className="flex-1 text-center font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
