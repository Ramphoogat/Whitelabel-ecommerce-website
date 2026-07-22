import { AdminTopbar } from "@/components/admin/topbar";
import { ShippingManager } from "@/components/admin/shipping-manager";

export default function AdminShippingPage() {
  return (
    <>
      <AdminTopbar title="Shipping" />
      <div className="px-6 py-8">
        <ShippingManager />
      </div>
    </>
  );
}
