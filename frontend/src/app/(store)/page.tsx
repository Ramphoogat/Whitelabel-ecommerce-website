import Link from "next/link";
import Image from "next/image";
import { HERO_IMAGE, unsplashUrl } from "@/lib/data/products";
import { ProductGrids } from "@/components/store/product-grids";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28">
        <div className="grid items-end gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Autumn Collection — Week 03
            </p>
            <h1 className="mt-4 max-w-[16ch] font-display text-[13vw] italic leading-[0.95] text-ink sm:text-6xl md:text-7xl">
              Built to be worn, not just bought.
            </h1>
          </div>
          <div className="max-w-sm md:justify-self-end">
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Every piece is cut from natural fibre, finished by hand, and
              made in small runs — so what you buy stays yours, not a
              trend&apos;s.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-opacity hover:opacity-85"
            >
              Shop the collection →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative aspect-[16/7] overflow-hidden rounded-[var(--radius-lg)]">
          <Image
            src={unsplashUrl(HERO_IMAGE, 1600)}
            alt="Autumn collection, editorial"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <ProductGrids />
    </>
  );
}
