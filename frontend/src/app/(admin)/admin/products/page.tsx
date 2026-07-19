import { AdminTopbar } from "@/components/admin/topbar";
import { ProductsTable } from "@/components/admin/products-table";

export default function AdminProductsPage() {
  return (
    <>
      <AdminTopbar title="Products" />
      <div className="px-6 py-8">
        <ProductsTable />
      </div>
    </>
  );
}
