import type { StatDetail } from "@/components/admin/stat-tile";

export interface Stat {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  detail: StatDetail;
}

export const STATS: Stat[] = [
  {
    label: "Revenue (30d)",
    value: "₹4,82,300",
    delta: "+12.4%",
    up: true,
    detail: {
      rows: [
        { label: "Today",        value: "₹18,400",  sub: "+8.2%" },
        { label: "This week",    value: "₹1,12,600", sub: "+14.1%" },
        { label: "Last 7 days",  value: "₹98,700",  sub: "prev week" },
        { label: "Last 30 days", value: "₹4,29,100", sub: "prev period" },
        { label: "Top channel",  value: "Organic",   sub: "64% of revenue" },
      ],
      footer: "Compared to previous 30-day period",
    },
  },
  {
    label: "Orders (30d)",
    value: "1,204",
    delta: "+6.1%",
    up: true,
    detail: {
      rows: [
        { label: "Pending",     value: "38",   sub: "3.2%" },
        { label: "Processing",  value: "124",  sub: "10.3%" },
        { label: "Shipped",     value: "291",  sub: "24.2%" },
        { label: "Delivered",   value: "698",  sub: "58.0%" },
        { label: "Cancelled",   value: "53",   sub: "4.4%" },
      ],
      footer: "Status breakdown for the last 30 days",
    },
  },
  {
    label: "Avg. Order Value",
    value: "₹1,942",
    delta: "-2.3%",
    up: false,
    detail: {
      rows: [
        { label: "< ₹500",        value: "142 orders",  sub: "11.8%" },
        { label: "₹500 – ₹1,500", value: "389 orders",  sub: "32.3%" },
        { label: "₹1,500 – ₹3k",  value: "461 orders",  sub: "38.3%" },
        { label: "₹3k – ₹5k",     value: "168 orders",  sub: "14.0%" },
        { label: "> ₹5,000",       value: "44 orders",   sub: "3.7%" },
      ],
      footer: "Order value distribution, last 30 days",
    },
  },
  {
    label: "Low Stock SKUs",
    value: "18",
    delta: "+4",
    up: false,
    detail: {
      rows: [
        { label: "Field Overshirt · S",    value: "3 left",  sub: "reorder soon" },
        { label: "Selvedge Denim · 32",    value: "2 left",  sub: "critical" },
        { label: "Wool Crew Sweater · XL", value: "4 left",  sub: "reorder soon" },
        { label: "Canvas Work Pant · 30",  value: "1 left",  sub: "critical" },
        { label: "+ 14 more SKUs",         value: "< 10 each", sub: "view inventory" },
      ],
      footer: "SKUs with fewer than 10 units remaining",
    },
  },
];

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface AdminOrder {
  _id: string;
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
}

export const RECENT_ORDERS: AdminOrder[] = [
  { _id: "demo-1", id: "ORD-10482", customer: "Nisha Verma",    email: "nisha.v@example.com",   phone: "+91 98200 11234", address: "12, Lotus Apartments, Andheri West, Mumbai — 400053, Maharashtra", date: "2026-07-18", items: 3, total: "₹8,400",  status: "processing" },
  { _id: "demo-2", id: "ORD-10481", customer: "Kabir Malhotra", email: "kabir.m@example.com",   phone: "+91 99870 55678", address: "Flat 4B, Green Park Extension, New Delhi — 110016, Delhi",           date: "2026-07-18", items: 1, total: "₹2,800",  status: "pending"    },
  { _id: "demo-3", id: "ORD-10480", customer: "Ayesha Khan",    email: "ayesha.k@example.com",  phone: "+91 91234 77890", address: "27, Koramangala 5th Block, Bengaluru — 560095, Karnataka",           date: "2026-07-17", items: 2, total: "₹6,200",  status: "shipped"    },
  { _id: "demo-4", id: "ORD-10479", customer: "Rohan Desai",    email: "rohan.d@example.com",   phone: "+91 94501 32109", address: "8, Satellite Road, Ahmedabad — 380015, Gujarat",                     date: "2026-07-17", items: 4, total: "₹11,900", status: "delivered"  },
  { _id: "demo-5", id: "ORD-10478", customer: "Priya Nair",     email: "priya.n@example.com",   phone: "+91 97002 44321", address: "Villa 3, Kakkanad Township, Kochi — 682030, Kerala",                 date: "2026-07-16", items: 1, total: "₹4,200",  status: "cancelled"  },
  { _id: "demo-6", id: "ORD-10477", customer: "Arjun Rao",      email: "arjun.r@example.com",   phone: "+91 98765 09876", address: "45, T. Nagar, Chennai — 600017, Tamil Nadu",                         date: "2026-07-16", items: 2, total: "₹5,600",  status: "delivered"  },
];

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    "bg-bone text-ink-soft",
  processing: "bg-accent-soft text-accent",
  shipped:    "bg-secondary-soft text-secondary",
  delivered:  "bg-success/10 text-success",
  cancelled:  "bg-danger/10 text-danger",
};
