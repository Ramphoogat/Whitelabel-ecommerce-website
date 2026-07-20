import { useStaffStore } from "@/stores/staff-store";
import { ApiError } from "./client";
import type { StoreThemeConfig } from "@/lib/theme/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Same envelope-unwrapping wrapper as client.ts, but authenticated with the STAFF token. */
async function staffRequest<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = useStaffStore.getState().accessToken;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = json?.message || `Request failed with ${res.status}`;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }

  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

// ----- Auth -----

export interface StaffAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: string };
}

export function loginStaff(input: { email: string; password: string }) {
  return staffRequest<StaffAuthResponse>("/auth/login", { method: "POST", body: input });
}

// ----- Catalog -----

export interface AdminApiVariant {
  _id: string;
  sku: string;
  priceCents: number;
  options: Record<string, string>;
  isActive: boolean;
}

export interface AdminApiProduct {
  _id: string;
  title: string;
  slug: string;
  brand: string;
  status: "draft" | "active" | "archived";
  images: string[];
  attributes: Record<string, unknown>;
  variants: AdminApiVariant[];
}

export function listAdminProducts() {
  return staffRequest<AdminApiProduct[]>("/admin/catalog/products");
}

export interface CreateProductInput {
  title: string;
  brand?: string;
  description?: string;
  status?: "draft" | "active" | "archived";
}

export function createProduct(input: CreateProductInput) {
  return staffRequest<AdminApiProduct>("/admin/catalog/products", { method: "POST", body: input });
}

export function createVariant(input: {
  productId: string;
  sku: string;
  priceCents: number;
  initialQuantity?: number;
  options?: Record<string, string>;
}) {
  return staffRequest<AdminApiVariant>("/admin/catalog/variants", { method: "POST", body: input });
}

export function updateProduct(id: string, input: Partial<CreateProductInput>) {
  return staffRequest<AdminApiProduct>(`/admin/catalog/products/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteProduct(id: string) {
  return staffRequest<void>(`/admin/catalog/products/${id}`, { method: "DELETE" });
}

// ----- Orders -----

export interface AdminApiOrderItem {
  variantId: string;
  sku?: string;
  title?: string;
  quantity: number;
  unitPriceCents: number;
}

export interface AdminApiOrder {
  _id: string;
  orderNumber: string;
  contactEmail: string | null;
  totalCents: number;
  subtotalCents?: number;
  taxCents?: number;
  discountCents?: number;
  status: string;
  createdAt: string;
  items: AdminApiOrderItem[];
  shippingAddress?: {
    fullName?: string;
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export function listAdminOrders() {
  return staffRequest<AdminApiOrder[] | { items: AdminApiOrder[] }>("/admin/orders");
}

export function getAdminOrder(id: string) {
  return staffRequest<AdminApiOrder>(`/admin/orders/${id}`);
}

export function updateOrderStatus(id: string, status: string) {
  return staffRequest<AdminApiOrder>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

// ----- Customers -----

export interface AdminApiCustomer {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  loyaltyPoints?: number;
  createdAt: string;
}

export function listAdminCustomers() {
  return staffRequest<AdminApiCustomer[]>("/admin/customers");
}

export function getAdminCustomer(id: string) {
  return staffRequest<AdminApiCustomer & { addresses: unknown[]; reviews: unknown[] }>(
    `/admin/customers/${id}`,
  );
}

// ----- Inventory -----

export interface AdminApiInventoryItem {
  _id: string;
  variantId: string;
  sku: string;
  productTitle: string;
  availableQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export function listAdminInventory() {
  return staffRequest<AdminApiInventoryItem[]>("/admin/inventory");
}

export function adjustInventory(variantId: string, quantityDelta: number, note?: string) {
  return staffRequest("/admin/inventory/adjust", {
    method: "POST",
    body: { variantId, quantityDelta, note },
  });
}

// ----- Payment gateways -----

export interface AdminApiGateway {
  _id: string;
  provider: string;
  isActive: boolean;
  priority?: number;
  supportedModes?: string[];
}

export function listPaymentGateways() {
  return staffRequest<AdminApiGateway[]>("/admin/payment-gateways");
}

export function updatePaymentGateway(id: string, input: { isActive?: boolean }) {
  return staffRequest<AdminApiGateway>(`/admin/payment-gateways/${id}`, {
    method: "PATCH",
    body: input,
  });
}

// ----- Tax -----

export interface AdminApiTaxRate {
  _id: string;
  name: string;
  type: "percentage" | "fixed";
  rate: number;
  countryCode?: string;
  stateCode?: string;
  categorySlug?: string;
  priority: number;
  isActive: boolean;
}

export function listTaxRates() {
  return staffRequest<AdminApiTaxRate[]>("/admin/tax/rates");
}

export function createTaxRate(
  input: Omit<AdminApiTaxRate, "_id" | "isActive"> & { isActive?: boolean },
) {
  return staffRequest<AdminApiTaxRate>("/admin/tax/rates", { method: "POST", body: input });
}

export function updateTaxRate(id: string, input: Partial<AdminApiTaxRate>) {
  return staffRequest<AdminApiTaxRate>(`/admin/tax/rates/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteTaxRate(id: string) {
  return staffRequest<void>(`/admin/tax/rates/${id}`, { method: "DELETE" });
}

// ----- Currency -----

export interface AdminApiCurrencyRate {
  _id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  isActive: boolean;
}

export function listCurrencyRates() {
  return staffRequest<AdminApiCurrencyRate[]>("/admin/currency/rates");
}

export function upsertCurrencyRate(input: {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}) {
  return staffRequest<AdminApiCurrencyRate>("/admin/currency/rates", {
    method: "POST",
    body: input,
  });
}

export function deleteCurrencyRate(id: string) {
  return staffRequest<void>(`/admin/currency/rates/${id}`, { method: "DELETE" });
}

// ----- Marketing -----

export function createCoupon(input: {
  code: string;
  type: "percentage" | "flat";
  value: number;
  usageLimit?: number;
  expiresAt?: string;
}) {
  return staffRequest("/admin/marketing/coupons", { method: "POST", body: input });
}

export function createBanner(input: { title: string; placement: string; imageUrl?: string }) {
  return staffRequest("/admin/marketing/banners", { method: "POST", body: input });
}

// ----- Organization / Theme -----

export interface AdminOrganizationSettings {
  storeName: string;
  businessType: string;
  currency: string;
  language: string;
  theme: Partial<StoreThemeConfig>;
  adminTheme: Partial<StoreThemeConfig>;
}

export type ThemeScope = "store" | "admin";

export function getOrganizationSettings() {
  return staffRequest<AdminOrganizationSettings>("/admin/organization/settings");
}

export function updateOrganizationTheme(scope: ThemeScope, input: Partial<StoreThemeConfig>) {
  return staffRequest<AdminOrganizationSettings>(
    scope === "store" ? "/admin/organization/theme" : "/admin/organization/admin-theme",
    { method: "PATCH", body: input },
  );
}

// ----- CMS -----

export function createCmsPage(input: { title: string; slug: string; content?: string }) {
  return staffRequest("/admin/cms/pages", { method: "POST", body: input });
}

export function createBlogPost(input: { title: string; slug: string; content?: string }) {
  return staffRequest("/admin/cms/blog-posts", { method: "POST", body: input });
}
