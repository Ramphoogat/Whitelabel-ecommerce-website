"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice, unsplashUrl } from "@/lib/data/products";

export function ProductCard({ product }: { product: Product }) {
  const [activeColor, setActiveColor] = useState(product.colors[0]);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)]"
        style={{ background: product.tone }}
      >
        <Image
          src={unsplashUrl(product.image, 600)}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.new && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">
            New
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-[15px] leading-tight text-ink">{product.name}</h3>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
            {product.category}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-[13px] text-ink">{formatPrice(product.price)}</p>
          {product.compareAtPrice && (
            <p className="font-mono text-[11px] text-ink-soft line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          )}
        </div>
      </div>

      {product.colors.length > 1 && (
        <div className="mt-2 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveColor(c);
              }}
              aria-label={c.name}
              aria-pressed={c.name === activeColor.name}
              className="size-3.5 rounded-full transition-transform hover:scale-110"
              style={{
                background: c.hex,
                boxShadow:
                  c.name === activeColor.name
                    ? "0 0 0 1.5px var(--bone), 0 0 0 2.5px var(--ink)"
                    : "0 0 0 1px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
