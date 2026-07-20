"use client";

import Link from "next/link";
import { useCartStore, cartCount } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useStoreTheme } from "@/components/theme/theme-provider";

const NAV = [
  { label: "New", href: "/products?filter=new" },
  { label: "Shop All", href: "/products" },
  { label: "Journal", href: "/journal" },
];

function Wordmark() {
  const { storeTheme } = useStoreTheme();
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-xl italic tracking-tight text-ink">
      {storeTheme.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={storeTheme.logoUrl} alt="" className="size-7 rounded-full object-cover" />
      )}
      Aldergate &amp; Co.
    </Link>
  );
}

function NavLinks({ className = "" }: { className?: string }) {
  return (
    <nav className={`items-center gap-7 ${className}`}>
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
  );
}

function AccountAndCart() {
  const lines = useCartStore((s) => s.lines);
  const open = useCartStore((s) => s.open);
  const customer = useAuthStore((s) => s.customer);
  return (
    <div className="flex items-center gap-4">
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
  );
}

/**
 * The merchant's headerStyle knob picks between three real arrangements:
 * split (wordmark left / nav / actions right), centered (stacked wordmark
 * over nav), minimal (wordmark + cart only).
 */
export function StoreHeader() {
  const { storeTheme } = useStoreTheme();
  const style = storeTheme.headerStyle;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bone/90 backdrop-blur">
      {style === "centered" ? (
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="relative flex h-14 items-center justify-center">
            <Wordmark />
            <div className="absolute right-0">
              <AccountAndCart />
            </div>
          </div>
          <div className="flex h-10 items-start justify-center border-t border-line/50">
            <NavLinks className="hidden pt-2.5 md:flex" />
          </div>
        </div>
      ) : style === "minimal" ? (
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <AccountAndCart />
        </div>
      ) : (
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <NavLinks className="hidden md:flex" />
          <AccountAndCart />
        </div>
      )}
    </header>
  );
}
