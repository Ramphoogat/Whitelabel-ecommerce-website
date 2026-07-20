"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/use-catalog";
import { ProductCard } from "@/components/store/product-card";
import { useStoreTheme } from "@/components/theme/theme-provider";
import { GRID_DENSITY_CLASSES } from "@/lib/theme/presets";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display italic tracking-tight text-ink"
      style={{ fontSize: "calc(1.75rem * var(--type-display, 1))" }}
    >
      {children}
    </h2>
  );
}

export function ProductGrids() {
  const { products, usingRealData } = useProducts();
  const { storeTheme } = useStoreTheme();
  const gridClass = GRID_DENSITY_CLASSES[storeTheme.gridDensity] ?? GRID_DENSITY_CLASSES[4];
  const newArrivals = products.filter((p) => p.new);
  const featured = newArrivals.length > 0 ? newArrivals : products.slice(0, 4);

  return (
    <>
      <section
        className="border-t border-line/50"
        style={{ paddingBlock: "var(--section-y, 5.5rem)", marginTop: "var(--section-y, 5.5rem)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-baseline justify-between">
            <SectionHeading>{newArrivals.length > 0 ? "New Arrivals" : "Featured"}</SectionHeading>
            <Link
              href="/products?filter=new"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-accent"
            >
              View all →
            </Link>
          </div>

          <div className={`mt-10 ${gridClass}`}>
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-line/50"
        style={{ paddingBlock: "var(--section-y, 5.5rem)" }}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-baseline justify-between">
            <SectionHeading>Full Collection</SectionHeading>
            {!usingRealData && (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/50">
                Demo catalog
              </span>
            )}
          </div>
          <div className={`mt-10 ${gridClass}`}>
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
