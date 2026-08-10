import { ProductPageResolver } from "./product-page-resolver";

export default function ProductPage({ params }: { params: { productId: string } }) {
  return <ProductPageResolver productId={params.productId} />;
}
