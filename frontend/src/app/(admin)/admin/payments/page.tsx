import { AdminTopbar } from "@/components/admin/topbar";
import { PaymentsManager } from "@/components/admin/payments-manager";

export default function AdminPaymentsPage() {
  return (
    <>
      <AdminTopbar title="Payments" />
      <div className="px-6 py-8">
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink">
          Manage payment gateways, configure API keys, and control which payment modes are
          available at checkout. Toggle a gateway off and it disappears from checkout
          immediately — no deploy needed.
        </p>
        <PaymentsManager />
      </div>
    </>
  );
}
