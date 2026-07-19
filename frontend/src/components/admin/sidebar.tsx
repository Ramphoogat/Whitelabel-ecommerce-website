"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIVE_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Marketing", href: "/admin/marketing" },
  { label: "CMS", href: "/admin/cms" },
  { label: "Shipping", href: "/admin/shipping" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line/70 bg-surface/60 md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-line/70 px-6">
        <Link href="/admin" className="font-display text-lg italic text-ink">
          Aldergate
        </Link>
        <span className="ml-2 rounded-full bg-line-soft px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5">
        {LIVE_LINKS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-[var(--radius-sm)] px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors"
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
