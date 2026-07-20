export const STATS = [
  { label: "Revenue (30d)", value: "₹4,82,300", delta: "+12.4%", up: true },
  { label: "Orders (30d)", value: "1,204", delta: "+6.1%", up: true },
  { label: "Avg. Order Value", value: "₹1,942", delta: "-2.3%", up: false },
  { label: "Low Stock SKUs", value: "18", delta: "+4", up: false },
];

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface AdminOrder {
  _id: string;      // MongoDB ObjectId — used for detail page navigation
  id: string;       // orderNumber — displayed in the table
  customer: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
}

export const RECENT_ORDERS: AdminOrder[] = [
  { _id: "demo-1", id: "ORD-10482", customer: "Nisha Verma", date: "2026-07-18", items: 3, total: "₹8,400", status: "processing" },
  { _id: "demo-2", id: "ORD-10481", customer: "Kabir Malhotra", date: "2026-07-18", items: 1, total: "₹2,800", status: "pending" },
  { _id: "demo-3", id: "ORD-10480", customer: "Ayesha Khan", date: "2026-07-17", items: 2, total: "₹6,200", status: "shipped" },
  { _id: "demo-4", id: "ORD-10479", customer: "Rohan Desai", date: "2026-07-17", items: 4, total: "₹11,900", status: "delivered" },
  { _id: "demo-5", id: "ORD-10478", customer: "Priya Nair", date: "2026-07-16", items: 1, total: "₹4,200", status: "cancelled" },
  { _id: "demo-6", id: "ORD-10477", customer: "Arjun Rao", date: "2026-07-16", items: 2, total: "₹5,600", status: "delivered" },
];

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-line-soft text-ink-soft",
  processing: "bg-accent-soft text-accent",
  shipped: "bg-secondary-soft text-secondary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};
