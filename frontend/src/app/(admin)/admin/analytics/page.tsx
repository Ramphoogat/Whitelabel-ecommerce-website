import { AdminTopbar } from "@/components/admin/topbar";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatTile } from "@/components/admin/stat-tile";
import { STATS } from "@/lib/data/admin";
import { TopProductsTable } from "@/components/admin/top-products-table";

export default function AdminAnalyticsPage() {
  return (
    <>
      <AdminTopbar title="Analytics" />
      <div className="space-y-10 px-6 py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatTile key={s.label} {...s} index={i} />
          ))}
        </div>

        <RevenueChart />

        <TopProductsTable />
      </div>
    </>
  );
}
