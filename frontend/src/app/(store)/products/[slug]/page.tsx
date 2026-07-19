"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useProduct } from "@/hooks/use-catalog";
import { ProductDetail } from "@/components/store/product-detail";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { product, isLoading } = useProduct(slug);

  if (!product && isLoading) return null;
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
