import { useQuery } from "@tanstack/react-query";
import { listStorefrontProducts, getStorefrontProductBySlug } from "@/lib/api/catalog.api";
import { mapListProduct, mapDetailProduct } from "@/lib/data/map-product";
import { PRODUCTS, type Product } from "@/lib/data/products";

/**
 * A brand-new store has an empty database until the owner adds products in
 * admin — so the storefront can't just show "nothing here" on day one. This
 * hook tries the real API first; the moment real, active products exist it
 * switches over automatically. Until then (or if the API is unreachable,
 * e.g. this frontend running standalone) it shows the curated demo catalog
 * so the design is never staring at an empty grid.
 */
export function useProducts() {
  const query = useQuery({
    queryKey: ["storefront-products"],
    queryFn: () => listStorefrontProducts(),
    retry: 0,
  });

  const apiProducts = query.data?.items.map(mapListProduct) ?? [];
  const usingRealData = query.isSuccess && apiProducts.length > 0;

  return {
    products: usingRealData ? apiProducts : PRODUCTS,
    usingRealData,
    isLoading: query.isLoading,
  };
}

export function useProduct(slug: string) {
  const query = useQuery({
    queryKey: ["storefront-product", slug],
    queryFn: () => getStorefrontProductBySlug(slug),
    retry: 0,
  });

  const fallback = PRODUCTS.find((p) => p.slug === slug) ?? null;
  const product: Product | null = query.isSuccess ? mapDetailProduct(query.data) : fallback;

  return {
    product,
    usingRealData: query.isSuccess,
    isLoading: query.isLoading,
  };
}
