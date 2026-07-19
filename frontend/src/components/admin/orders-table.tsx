import { RECENT_ORDERS, STATUS_STYLES } from "@/lib/data/admin";

export function OrdersTable() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
            <th className="px-5 py-3 font-normal">Order</th>
            <th className="px-5 py-3 font-normal">Customer</th>
            <th className="px-5 py-3 font-normal">Date</th>
            <th className="px-5 py-3 font-normal">Items</th>
            <th className="px-5 py-3 font-normal">Total</th>
            <th className="px-5 py-3 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_ORDERS.map((o) => (
            <tr key={o.id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
              <td className="px-5 py-3 font-mono text-ink">{o.id}</td>
              <td className="px-5 py-3 text-ink">{o.customer}</td>
              <td className="px-5 py-3 font-mono text-ink-soft">{o.date}</td>
              <td className="px-5 py-3 text-ink-soft">{o.items}</td>
              <td className="px-5 py-3 font-mono text-ink">{o.total}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_STYLES[o.status]}`}
                >
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
