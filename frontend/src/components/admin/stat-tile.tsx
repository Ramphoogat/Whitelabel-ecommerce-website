"use client";

import { useState } from "react";

export interface StatDetail {
  rows: { label: string; value: string; sub?: string }[];
  footer?: string;
}

export function StatTile({
  label,
  value,
  delta,
  up,
  index = 0,
  detail,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  index?: number;
  detail?: StatDetail;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="animate-rise hover-glow rounded-[var(--radius-lg)] transition-all duration-300"
      style={{
        animationDelay: `${index * 80}ms`,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: open
          ? "0 0 0 2px var(--accent), 0 8px 32px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      {/* Summary row */}
      <button
        type="button"
        onClick={() => detail && setOpen((o) => !o)}
        className={`w-full p-5 text-left ${detail ? "cursor-pointer" : "cursor-default"}`}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
        <p className="mt-2 font-display text-2xl font-medium text-ink">{value}</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-mono text-[11px]" style={{ color: up ? "var(--success)" : "var(--danger)" }}>
            {up ? "↑" : "↓"} {delta}
          </p>
          {detail && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.08em] transition-colors"
              style={{ color: open ? "var(--accent)" : "var(--ink-soft)" }}
            >
              {open ? "▲ less" : "▼ more"}
            </span>
          )}
        </div>
      </button>

      {/* Expanded detail panel */}
      {detail && open && (
        <div
          className="border-t px-5 pb-5 pt-4"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="space-y-2.5">
            {detail.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] text-ink-soft">{row.label}</span>
                <div className="text-right">
                  <span className="font-mono text-[13px] font-medium text-ink">{row.value}</span>
                  {row.sub && (
                    <span className="ml-2 font-mono text-[10px] text-ink-soft">{row.sub}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {detail.footer && (
            <p className="mt-3 border-t pt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft" style={{ borderColor: "var(--line)" }}>
              {detail.footer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
