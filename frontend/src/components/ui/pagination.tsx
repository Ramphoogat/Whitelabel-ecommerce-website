"use client";

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 py-6 font-mono text-[12px]"
    >
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded px-3 py-1.5 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink disabled:opacity-30"
        aria-label="Previous page"
      >
        ←
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPage(1)} className="rounded px-3 py-1.5 hover:bg-line-soft">
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-ink-soft">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          aria-current={p === page ? "page" : undefined}
          className="rounded px-3 py-1.5 transition-colors hover:bg-line-soft"
          style={
            p === page
              ? { background: "var(--ink)", color: "var(--bone)" }
              : {}
          }
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-ink-soft">…</span>
          )}
          <button
            onClick={() => onPage(totalPages)}
            className="rounded px-3 py-1.5 hover:bg-line-soft"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded px-3 py-1.5 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink disabled:opacity-30"
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
