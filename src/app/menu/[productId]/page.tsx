import { notFound } from "next/navigation";
import { mockProducts } from "@/mocks/products.mock";
import { ProductDetailClient } from "./product-detail-client";

export default function ProductPage({ params }: { params: { productId: string } }) {
  const product = mockProducts.find((item) => item.id === params.productId);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
