"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore, cartCount } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useStoreTheme } from "@/components/theme/theme-provider";
import { useStoreSettings } from "@/stores/store-settings-store";
import { CMS_PAGES } from "@/lib/data/admin-cms";

const NAV = [
  { label: "New", href: "/products?filter=new" },
  { label: "Shop All", href: "/products" },
  { label: "Blog", href: "/blog" },
];

/** CMS pages published in Admin → CMS surface in the sidebar nav automatically. */
const PAGE_LINKS = CMS_PAGES.filter((p) => p.status === "published").map((p) => ({
  label: p.title,
  href: `/pages/${p.slug}`,
}));

function Wordmark() {
  const { storeTheme } = useStoreTheme();
  const { settings } = useStoreSettings();
  const logoSrc = settings.logoUrl || storeTheme.logoUrl;
  return (
    <Link href="/store" className="flex items-center gap-2.5 font-display text-xl italic tracking-tight text-ink">
      {logoSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoSrc} alt="" className="size-7 rounded-full object-cover" />
      )}
      {settings.storeName}
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

/** Slide-in navigation drawer used when navStyle is "sidebar". */
function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close on route change
  useEffect(() => { onClose(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close navigation" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <aside
        className="animate-rise absolute left-0 top-0 flex h-full w-72 flex-col overflow-y-auto border-r border-line/70 p-6"
        style={{ background: "var(--bone)" }}
      >
        <div className="flex items-center justify-between">
          <Wordmark />
          <button onClick={onClose} aria-label="Close" className="font-mono text-[12px] text-ink-soft hover:text-ink">✕</button>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-soft/60">Shop</p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-sm)] px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-accent-soft hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
          {PAGE_LINKS.length > 0 && (
            <>
              <p className="mb-1 mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-soft/60">Pages</p>
              {PAGE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[var(--radius-sm)] px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-line/60 pt-4">
          <Link href="/account" className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink">
            Account →
          </Link>
        </div>
      </aside>
    </div>
  );
}

function HamburgerButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open navigation"
      className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 4h11M2 7.5h11M2 11h11" />
      </svg>
    </button>
  );
}

/**
 * The merchant's headerStyle knob picks between three real arrangements:
 * split (wordmark left / nav / actions right), centered (stacked wordmark
 * over nav), minimal (wordmark + cart only). The navStyle knob moves the
 * nav into a slide-in sidebar drawer instead of the top bar.
 */
export function StoreHeader() {
  const { storeTheme } = useStoreTheme();
  const style = storeTheme.headerStyle;
  const sidebarNav = storeTheme.navStyle === "sidebar";
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (sidebarNav) {
    return (
      <>
        <header className="sticky top-0 z-40 border-b border-line/60 bg-bone/92 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <HamburgerButton onOpen={() => setDrawerOpen(true)} />
              <Wordmark />
            </div>
            <AccountAndCart />
          </div>
        </header>
        <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bone/92 backdrop-blur-md">
      {style === "centered" ? (
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="relative flex h-16 items-center justify-center">
            <Wordmark />
            <div className="absolute right-0">
              <AccountAndCart />
            </div>
          </div>
          <div className="flex h-10 items-start justify-center border-t border-line/40">
            <NavLinks className="hidden pt-2.5 md:flex" />
          </div>
        </div>
      ) : style === "minimal" ? (
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <AccountAndCart />
        </div>
      ) : (
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <NavLinks className="hidden md:flex" />
          <AccountAndCart />
        </div>
      )}
    </header>
  );
}
