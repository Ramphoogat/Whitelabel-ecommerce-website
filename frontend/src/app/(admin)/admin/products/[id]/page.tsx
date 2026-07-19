import { notFound } from "next/navigation";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";
import { ADMIN_PRODUCTS } from "@/lib/data/admin-products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = ADMIN_PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <>
      <AdminTopbar title={product.name} />
      <div className="px-6 py-8">
        <ProductForm product={product} />
      </div>
    </>
  );
}
