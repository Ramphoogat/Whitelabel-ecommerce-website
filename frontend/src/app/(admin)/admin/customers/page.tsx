import { AdminTopbar } from "@/components/admin/topbar";
import { CUSTOMERS } from "@/lib/data/admin-customers";
import { formatPrice } from "@/lib/data/products";

export default function AdminCustomersPage() {
  return (
    <>
      <AdminTopbar title="Customers" />
      <div className="px-6 py-8">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Email</th>
                <th className="px-5 py-3 font-normal">Orders</th>
                <th className="px-5 py-3 font-normal">Lifetime Value</th>
                <th className="px-5 py-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c) => (
                <tr key={c.id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-line-soft font-mono text-[11px] text-ink-soft">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <span className="text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{c.email}</td>
                  <td className="px-5 py-3 text-ink-soft">{c.orders}</td>
                  <td className="px-5 py-3 font-mono text-ink">{formatPrice(c.lifetimeValue)}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
