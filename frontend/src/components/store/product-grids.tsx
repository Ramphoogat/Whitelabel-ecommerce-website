"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/use-catalog";
import { ProductCard } from "@/components/store/product-card";

export function ProductGrids() {
  const { products, usingRealData } = useProducts();
  const newArrivals = products.filter((p) => p.new);
  const featured = newArrivals.length > 0 ? newArrivals : products.slice(0, 4);

  return (
    <>
      <section className="border-t border-line/70 bg-surface/50 py-16 mt-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl italic text-ink">
              {newArrivals.length > 0 ? "New Arrivals" : "Featured"}
            </h2>
            <Link
              href="/products?filter=new"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
            >
              View all
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl italic text-ink">Full Collection</h2>
          {!usingRealData && (
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/60">
              Demo catalog
            </span>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
