"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[store error]", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-display text-3xl italic text-ink">Something went wrong</p>
      <p className="text-[14px] leading-relaxed text-ink-soft">{error.message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="rounded-full border border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-ink"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
