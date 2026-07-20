"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStaffStore } from "@/stores/staff-store";
import { useAdminTheme } from "./admin-theme-scope";

const LIVE_LINKS = [
  { label: "Dashboard",  href: "/admin" },
  { label: "Products",   href: "/admin/products" },
  { label: "Inventory",  href: "/admin/inventory" },
  { label: "Orders",     href: "/admin/orders" },
  { label: "Customers",  href: "/admin/customers" },
  { label: "Marketing",  href: "/admin/marketing" },
  { label: "CMS",        href: "/admin/cms" },
  { label: "Shipping",   href: "/admin/shipping" },
  { label: "Payments",   href: "/admin/payments" },
  { label: "Tax",        href: "/admin/tax" },
  { label: "Currency",   href: "/admin/currency" },
  { label: "Analytics",  href: "/admin/analytics" },
  { label: "Settings",   href: "/admin/settings" },
];

/** Two-letter monogram for the rail variant (no icon set in the design system — type is the icon). */
function monogram(label: string) {
  const words = label.split(" ");
  return words.length > 1 ? words[0][0] + words[1][0] : label.slice(0, 2);
}

/**
 * sidebarStyle knob: expanded (roomy, full labels), compact (narrow, tighter
 * type), rail (slim monogram rail with tooltips via title).
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearSession } = useStaffStore();
  const { sidebarStyle } = useAdminTheme();

  const rail = sidebarStyle === "rail";
  const compact = sidebarStyle === "compact";

  const width = rail ? "w-16" : compact ? "w-44" : "w-56";

  return (
    <aside className={`hidden ${width} shrink-0 border-r border-line/70 bg-surface/60 md:flex md:flex-col`}>
      <div className={`flex h-16 items-center border-b border-line/70 ${rail ? "justify-center px-0" : compact ? "px-4" : "px-6"}`}>
        <Link href="/admin" className={`font-display italic text-ink ${rail ? "text-xl" : "text-lg"}`}>
          {rail ? "A" : "Aldergate"}
        </Link>
        {!rail && (
          <span className="ml-2 rounded-full bg-line-soft px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft">
            Admin
          </span>
        )}
      </div>

      <nav className={`flex-1 space-y-0.5 overflow-y-auto py-5 ${rail ? "px-2" : compact ? "px-2" : "px-3"}`}>
        {LIVE_LINKS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={rail ? item.label : undefined}
              className={`block rounded-[var(--radius-sm)] font-mono uppercase transition-all ${
                rail
                  ? "px-0 py-2 text-center text-[11px] tracking-[0.05em]"
                  : compact
                    ? "px-2.5 py-1.5 text-[11px] tracking-[0.06em]"
                    : "px-3 py-2 text-[12px] tracking-[0.08em]"
              }`}
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--ink)",
                boxShadow: active
                  ? "inset 2px 0 0 var(--accent), 0 0 16px color-mix(in srgb, var(--accent) 12%, transparent)"
                  : "none",
              }}
            >
              {rail ? monogram(item.label) : item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-line/70 py-4 ${rail ? "px-2" : "px-3"}`}>
        {!rail && (
          <p className={`font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft ${compact ? "px-2.5" : "px-3"}`}>
            {user?.name} · {user?.role}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            clearSession();
            router.replace("/staff-login");
          }}
          title={rail ? "Sign out" : undefined}
          className={`mt-1 block w-full rounded-[var(--radius-sm)] font-mono uppercase text-ink-soft transition-colors hover:bg-line-soft hover:text-ink ${
            rail ? "px-0 py-2 text-center text-[11px]" : compact ? "px-2.5 py-1.5 text-left text-[11px]" : "px-3 py-2 text-left text-[12px] tracking-[0.08em]"
          }`}
        >
          {rail ? "⏻" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
