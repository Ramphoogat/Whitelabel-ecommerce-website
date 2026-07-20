import { apiRequest } from "./client";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RawProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  images: string[];
  status: string;
  attributes: Record<string, unknown>;
  fromPriceCents?: number | null;
}

export interface RawVariant {
  _id: string;
  productId: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  options: Record<string, string>;
  imageUrl: string;
  isActive: boolean;
}

export interface RawProductDetail extends RawProduct {
  variants: RawVariant[];
}

export function listStorefrontProducts(params?: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.categoryId) qs.set("categoryId", params.categoryId);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiRequest<PaginatedResponse<RawProduct>>(`/storefront/products${suffix}`);
}

export function getStorefrontProductBySlug(slug: string) {
  return apiRequest<RawProductDetail>(`/storefront/products/${slug}`);
}
