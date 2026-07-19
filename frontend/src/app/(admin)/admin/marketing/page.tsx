import { AdminTopbar } from "@/components/admin/topbar";
import { COUPONS, BANNERS } from "@/lib/data/admin-marketing";

export default function AdminMarketingPage() {
  return (
    <>
      <AdminTopbar title="Marketing" />
      <div className="space-y-10 px-6 py-8">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg italic text-ink">Coupons</h2>
            <button className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
              + New Coupon
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                  <th className="px-5 py-3 font-normal">Code</th>
                  <th className="px-5 py-3 font-normal">Discount</th>
                  <th className="px-5 py-3 font-normal">Usage</th>
                  <th className="px-5 py-3 font-normal">Expires</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {COUPONS.map((c) => (
                  <tr key={c.code} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3 font-mono text-ink">{c.code}</td>
                    <td className="px-5 py-3 text-ink-soft">
                      {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">
                      {c.usage} / {c.limit}
                    </td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c.expires}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                          c.active ? "bg-success/10 text-success" : "bg-line-soft text-ink-soft"
                        }`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg italic text-ink">Banners</h2>
            <button className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90">
              + New Banner
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {BANNERS.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
                <div className="h-24" style={{ background: b.tone }} />
                <div className="p-4">
                  <p className="font-display text-[14px] text-ink">{b.title}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    {b.placement}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                      b.active ? "bg-success/10 text-success" : "bg-line-soft text-ink-soft"
                    }`}
                  >
                    {b.active ? "Live" : "Hidden"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
