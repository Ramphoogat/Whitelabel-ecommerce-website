import { AdminTopbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <>
      <AdminTopbar title="New Product" />
      <div className="px-6 py-8">
        <ProductForm />
      </div>
    </>
  );
}
