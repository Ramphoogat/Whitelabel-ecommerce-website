"use client";

import { useEffect, useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Client-side pagination over an already-filtered list. Clamps the current
 * page when the list shrinks (e.g. a filter is applied on page 3).
 */
export function usePagination<T>(items: T[], pageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const safePage = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return { pageItems, page: safePage, pageCount, setPage, total: items.length, pageSize };
}

/** Page numbers with ellipsis: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize = DEFAULT_PAGE_SIZE,
  onPage,
  label = "rows",
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize?: number;
  onPage: (page: number) => void;
  label?: string;
}) {
  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 bg-bone px-5 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
        {from}–{to} of {total} {label}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
          className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-soft transition-all hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
        >
          ←
        </button>
        {pageWindow(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 font-mono text-[11px] text-ink-soft/50">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className="min-w-7 rounded-full px-2 py-1 font-mono text-[11px] transition-all"
              style={{
                background: p === page ? "var(--accent)" : "transparent",
                color: p === page ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
          className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-soft transition-all hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}
