"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice, unsplashUrl } from "@/lib/data/products";
import { useCartStore } from "@/stores/cart-store";

export function ProductDetail({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const addLine = useCartStore((s) => s.addLine);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 md:grid-cols-2 md:gap-16 md:py-16">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] md:sticky md:top-24"
        style={{ background: product.tone }}
      >
        <Image
          src={unsplashUrl(product.image, 900)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </div>

      <div className="max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          {product.category}
        </p>
        <h1 className="mt-1 font-display text-3xl italic text-ink">{product.name}</h1>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="font-mono text-[15px] text-ink">{formatPrice(product.price)}</p>
          {product.compareAtPrice && (
            <p className="font-mono text-[13px] text-ink-soft line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          )}
        </div>

        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Colour — {color.name}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c.name}
                aria-pressed={c.name === color.name}
                className="size-7 rounded-full transition-transform hover:scale-110"
                style={{
                  background: c.hex,
                  boxShadow:
                    c.name === color.name
                      ? "0 0 0 2px var(--bone), 0 0 0 3.5px var(--ink)"
                      : "0 0 0 1px rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">Size</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className="rounded-full border px-3.5 py-1.5 font-mono text-[12px] transition-colors"
                style={{
                  borderColor: s === size ? "var(--ink)" : "var(--line)",
                  background: s === size ? "var(--ink)" : "transparent",
                  color: s === size ? "var(--bone)" : "var(--ink)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!size}
          onClick={() =>
            size &&
            addLine({
              slug: product.slug,
              name: product.name,
              price: product.price,
              tone: color.hex,
              color: color.name,
              size,
            })
          }
          className="mt-9 w-full rounded-full bg-accent px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {size ? "Add to cart" : "Select a size"}
        </button>

        <p className="mt-6 text-[13px] leading-relaxed text-ink-soft">
          Cut from a heavyweight cotton-linen blend and garment-washed for a
          softer hand. Made in small batches; restocks are not guaranteed.
        </p>
      </div>
    </div>
  );
}
