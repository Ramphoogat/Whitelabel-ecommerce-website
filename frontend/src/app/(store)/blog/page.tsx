"use client";

import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/data/admin-cms";
import { unsplashUrl } from "@/lib/data/products";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const published = BLOG_POSTS.filter((p) => p.status === "published");

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      {/* Header */}
      <div className="border-b border-line/50 pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent/80">From the studio</p>
        <h1
          className="mt-4 font-display italic text-ink"
          style={{ fontSize: "calc(clamp(2.2rem, 5vw, 3.5rem) * var(--type-display, 1))" }}
        >
          Blog
        </h1>
        <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
          Stories about how we make things, where our materials come from, and how to care for what you own.
        </p>
      </div>

      {/* Post list */}
      {published.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-mono text-[13px] text-ink-soft">No posts published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="mt-12 space-y-0 divide-y divide-line/50">
          {published.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex gap-8 py-10 transition-colors hover:bg-bone/40 -mx-4 px-4 rounded-[var(--radius-md)]"
            >
              {/* Cover image */}
              {post.coverImage && (
                <div className="relative hidden shrink-0 overflow-hidden rounded-[var(--radius-md)] sm:block"
                  style={{ width: 180, height: 130 }}>
                  <Image
                    src={unsplashUrl(post.coverImage, 400)}
                    alt={post.title}
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    priority={i === 0}
                  />
                </div>
              )}

              {/* Copy */}
              <div className="flex flex-1 flex-col justify-center">
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                    {fmtDate(post.date)}
                  </p>
                  {post.author && (
                    <>
                      <span className="text-line">·</span>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                        {post.author}
                      </p>
                    </>
                  )}
                </div>
                <h2
                  className="mt-2 font-display italic text-ink transition-colors group-hover:text-accent"
                  style={{ fontSize: "calc(1.4rem * var(--type-display, 1))" }}
                >
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 max-w-[55ch] text-[13px] leading-relaxed text-ink-soft">
                    {post.excerpt}
                  </p>
                )}
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Read →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
