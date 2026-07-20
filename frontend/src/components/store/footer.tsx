import Link from "next/link";

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
      { label: "Returns", href: "/pages/returns" },
      { label: "Contact", href: "/pages/contact" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "About", href: "/pages/about" },
      { label: "Journal", href: "/journal" },
    ],
  },
];

export function StoreFooter() {
  return (
    <footer className="border-t border-line/50" style={{ marginTop: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingBlock: "calc(var(--section-y, 5.5rem) * 0.9)" }}>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-lg italic text-ink">Aldergate & Co.</p>
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
          <p>© {new Date().getFullYear()} Aldergate & Co. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.1em]">Built white-label, run independently</p>
        </div>
      </div>
    </footer>
  );
}
