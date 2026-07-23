"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { StoreHero } from "@/components/store/hero";
import { ProductCard } from "@/components/store/product-card";
import { ProductSlider } from "@/components/store/product-slider";
import { useProducts } from "@/hooks/use-catalog";
import { useStoreTheme } from "@/components/theme/theme-provider";
import { GRID_DENSITY_CLASSES, DEFAULT_HOME_SECTIONS } from "@/lib/theme/presets";
import type { HomeSectionKey } from "@/lib/theme/types";
import { unsplashUrl } from "@/lib/data/products";
import { BANNERS } from "@/lib/data/admin-marketing";
import { BLOG_POSTS } from "@/lib/data/admin-cms";

/* ── Top strip banner ───────────────────────────────────────────────────── */
const TOP_STRIP = BANNERS.find((b) => b.active && b.placement === "Top Strip");

function TopStripBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!TOP_STRIP || dismissed) return null;
  return (
    <div
      className="flex items-center justify-center gap-3 px-5 py-2.5 text-center"
      style={{ background: TOP_STRIP.tone, color: "#fff" }}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
        {TOP_STRIP.title}
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex size-4 shrink-0 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
        style={{ background: "rgba(255,255,255,0.25)" }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 1l6 6M7 1L1 7" />
        </svg>
      </button>
    </div>
  );
}

/* ── Category page banner ────────────────────────────────────────────────── */
const CATEGORY_BANNER = BANNERS.find((b) => b.active && b.placement === "Category Page");

function CategoryBanner() {
  if (!CATEGORY_BANNER) return null;
  return (
    <div
      className="mx-auto max-w-6xl px-5 py-3 sm:px-8"
    >
      <div
        className="flex items-center justify-between rounded-[var(--radius-lg)] px-5 py-3"
        style={{ background: CATEGORY_BANNER.tone }}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white">
          {CATEGORY_BANNER.title}
        </span>
        <Link
          href="/products"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/80 hover:text-white"
        >
          Shop →
        </Link>
      </div>
    </div>
  );
}

/* ── Category strip ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: "New Arrivals", href: "/products?filter=new", accent: true },
  { label: "Outerwear",    href: "/products?category=Outerwear" },
  { label: "Shirts",       href: "/products?category=Shirts" },
  { label: "Denim",        href: "/products?category=Denim" },
  { label: "Knitwear",     href: "/products?category=Knitwear" },
  { label: "Trousers",     href: "/products?category=Trousers" },
  { label: "Accessories",  href: "/products?category=Accessories" },
];

function CategoryStrip() {
  return (
    <div className="border-b border-t border-line/50">
      <div className="mx-auto max-w-6xl overflow-x-auto px-5 sm:px-8">
        <div className="flex items-center gap-1 py-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="shrink-0 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-all"
              style={{
                background: c.accent ? "var(--accent)" : "transparent",
                color: c.accent ? "var(--accent-ink)" : "var(--ink-soft)",
                border: c.accent ? "none" : "1px solid var(--line)",
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Value props ─────────────────────────────────────────────────────────── */
const VALUES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
        <path d="M11 6v5l3 3" />
      </svg>
    ),
    heading: "Made to last",
    body: "Each piece is cut and sewn in small runs. No fast fashion, no throwaway cuts.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l8-4 8 4v8l-8 4-8-4V7z" />
        <path d="M3 7l8 4 8-4M11 11v8" />
      </svg>
    ),
    heading: "Natural fibres only",
    body: "Linen, wool, canvas, and selvedge denim — materials that age with you, not against you.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 4.8 5.6.8-4 3.9.9 5.5L12 14.5l-4.9 2.5.9-5.5-4-3.9 5.6-.8L12 2z" />
      </svg>
    ),
    heading: "Finished by hand",
    body: "Stitched, pressed, and inspected by the same hands that cut the pattern.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h6v6H4zM12 4h6v6h-6zM4 12h6v6H4zM12 12h6v6h-6z" />
      </svg>
    ),
    heading: "Free returns, 60 days",
    body: "If it doesn't fit right, we'll sort it. No questions, no restocking fees.",
  },
];

function ValueProps() {
  return (
    <section style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.heading}>
              <span className="text-accent">{v.icon}</span>
              <h3
                className="mt-4 font-display italic text-ink"
                style={{ fontSize: "calc(1.1rem * var(--type-display, 1))" }}
              >
                {v.heading}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Editorial campaign band ─────────────────────────────────────────────── */
const CAMPAIGN_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64";
const HERO_BANNER = BANNERS.find((b) => b.active && b.placement === "Homepage Hero");

function CampaignBand() {
  return (
    <section className="border-t border-line/50" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)]" style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.18)" }}>
            {HERO_BANNER?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={HERO_BANNER.imageUrl} alt={HERO_BANNER.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image
                src={unsplashUrl(CAMPAIGN_IMAGE, 900)}
                alt="Autumn campaign"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="md:pl-8">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: HERO_BANNER ? HERO_BANNER.tone : "var(--accent)" }}
            >
              {HERO_BANNER ? HERO_BANNER.title : "Autumn — Week 03"}
            </p>
            <h2
              className="mt-5 font-display font-medium leading-[1.0] text-ink"
              style={{ fontSize: "calc(clamp(2rem, 4vw, 3rem) * var(--type-display, 1))" }}
            >
              The clothes that stay with you.
            </h2>
            <p className="mt-6 max-w-[34ch] text-[15px] leading-[1.7] text-ink-soft">
              We make one collection a season. When it sells out, it sells out. No restocks,
              no mass production — just pieces built to be worn for decades.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink transition-all hover:brightness-110"
              >
                Shop now →
              </Link>
              <Link
                href="/journal"
                className="inline-flex items-center rounded-full border border-ink/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Read the journal
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-line/50 pt-10">
              {[
                { value: "2019", label: "Est." },
                { value: "4", label: "Collections / yr" },
                { value: "100%", label: "Natural fibre" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display italic text-ink" style={{ fontSize: "calc(1.8rem * var(--type-display, 1))" }}>
                    {s.value}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "I've owned the Field Overshirt for two years. The linen has softened perfectly and I get asked about it every week.",
    name: "Rohan D.", loc: "Mumbai",
  },
  {
    quote: "The selvedge denim fits unlike anything I've tried at this price point. Wore them into shape in three months.",
    name: "Kabir M.", loc: "Delhi",
  },
  {
    quote: "Finally a brand that doesn't restock endlessly. Makes each piece feel worth caring for.",
    name: "Ayesha K.", loc: "Bengaluru",
  },
];

function Testimonials() {
  return (
    <section className="border-t border-line/50" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">From people who wear it</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-[var(--radius-lg)] border border-line/60 p-6"
              style={{ background: "var(--surface)" }}
            >
              <p className="text-[14px] leading-[1.7] text-ink">"{t.quote}"</p>
              <footer className="mt-4 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-accent/20 font-mono text-[10px] text-accent">
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-[12px] font-medium text-ink">{t.name}</p>
                  <p className="font-mono text-[10px] text-ink-soft">{t.loc}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── New arrivals ────────────────────────────────────────────────────────── */
function NewArrivalsSection() {
  const { products } = useProducts();
  const { storeTheme } = useStoreTheme();
  const gridClass = GRID_DENSITY_CLASSES[storeTheme.gridDensity] ?? GRID_DENSITY_CLASSES[4];
  const slider = storeTheme.productSlider;
  const newArrivals = products.filter((p) => p.new).slice(0, slider ? 12 : 4);
  const featured = newArrivals.length > 0 ? newArrivals : products.slice(0, slider ? 12 : 4);

  return (
    <section className="border-t border-line/50" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display italic text-ink" style={{ fontSize: "calc(1.75rem * var(--type-display, 1))" }}>
            {newArrivals.length > 0 ? "New Arrivals" : "Featured"}
          </h2>
          <Link href="/products?filter=new" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-accent">
            View all →
          </Link>
        </div>
        <div className="mt-10">
          {slider ? (
            <ProductSlider products={featured} />
          ) : (
            <div className={gridClass}>
              {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── From the blog ──────────────────────────────────────────────────────── */
function BlogSection() {
  const posts = BLOG_POSTS.filter((p) => p.status === "published").slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-line/50" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display italic text-ink" style={{ fontSize: "calc(1.75rem * var(--type-display, 1))" }}>
            From the Blog
          </h2>
          <Link href="/blog" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-accent">
            All posts →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              {post.coverImage && (
                <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)]">
                  <Image
                    src={unsplashUrl(post.coverImage, 600)}
                    alt={post.title}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              )}
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{post.date}</p>
              <h3
                className="mt-1.5 font-display italic leading-snug text-ink transition-colors group-hover:text-accent"
                style={{ fontSize: "calc(1.15rem * var(--type-display, 1))" }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Back to top ────────────────────────────────────────────────────────── */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full border shadow-lg transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--accent)", color: "var(--accent-ink)", borderColor: "transparent" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11.5v-9M3 6.5L7 2.5l4 4" />
      </svg>
    </button>
  );
}

/* ── Full collection ─────────────────────────────────────────────────────── */
function FullCollectionSection() {
  const { products, usingRealData } = useProducts();
  const { storeTheme } = useStoreTheme();
  const gridClass = GRID_DENSITY_CLASSES[storeTheme.gridDensity] ?? GRID_DENSITY_CLASSES[4];

  return (
    <section className="border-t border-line/50" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display italic text-ink" style={{ fontSize: "calc(1.75rem * var(--type-display, 1))" }}>
            Full Collection
          </h2>
          {!usingRealData && (
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/50">Demo catalog</span>
          )}
        </div>
        <div className={`mt-10 ${gridClass}`}>
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Browse all products →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

/** Every band the merchant can toggle/reorder from Theme Studio → Home page builder. */
const SECTION_COMPONENTS: Record<HomeSectionKey, React.ComponentType> = {
  categories: () => (
    <>
      <CategoryStrip />
      <CategoryBanner />
    </>
  ),
  arrivals: NewArrivalsSection,
  campaign: CampaignBand,
  values: ValueProps,
  testimonials: Testimonials,
  collection: FullCollectionSection,
  blog: BlogSection,
};

export default function StoreLandingPage() {
  const { storeTheme } = useStoreTheme();
  const sections =
    storeTheme.homeSections && storeTheme.homeSections.length > 0
      ? storeTheme.homeSections
      : DEFAULT_HOME_SECTIONS;

  // smoothScroll knob: animate anchor + back-to-top scrolling storewide.
  useEffect(() => {
    document.documentElement.style.scrollBehavior = storeTheme.smoothScroll ? "smooth" : "auto";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, [storeTheme.smoothScroll]);

  return (
    <>
      <TopStripBanner />
      <StoreHero />
      {sections.map((key) => {
        const Section = SECTION_COMPONENTS[key];
        return Section ? <Section key={key} /> : null;
      })}
      {storeTheme.backToTop && <BackToTop />}
    </>
  );
}
