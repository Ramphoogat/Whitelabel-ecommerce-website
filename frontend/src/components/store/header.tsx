"use client";

import Link from "next/link";
import { ThemeSwatch } from "@/components/theme/theme-swatch";
import { useCartStore, cartCount } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";

const NAV = [
  { label: "New", href: "/products?filter=new" },
  { label: "Shop All", href: "/products" },
  { label: "Journal", href: "/journal" },
];

export function StoreHeader() {
  const lines = useCartStore((s) => s.lines);
  const open = useCartStore((s) => s.open);
  const customer = useAuthStore((s) => s.customer);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bone/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-display text-xl italic tracking-tight text-ink">
          Aldergate & Co.
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSwatch />
          <Link
            href="/account"
            className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink sm:inline"
          >
            {customer ? customer.name.split(" ")[0] : "Account"}
          </Link>
          <button
            type="button"
            onClick={open}
            className="rounded-full border border-ink/15 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink/40"
          >
            Cart · {cartCount(lines)}
          </button>
        </div>
      </div>
    </header>
  );
}
