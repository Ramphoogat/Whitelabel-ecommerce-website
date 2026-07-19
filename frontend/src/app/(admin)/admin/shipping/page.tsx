import { AdminTopbar } from "@/components/admin/topbar";
import { SHIPPING_ZONES, CARRIERS } from "@/lib/data/admin-shipping";
import { formatPrice } from "@/lib/data/products";

export default function AdminShippingPage() {
  return (
    <>
      <AdminTopbar title="Shipping" />
      <div className="space-y-10 px-6 py-8">
        <section>
          <h2 className="font-display text-lg italic text-ink">Zones & Rates</h2>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                  <th className="px-5 py-3 font-normal">Zone</th>
                  <th className="px-5 py-3 font-normal">Regions</th>
                  <th className="px-5 py-3 font-normal">Method</th>
                  <th className="px-5 py-3 font-normal">Rate</th>
                  <th className="px-5 py-3 font-normal">ETA</th>
                </tr>
              </thead>
              <tbody>
                {SHIPPING_ZONES.map((z) => (
                  <tr key={z.name + z.method} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3 text-ink">{z.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{z.regions}</td>
                    <td className="px-5 py-3 text-ink-soft">{z.method}</td>
                    <td className="px-5 py-3 font-mono text-ink">{z.rate === 0 ? "Free" : formatPrice(z.rate)}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{z.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg italic text-ink">Carriers</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {CARRIERS.map((c) => (
              <span
                key={c.name}
                className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] ${
                  c.active ? "border-success/30 bg-success/10 text-success" : "border-line text-ink-soft"
                }`}
              >
                {c.name} · {c.active ? "Connected" : "Not connected"}
              </span>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
