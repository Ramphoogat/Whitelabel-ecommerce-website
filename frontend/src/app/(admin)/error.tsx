"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-danger">
        Something went wrong
      </p>
      <p className="max-w-sm text-[14px] text-ink-soft">{error.message}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-full border border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
      >
        Try again
      </button>
    </div>
  );
}
