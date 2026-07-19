import { AdminTopbar } from "@/components/admin/topbar";
import { GatewayToggleList } from "@/components/admin/gateway-toggle-list";

export default function AdminPaymentsPage() {
  return (
    <>
      <AdminTopbar title="Payments" />
      <div className="px-6 py-8">
        <p className="max-w-xl text-[13px] leading-relaxed text-ink-soft">
          Toggle a gateway off and it disappears from checkout immediately — no
          deploy needed. Customers see payment <em>modes</em> (UPI, Card,
          Netbanking); each mode reveals whichever active gateways support it.
        </p>
        <div className="mt-5">
          <GatewayToggleList />
        </div>
      </div>
    </>
  );
}
