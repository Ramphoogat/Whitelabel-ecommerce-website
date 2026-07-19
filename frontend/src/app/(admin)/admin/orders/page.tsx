import { AdminTopbar } from "@/components/admin/topbar";
import { OrdersTable } from "@/components/admin/orders-table";

export default function AdminOrdersPage() {
  return (
    <>
      <AdminTopbar title="Orders" />
      <div className="px-6 py-8">
        <OrdersTable />
      </div>
    </>
  );
}
