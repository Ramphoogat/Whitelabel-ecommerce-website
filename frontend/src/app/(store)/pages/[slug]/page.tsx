"use client";

import Link from "next/link";
import { use } from "react";
import { CMS_PAGES } from "@/lib/data/admin-cms";

/**
 * Public route for CMS pages built in Admin → CMS → Pages. Any page the
 * merchant publishes there is immediately live at /pages/<slug> — this is
 * what lets the store grow beyond products.
 */
export default function CmsPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const page = CMS_PAGES.find((p) => p.slug === slug && p.status === "published");

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">404</p>
        <h1 className="mt-4 font-display italic text-ink" style={{ fontSize: "calc(2rem * var(--type-display, 1))" }}>
          This page doesn&apos;t exist (yet)
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
          It may be a draft, or it hasn&apos;t been created. Store owners can publish it from
          Admin → CMS → Pages.
        </p>
        <Link
          href="/store"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent hover:text-accent"
        >
          ← Back to the store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent/80">
        Updated {page.updated}
      </p>
      <h1
        className="mt-4 font-display italic text-ink"
        style={{ fontSize: "calc(clamp(2rem, 5vw, 3rem) * var(--type-display, 1))" }}
      >
        {page.title}
      </h1>
      <div className="mt-10 space-y-5 border-t border-line/50 pt-10">
        {(page.content?.trim()
          ? page.content.split(/\n{2,}/)
          : [
              `This is the ${page.title} page. Add content to it from Admin → CMS → Pages and it will appear here instantly.`,
            ]
        ).map((para, i) => (
          <p key={i} className="text-[15px] leading-[1.8] text-ink" style={{ fontSize: "calc(15px * var(--type-body, 1))" }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
