"use client";

import { useState } from "react";
import { CMS_PAGES, BLOG_POSTS, type CmsPage, type BlogPost } from "@/lib/data/admin-cms";
import { createCmsPage, createBlogPost } from "@/lib/api/admin.api";
import { Modal } from "./modal";
import { RichEditor } from "./rich-editor";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function StatusBadge({ status }: { status: "published" | "draft" }) {
  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${status === "published" ? "bg-success/10 text-success" : "bg-bone text-ink-soft"}`}>
      {status}
    </span>
  );
}

function StatusToggle({ value, onChange }: { value: "published" | "draft"; onChange: (v: "published" | "draft") => void }) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Status</span>
      <div className="flex gap-2">
        {(["draft", "published"] as const).map((s) => {
          const active = value === s;
          return (
            <button key={s} type="button" onClick={() => onChange(s)}
              className="rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: active ? (s === "published" ? "var(--success)" : "var(--bone)") : "transparent",
                color: active ? (s === "published" ? "white" : "var(--ink-soft)") : "var(--ink-soft)",
                border: active ? "none" : "1px solid var(--bone)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SlugInput({ prefix, value, onChange, onManualEdit, placeholder }: {
  prefix: string; value: string; onChange: (v: string) => void;
  onManualEdit: () => void; placeholder: string;
}) {
  return (
    <div className="flex items-center rounded-[var(--radius-sm)] border border-line bg-surface focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--gold-soft)]" style={{ transition: "border-color 150ms, box-shadow 150ms" }}>
      <span className="select-none border-r border-line px-3 py-[0.65rem] font-mono text-[13px] text-ink-soft">{prefix}</span>
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); onManualEdit(); }}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-[0.65rem] font-mono text-[13px] text-ink outline-none placeholder:text-ink-soft/60"
      />
    </div>
  );
}

/* ── Collapsible content section ── */
function ContentSection({
  excerpt, onExcerpt, content, onContent, placeholder,
}: {
  excerpt: string; onExcerpt: (v: string) => void;
  content: string; onContent: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[var(--radius-md)] border border-line/60" style={{ background: "var(--bone)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Content</span>
        <span className="font-mono text-[10px] text-ink-soft/70">{open ? "▲ collapse" : "▼ expand"}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-line/50 px-4 pb-4 pt-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Excerpt / summary</span>
            <textarea
              value={excerpt}
              onChange={(e) => onExcerpt(e.target.value)}
              rows={2}
              placeholder="A short description shown in listings…"
              className="input-field resize-none leading-relaxed"
            />
          </label>
          <div>
            <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Body</span>
            <RichEditor value={content} onChange={onContent} placeholder={placeholder} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page draft ── */
interface PageDraft {
  title: string; slug: string; updated: string; status: "published" | "draft";
  excerpt: string; content: string;
}
const BLANK_PAGE = (today: string): PageDraft => ({ title: "", slug: "", updated: today, status: "draft", excerpt: "", content: "" });
function pageToDraft(p: CmsPage): PageDraft {
  return { title: p.title, slug: p.slug, updated: p.updated, status: p.status, excerpt: (p as any).excerpt ?? "", content: (p as any).content ?? "" };
}

/* ── Post draft ── */
interface PostDraft {
  title: string; slug: string; date: string; status: "published" | "draft";
  excerpt: string; content: string;
}
const BLANK_POST = (today: string): PostDraft => ({ title: "", slug: "", date: today, status: "draft", excerpt: "", content: "" });
function postToDraft(p: BlogPost): PostDraft {
  return { title: p.title, slug: p.slug, date: p.date, status: p.status, excerpt: p.excerpt ?? "", content: p.content ?? "" };
}

export function CmsManager() {
  const today = new Date().toISOString().slice(0, 10);

  const [pages, setPages] = useState<CmsPage[]>(CMS_PAGES);
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);

  /* ── Page modal ── */
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [pageDraft, setPageDraft] = useState<PageDraft>(BLANK_PAGE(today));
  const [pageSlugEdited, setPageSlugEdited] = useState(false);
  const pageModalOpen = newPageOpen || editingPage !== null;
  const pageIsEdit = editingPage !== null;

  function openNewPage() { setPageDraft(BLANK_PAGE(today)); setPageSlugEdited(false); setNewPageOpen(true); }
  function openEditPage(p: CmsPage) { setPageDraft(pageToDraft(p)); setPageSlugEdited(true); setEditingPage(p); }
  function closePageModal() { setNewPageOpen(false); setEditingPage(null); }

  function setPageField<K extends keyof PageDraft>(k: K, v: PageDraft[K]) {
    setPageDraft((d) => ({ ...d, [k]: v }));
  }

  function handlePageTitle(v: string) {
    setPageField("title", v);
    if (!pageSlugEdited) setPageField("slug", slugify(v));
  }

  async function submitPage(e: React.FormEvent) {
    e.preventDefault();
    const title = pageDraft.title.trim();
    const slug = pageDraft.slug || slugify(title);
    if (!title) return;

    if (pageIsEdit) {
      setPages((ps) => ps.map((p) => p.slug === editingPage!.slug
        ? { ...p, title, slug, updated: pageDraft.updated, status: pageDraft.status, excerpt: pageDraft.excerpt, content: pageDraft.content } as CmsPage
        : p));
    } else {
      await createCmsPage({ title, slug }).catch(() => {});
      setPages((ps) => [{ title, slug, status: pageDraft.status, updated: pageDraft.updated, excerpt: pageDraft.excerpt, content: pageDraft.content } as CmsPage, ...ps]);
    }
    closePageModal();
  }

  function deletePage(slug: string) {
    if (!confirm("Delete this page?")) return;
    setPages((ps) => ps.filter((p) => p.slug !== slug));
    closePageModal();
  }

  /* ── Post modal ── */
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [postDraft, setPostDraft] = useState<PostDraft>(BLANK_POST(today));
  const [postSlugEdited, setPostSlugEdited] = useState(false);
  const postModalOpen = newPostOpen || editingPost !== null;
  const postIsEdit = editingPost !== null;

  function openNewPost() { setPostDraft(BLANK_POST(today)); setPostSlugEdited(false); setNewPostOpen(true); }
  function openEditPost(p: BlogPost) { setPostDraft(postToDraft(p)); setPostSlugEdited(true); setEditingPost(p); }
  function closePostModal() { setNewPostOpen(false); setEditingPost(null); }

  function setPostField<K extends keyof PostDraft>(k: K, v: PostDraft[K]) {
    setPostDraft((d) => ({ ...d, [k]: v }));
  }

  function handlePostTitle(v: string) {
    setPostField("title", v);
    if (!postSlugEdited) setPostField("slug", slugify(v));
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    const title = postDraft.title.trim();
    const slug = postDraft.slug || slugify(title);
    if (!title) return;

    if (postIsEdit) {
      setPosts((ps) => ps.map((p) => p.slug === editingPost!.slug
        ? { ...p, title, slug, date: postDraft.date, status: postDraft.status, excerpt: postDraft.excerpt, content: postDraft.content }
        : p));
    } else {
      await createBlogPost({ title, slug }).catch(() => {});
      setPosts((ps) => [{ title, slug, status: postDraft.status, date: postDraft.date, excerpt: postDraft.excerpt, content: postDraft.content }, ...ps]);
    }
    closePostModal();
  }

  function deletePost(slug: string) {
    if (!confirm("Delete this post?")) return;
    setPosts((ps) => ps.filter((p) => p.slug !== slug));
    closePostModal();
  }

  return (
    <div className="space-y-10">

      {/* ── Pages ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Pages</h2>
          <button onClick={openNewPage} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
            + New Page
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Slug</th>
                <th className="px-5 py-3 font-normal">Updated</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.slug} className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60" onClick={() => openEditPage(p)}>
                  <td className="px-5 py-3 font-medium text-ink">{p.title}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">/pages/{p.slug}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{p.updated}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-right font-mono text-[11px] text-accent">Edit →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Blog ── */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Blogs</h2>
          <button onClick={openNewPost} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
            + New Post
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Slug</th>
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.slug} className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-bone/60" onClick={() => openEditPost(p)}>
                  <td className="px-5 py-3 font-medium text-ink">{p.title}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">/blog/{p.slug}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{p.date}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-right font-mono text-[11px] text-accent">Edit →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Page modal ── */}
      <Modal title={pageIsEdit ? "Edit Page" : "New Page"} open={pageModalOpen} onClose={closePageModal} wide>
        <form onSubmit={submitPage} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Title</span>
            <input required value={pageDraft.title} onChange={(e) => handlePageTitle(e.target.value)} placeholder="Shipping Policy" className="input-field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Slug</span>
            <SlugInput prefix="/pages/" value={pageDraft.slug} onChange={(v) => setPageField("slug", v)} onManualEdit={() => setPageSlugEdited(true)} placeholder="shipping-policy" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Updated</span>
              <input type="date" value={pageDraft.updated} onChange={(e) => setPageField("updated", e.target.value)} className="input-field" />
            </label>
            <StatusToggle value={pageDraft.status} onChange={(v) => setPageField("status", v)} />
          </div>

          <ContentSection
            excerpt={pageDraft.excerpt}
            onExcerpt={(v) => setPageField("excerpt", v)}
            content={pageDraft.content}
            onContent={(v) => setPageField("content", v)}
            placeholder="Write your page content here…"
          />

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
              {pageIsEdit ? "Save changes" : "Create page"}
            </button>
            {pageIsEdit && (
              <button type="button" onClick={() => deletePage(editingPage!.slug)} className="rounded-full border border-danger/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger hover:bg-danger/5">
                Delete
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Post modal ── */}
      <Modal title={postIsEdit ? "Edit Post" : "New Post"} open={postModalOpen} onClose={closePostModal} wide>
        <form onSubmit={submitPost} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Title</span>
            <input required value={postDraft.title} onChange={(e) => handlePostTitle(e.target.value)} placeholder="Fabric care, the long version" className="input-field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Slug</span>
            <SlugInput prefix="/blog/" value={postDraft.slug} onChange={(v) => setPostField("slug", v)} onManualEdit={() => setPostSlugEdited(true)} placeholder="fabric-care" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Date</span>
              <input type="date" value={postDraft.date} onChange={(e) => setPostField("date", e.target.value)} className="input-field" />
            </label>
            <StatusToggle value={postDraft.status} onChange={(v) => setPostField("status", v)} />
          </div>

          <ContentSection
            excerpt={postDraft.excerpt}
            onExcerpt={(v) => setPostField("excerpt", v)}
            content={postDraft.content}
            onContent={(v) => setPostField("content", v)}
            placeholder="Start writing your post…"
          />

          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90">
              {postIsEdit ? "Save changes" : "Create post"}
            </button>
            {postIsEdit && (
              <button type="button" onClick={() => deletePost(editingPost!.slug)} className="rounded-full border border-danger/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger hover:bg-danger/5">
                Delete
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
