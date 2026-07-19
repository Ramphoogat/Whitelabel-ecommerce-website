import { AdminTopbar } from "@/components/admin/topbar";
import { BarChart } from "@/components/admin/bar-chart";
import { StatTile } from "@/components/admin/stat-tile";
import { STATS } from "@/lib/data/admin";

const WEEKLY_REVENUE = [
  { label: "Mon", value: 42000 },
  { label: "Tue", value: 38000 },
  { label: "Wed", value: 51000 },
  { label: "Thu", value: 47000 },
  { label: "Fri", value: 63000 },
  { label: "Sat", value: 71000 },
  { label: "Sun", value: 58000 },
];

const TOP_PRODUCTS = [
  { name: "Field Overshirt", sold: 128 },
  { name: "Selvedge Denim", sold: 96 },
  { name: "Washed Linen Shirt", sold: 84 },
  { name: "Wool Crew Sweater", sold: 51 },
];

export default function AdminAnalyticsPage() {
  return (
    <>
      <AdminTopbar title="Analytics" />
      <div className="space-y-10 px-6 py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatTile key={s.label} {...s} />
          ))}
        </div>

        <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
          <h2 className="font-display text-lg italic text-ink">Revenue — Last 7 Days</h2>
          <div className="mt-6">
            <BarChart data={WEEKLY_REVENUE} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg italic text-ink">Top Products</h2>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                  <th className="px-5 py-3 font-normal">Product</th>
                  <th className="px-5 py-3 font-normal">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((p) => (
                  <tr key={p.name} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3 text-ink">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{p.sold}</td>
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
