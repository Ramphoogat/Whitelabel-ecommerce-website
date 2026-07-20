"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listStorefrontProducts } from "@/lib/api/catalog.api";
import { mapListProduct } from "@/lib/data/map-product";
import { PRODUCTS } from "@/lib/data/products";
import { ProductCard } from "@/components/store/product-card";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { useStoreTheme } from "@/components/theme/theme-provider";
import { GRID_DENSITY_CLASSES } from "@/lib/theme/presets";

const PAGE_SIZE = 16;

function ProductsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialFilter = searchParams.get("filter") ?? "";
  const initialPage = Number(searchParams.get("page") ?? "1");

  const { storeTheme } = useStoreTheme();
  const gridClass = GRID_DENSITY_CLASSES[storeTheme.gridDensity] ?? GRID_DENSITY_CLASSES[4];
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search → reset page to 1
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const query = useQuery({
    queryKey: ["storefront-products", debouncedSearch, page],
    queryFn: () =>
      listStorefrontProducts({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
    retry: 0,
  });

  const usingRealData = query.isSuccess && (query.data?.items.length ?? 0) > 0;
  const products = usingRealData
    ? query.data!.items.map(mapListProduct)
    : debouncedSearch
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : initialFilter === "new"
    ? PRODUCTS.filter((p) => p.new)
    : PRODUCTS;

  const totalPages = usingRealData ? (query.data?.totalPages ?? 1) : 1;
  const total = usingRealData ? (query.data?.total ?? products.length) : products.length;

  function goPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const title = debouncedSearch
    ? `Results for "${debouncedSearch}"`
    : initialFilter === "new"
    ? "New Arrivals"
    : "Shop All";

  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingBlock: "var(--section-y, 3.5rem)" }}>
      {/* Header + search */}
      <div className="flex flex-col gap-4 border-b border-line/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            {query.isLoading ? "…" : `${total} pieces`}
          </p>
          <h1
            className="mt-1 font-display italic text-ink"
            style={{ fontSize: "calc(1.875rem * var(--type-display, 1))" }}
          >
            {title}
          </h1>
        </div>
        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="input-field w-full sm:w-64"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setDebouncedSearch(""); }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-ink-soft hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className={`mt-10 ${gridClass}`}>
        {query.isLoading ? (
          <SkeletonGrid count={PAGE_SIZE} />
        ) : products.length === 0 ? (
          <p className="col-span-full py-16 text-center text-[14px] text-ink-soft">
            No products found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}.
          </p>
        ) : (
          products.map((p) => <ProductCard key={p.slug} product={p} />)
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={goPage} />
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
