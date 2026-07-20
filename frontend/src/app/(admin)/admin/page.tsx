import { AdminTopbar } from "@/components/admin/topbar";
import { StatTile } from "@/components/admin/stat-tile";
import { OrdersTable } from "@/components/admin/orders-table";
import { STATS } from "@/lib/data/admin";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="px-6 py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatTile key={s.label} {...s} index={i} />
          ))}
        </div>

        <div className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg italic text-ink">Recent Orders</h2>
            <a
              href="/admin/orders"
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
            >
              View all
            </a>
          </div>
          <div className="mt-4">
            <OrdersTable />
          </div>
        </div>
      </div>
    </>
  );
}
