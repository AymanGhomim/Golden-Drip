import { ProductPageResolver } from "./product-page-resolver";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return <ProductPageResolver productId={productId} />;
}
