import { AdminTopbar } from "@/components/admin/topbar";
import { CMS_PAGES, BLOG_POSTS } from "@/lib/data/admin-cms";

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

export default function AdminCmsPage() {
  return (
    <>
      <AdminTopbar title="CMS" />
      <div className="space-y-10 px-6 py-8">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg italic text-ink">Pages</h2>
            <button className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
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
                {CMS_PAGES.map((p) => (
                  <tr key={p.slug} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3 text-ink">{p.title}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">/pages/{p.slug}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{p.updated}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg italic text-ink">Blog</h2>
            <button className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
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
                {BLOG_POSTS.map((p) => (
                  <tr key={p.slug} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3 text-ink">{p.title}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">/journal/{p.slug}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{p.date}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
