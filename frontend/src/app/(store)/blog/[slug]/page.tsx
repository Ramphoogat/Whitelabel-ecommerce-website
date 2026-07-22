"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/data/admin-cms";
import { unsplashUrl } from "@/lib/data/products";
import { notFound } from "next/navigation";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = BLOG_POSTS.find((p) => p.slug === slug && p.status === "published");

  if (!post) notFound();

  const rawContent = post.content ?? "";
  // If content is HTML (from rich editor), render it directly; otherwise fall back to plain paragraph split
  const isHtml = rawContent.trimStart().startsWith("<");

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8" style={{ paddingBlock: "var(--section-y, 5.5rem)" }}>
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-ink"
      >
        ← Blog
      </Link>

      {/* Meta */}
      <div className="mt-8 flex items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          {fmtDate(post.date)}
        </p>
        {post.author && (
          <>
            <span className="text-line/60">·</span>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{post.author}</p>
          </>
        )}
      </div>

      {/* Title */}
      <h1
        className="mt-4 font-display italic text-ink"
        style={{ fontSize: "calc(clamp(2rem, 5vw, 3rem) * var(--type-display, 1))" }}
      >
        {post.title}
      </h1>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mt-5 text-[16px] leading-[1.7] text-ink-soft border-l-2 border-accent/40 pl-5 italic">
          {post.excerpt}
        </p>
      )}

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}>
          <Image
            src={unsplashUrl(post.coverImage, 1200)}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Body */}
      {isHtml ? (
        <div
          className="prose-blog mt-10"
          dangerouslySetInnerHTML={{ __html: rawContent }}
        />
      ) : (
        <div className="mt-10 space-y-5">
          {rawContent.split(/\n\n+/).map((para, i) => {
            const isBold = para.startsWith("**") && para.endsWith("**");
            return isBold ? (
              <p key={i} className="font-medium text-[15px] leading-[1.75] text-ink">{para.slice(2, -2)}</p>
            ) : (
              <p key={i} className="text-[15px] leading-[1.85] text-ink-soft">{para}</p>
            );
          })}
        </div>
      )}

      {/* Back to blog */}
      <div className="mt-16 border-t border-line/50 pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent hover:text-accent"
        >
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
