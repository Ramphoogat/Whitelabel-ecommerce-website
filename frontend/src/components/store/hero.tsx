"use client";

import Link from "next/link";
import Image from "next/image";
import { HERO_IMAGE, unsplashUrl } from "@/lib/data/products";
import { useStoreTheme } from "@/components/theme/theme-provider";

function HeroCopy({ centered = false }: { centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : ""}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent/80">
        Autumn Collection — Week 03
      </p>
      <h1
        className={`mt-5 font-display font-medium leading-[0.95] text-ink ${centered ? "" : "max-w-[13ch]"}`}
        style={{ fontSize: "calc(clamp(2.8rem, 7.5vw, 5rem) * var(--type-display, 1))" }}
      >
        Built to be worn, not just bought.
      </h1>
      <p
        className={`mt-7 leading-[1.7] text-ink-soft ${centered ? "mx-auto" : ""} max-w-[30ch]`}
        style={{ fontSize: "calc(15px * var(--type-body, 1))" }}
      >
        Every piece is cut from natural fibre, finished by hand, and made in
        small runs — so what you buy stays yours, not a trend&apos;s.
      </p>
      <div className={`mt-9 flex items-center gap-4 ${centered ? "justify-center" : ""}`}>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink transition-all hover:brightness-110"
        >
          Shop the collection →
        </Link>
        <Link
          href="/products?filter=new"
          className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent hover:text-accent"
        >
          New arrivals
        </Link>
      </div>
    </div>
  );
}

/**
 * heroVariant knob: editorial (copy block + image band — the classic),
 * immersive (full-bleed image with the copy overlaid on a scrim), or
 * minimal (pure typography, no imagery). Section rhythm follows --section-y.
 */
export function StoreHero() {
  const { storeTheme } = useStoreTheme();
  const variant = storeTheme.heroVariant;

  if (variant === "immersive") {
    return (
      <section className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingBlock: "calc(var(--section-y, 4rem) * 0.6)" }}>
        <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <Image
              src={unsplashUrl(HERO_IMAGE, 1600)}
              alt="Autumn collection, editorial"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
              Autumn Collection — Week 03
            </p>
            <h1
              className="mt-2 max-w-[16ch] font-display font-medium leading-[1.02] text-white"
              style={{ fontSize: "calc(clamp(1.9rem, 4.5vw, 3.25rem) * var(--type-display, 1))" }}
            >
              Built to be worn, not just bought.
            </h1>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink transition-transform hover:scale-[1.03]"
            >
              Shop the collection →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <section
        className="mx-auto max-w-6xl px-5 sm:px-8"
        style={{ paddingBlock: "calc(var(--section-y, 4rem) * 1.4)" }}
      >
        <HeroCopy centered />
      </section>
    );
  }

  // editorial (default)
  return (
    <>
      <section
        className="mx-auto max-w-6xl px-5 sm:px-8"
        style={{ paddingTop: "calc(var(--section-y, 5.5rem) * 1.1)", paddingBottom: "calc(var(--section-y, 5.5rem) * 0.9)" }}
      >
        <div className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr]">
          <HeroCopy />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-lg)]" style={{ boxShadow: "0 8px 48px rgba(28,24,18,0.14)" }}>
          <Image
            src={unsplashUrl(HERO_IMAGE, 1800)}
            alt="Autumn collection, editorial"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
        </div>
      </section>
    </>
  );
}
