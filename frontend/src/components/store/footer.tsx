"use client";

import Link from "next/link";
import { useStoreTheme } from "@/components/theme/theme-provider";
import { useStoreSettings } from "@/stores/store-settings-store";
import { CMS_PAGES, BLOG_POSTS } from "@/lib/data/admin-cms";

/**
 * Footer link map. The "Pages" column is generated from published CMS pages
 * (Admin → CMS), so a merchant creating a new page gets a footer link for
 * free — the store grows without code changes.
 */
const publishedPages = CMS_PAGES.filter((p) => p.status === "published");
const hasBlog = BLOG_POSTS.some((p) => p.status === "published");

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "New Arrivals", href: "/products?filter=new" },
      { label: "All Products", href: "/products" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Your Account", href: "/account" },
    ],
  },
  {
    heading: "Pages",
    links: [
      ...publishedPages.map((p) => ({ label: p.title, href: `/pages/${p.slug}` })),
      ...(hasBlog ? [{ label: "Blog", href: "/blog" }] : []),
    ],
  },
];

const FLAT_LINKS = COLUMNS.flatMap((c) => c.links);

export function StoreFooter() {
  const { storeTheme } = useStoreTheme();
  const { settings } = useStoreSettings();
  const style = storeTheme.footerStyle ?? "columns";
  const storeName = settings.storeName || "Aldergate & Co.";
  const year = new Date().getFullYear();

  if (style === "minimal") {
    return (
      <footer className="border-t border-line/50" style={{ marginTop: "var(--section-y, 5.5rem)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="font-display text-[15px] italic text-ink">{storeName}</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {FLAT_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-accent">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-[11px] text-ink-soft">© {year}</p>
        </div>
      </footer>
    );
  }

  if (style === "centered") {
    return (
      <footer className="border-t border-line/50" style={{ marginTop: "var(--section-y, 5.5rem)" }}>
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8" style={{ paddingBlock: "calc(var(--section-y, 5.5rem) * 0.7)" }}>
          <p className="font-display text-xl italic text-ink">{storeName}</p>
          <p className="mx-auto mt-2 max-w-[36ch] text-[13px] leading-relaxed text-ink-soft">
            Considered pieces, made to be worn for a long time.
          </p>
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {FLAT_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="mt-10 border-t border-line/70 pt-6 text-[11px] text-ink-soft">
            © {year} {storeName}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-line/50" style={{ marginTop: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingBlock: "calc(var(--section-y, 5.5rem) * 0.9)" }}>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-lg italic text-ink">{storeName}</p>
            <p className="mt-2 max-w-[22ch] text-[13px] leading-relaxed text-ink-soft">
              Considered pieces, made to be worn for a long time.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {col.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-ink transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line/70 pt-6 text-[11px] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {storeName}. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.1em]">Built white-label, run independently</p>
        </div>
      </div>
    </footer>
  );
}
