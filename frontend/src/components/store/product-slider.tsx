"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data/products";
import { ProductCard } from "./product-card";

/**
 * Horizontal scroll-snap product slider. Driven three ways: the arrow
 * buttons, trackpad/touch scrolling, and ← / → keys while the slider is
 * hovered or focused.
 */
export function ProductSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, products.length]);

  const slide = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); slide(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); slide(-1); }
  }

  function Arrow({ dir }: { dir: 1 | -1 }) {
    const enabled = dir === 1 ? canNext : canPrev;
    return (
      <button
        type="button"
        aria-label={dir === 1 ? "Next products" : "Previous products"}
        disabled={!enabled}
        onClick={() => slide(dir)}
        className="flex size-10 items-center justify-center rounded-full border transition-all disabled:opacity-25"
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
          color: "var(--ink)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {dir === 1 ? <path d="M5 2.5L9.5 7 5 11.5" /> : <path d="M9 2.5L4.5 7 9 11.5" />}
        </svg>
      </button>
    );
  }

  return (
    <div
      className="group/slider relative outline-none"
      tabIndex={0}
      role="region"
      aria-label="Product slider — use arrow keys to browse"
      onKeyDown={onKeyDown}
    >
      <div
        ref={trackRef}
        className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {products.map((p) => (
          <div
            key={p.slug}
            data-slide
            className="w-[70vw] shrink-0 snap-start sm:w-[38vw] lg:w-[calc((min(72rem,100vw-2.5rem)-3.75rem)/4)]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute -top-14 right-0 flex gap-2">
        <span className="pointer-events-auto"><Arrow dir={-1} /></span>
        <span className="pointer-events-auto"><Arrow dir={1} /></span>
      </div>
    </div>
  );
}
