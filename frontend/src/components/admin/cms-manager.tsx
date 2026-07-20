"use client";

import { useState } from "react";
import { CMS_PAGES, BLOG_POSTS, type CmsPage, type BlogPost } from "@/lib/data/admin-cms";
import { createCmsPage, createBlogPost } from "@/lib/api/admin.api";
import { Modal } from "./modal";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function StatusBadge({ status }: { status: "published" | "draft" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
        status === "published" ? "bg-success/10 text-success" : "bg-line-soft text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}

export function CmsManager() {
  const today = new Date().toISOString().slice(0, 10);
  const [pages, setPages] = useState<CmsPage[]>(CMS_PAGES);
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [pageOpen, setPageOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [postTitle, setPostTitle] = useState("");

  async function submitPage(e: React.FormEvent) {
    e.preventDefault();
    const title = pageTitle.trim();
    if (!title) return;
    const slug = slugify(title);
    await createCmsPage({ title, slug }).catch(() => {});
    setPages((p) => [{ title, slug, status: "draft", updated: today }, ...p]);
    setPageOpen(false);
    setPageTitle("");
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    const title = postTitle.trim();
    if (!title) return;
    const slug = slugify(title);
    await createBlogPost({ title, slug }).catch(() => {});
    setPosts((p) => [{ title, slug, status: "draft", date: today }, ...p]);
    setPostOpen(false);
    setPostTitle("");
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Pages</h2>
          <button
            onClick={() => setPageOpen(true)}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            + New Page
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Slug</th>
                <th className="px-5 py-3 font-normal">Updated</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.slug} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                  <td className="px-5 py-3 text-ink">{p.title}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">/pages/{p.slug}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{p.updated}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Blog</h2>
          <button
            onClick={() => setPostOpen(true)}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            + New Post
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Slug</th>
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                  <td className="px-5 py-3 text-ink">{p.title}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">/journal/{p.slug}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{p.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal title="New Page" open={pageOpen} onClose={() => setPageOpen(false)}>
        <form onSubmit={submitPage} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Title</span>
            <input required value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="Shipping Policy" className="input-field" />
          </label>
          {pageTitle && (
            <p className="font-mono text-[11px] text-ink-soft">/pages/{slugify(pageTitle)}</p>
          )}
          <button type="submit" className="w-full rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
            Create page draft
          </button>
        </form>
      </Modal>

      <Modal title="New Post" open={postOpen} onClose={() => setPostOpen(false)}>
        <form onSubmit={submitPost} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Title</span>
            <input required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Fabric care, the long version" className="input-field" />
          </label>
          {postTitle && (
            <p className="font-mono text-[11px] text-ink-soft">/journal/{slugify(postTitle)}</p>
          )}
          <button type="submit" className="w-full rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
            Create post draft
          </button>
        </form>
      </Modal>
    </div>
  );
}
