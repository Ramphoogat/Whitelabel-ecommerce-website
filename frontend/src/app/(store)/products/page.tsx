"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/use-catalog";
import { ProductCard } from "@/components/store/product-card";

function ProductsList() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const { products: allProducts } = useProducts();
  const products = filter === "new" ? allProducts.filter((p) => p.new) : allProducts;

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="flex items-baseline justify-between border-b border-line/70 pb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            {products.length} pieces
          </p>
          <h1 className="mt-1 font-display text-3xl italic text-ink">
            {filter === "new" ? "New Arrivals" : "Shop All"}
          </h1>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsList />
    </Suspense>
  );
}
