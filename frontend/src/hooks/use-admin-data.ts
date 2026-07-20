import { useQuery } from "@tanstack/react-query";
import {
  listAdminProducts,
  listAdminOrders,
  listAdminCustomers,
  listAdminInventory,
  listTaxRates,
  listCurrencyRates,
  listPaymentGateways,
  getAdminOrder,
  type AdminApiProduct,
  type AdminApiOrder,
  type AdminApiCustomer,
  type AdminApiInventoryItem,
  type AdminApiTaxRate,
  type AdminApiCurrencyRate,
  type AdminApiGateway,
} from "@/lib/api/admin.api";
import { ADMIN_PRODUCTS, type AdminProduct } from "@/lib/data/admin-products";
import { RECENT_ORDERS, type AdminOrder, type OrderStatus } from "@/lib/data/admin";
import { CUSTOMERS } from "@/lib/data/admin-customers";
import { INVENTORY } from "@/lib/data/admin-inventory";
import { formatPrice } from "@/lib/data/products";

const TONES = ["#cfe2ec", "#d8e8e1", "#e5dff0", "#dde5ec", "#eee7d8", "#e3e0d6"];
const toneFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
};

function mapProduct(raw: AdminApiProduct): AdminProduct {
  const active = raw.variants.filter((v) => v.isActive);
  const cheapest = active.reduce<number | null>(
    (min, v) => (min === null || v.priceCents < min ? v.priceCents : min),
    null,
  );
  return {
    id: raw._id,
    sku: raw.variants[0]?.sku ?? "—",
    name: raw.title,
    category: (raw.attributes?.category as string) || raw.brand || "—",
    price: cheapest ?? 0,
    stock: raw.variants.length,
    status: raw.status,
    tone: toneFor(raw._id),
  };
}

function mapOrder(raw: AdminApiOrder): AdminOrder {
  const KNOWN: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const status = KNOWN.includes(raw.status as OrderStatus) ? (raw.status as OrderStatus) : "pending";
  return {
    _id: raw._id,
    id: raw.orderNumber ?? raw._id,
    customer: raw.contactEmail ?? "Guest",
    date: (raw.createdAt ?? "").slice(0, 10),
    items: Array.isArray(raw.items) ? raw.items.length : 0,
    total: formatPrice(raw.totalCents ?? 0),
    status,
  };
}

export function useAdminProducts() {
  const query = useQuery({
    queryKey: ["admin-products"],
    queryFn: listAdminProducts,
    retry: 0,
  });

  const real = query.data?.map(mapProduct) ?? [];
  const usingRealData = query.isSuccess;
  return {
    products: usingRealData ? real : ADMIN_PRODUCTS,
    usingRealData,
    isLoading: query.isLoading,
  };
}

export function useAdminOrders() {
  const query = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listAdminOrders,
    retry: 0,
  });

  const rawList = Array.isArray(query.data) ? query.data : (query.data?.items ?? []);
  const usingRealData = query.isSuccess;
  return {
    orders: usingRealData ? rawList.map(mapOrder) : RECENT_ORDERS,
    usingRealData,
    isLoading: query.isLoading,
  };
}

export function useAdminOrderDetail(id: string) {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getAdminOrder(id),
    retry: 0,
    enabled: Boolean(id),
  });
}

export function useAdminCustomers() {
  const query = useQuery({
    queryKey: ["admin-customers"],
    queryFn: listAdminCustomers,
    retry: 0,
  });

  const usingRealData = query.isSuccess && Array.isArray(query.data);
  const real: AdminApiCustomer[] = usingRealData ? (query.data as AdminApiCustomer[]) : [];

  return {
    customers: real,
    fallback: !usingRealData ? CUSTOMERS : null,
    usingRealData,
    isLoading: query.isLoading,
  };
}

export function useAdminInventory() {
  const query = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: listAdminInventory,
    retry: 0,
  });

  const usingRealData = query.isSuccess && Array.isArray(query.data);
  const real: AdminApiInventoryItem[] = usingRealData
    ? (query.data as AdminApiInventoryItem[])
    : [];

  return {
    inventory: real,
    fallback: !usingRealData ? INVENTORY : null,
    usingRealData,
    isLoading: query.isLoading,
  };
}

export function useAdminTaxRates() {
  return useQuery<AdminApiTaxRate[]>({
    queryKey: ["admin-tax-rates"],
    queryFn: listTaxRates,
    retry: 0,
  });
}

export function useAdminCurrencyRates() {
  return useQuery<AdminApiCurrencyRate[]>({
    queryKey: ["admin-currency-rates"],
    queryFn: listCurrencyRates,
    retry: 0,
  });
}

export function useAdminGateways() {
  return useQuery<AdminApiGateway[]>({
    queryKey: ["admin-gateways"],
    queryFn: listPaymentGateways,
    retry: 0,
  });
}
