export interface AdminProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  tone: string;
}

export const ADMIN_PRODUCTS: AdminProduct[] = [
  { id: "field-overshirt", sku: "AGT-OVS-001", name: "Field Overshirt", category: "Outerwear", price: 4200, stock: 34, status: "active", tone: "#d8c9b3" },
  { id: "washed-linen-shirt", sku: "AGT-SHT-014", name: "Washed Linen Shirt", category: "Shirts", price: 2800, stock: 61, status: "active", tone: "#cbb99f" },
  { id: "selvedge-denim", sku: "AGT-DNM-002", name: "Selvedge Denim", category: "Denim", price: 5600, stock: 12, status: "active", tone: "#3a4a5c" },
  { id: "wool-crew", sku: "AGT-KNT-007", name: "Wool Crew Sweater", category: "Knitwear", price: 3900, stock: 4, status: "active", tone: "#a58f6f" },
  { id: "canvas-tote", sku: "AGT-ACC-021", name: "Waxed Canvas Tote", category: "Accessories", price: 1800, stock: 0, status: "archived", tone: "#c7b492" },
  { id: "raw-hem-trouser", sku: "AGT-TRS-009", name: "Raw Hem Trouser", category: "Trousers", price: 3400, stock: 22, status: "draft", tone: "#8f8574" },
];

export const STATUS_BADGE: Record<AdminProduct["status"], string> = {
  active: "bg-success/10 text-success",
  draft: "bg-line-soft text-ink-soft",
  archived: "bg-danger/10 text-danger",
};
