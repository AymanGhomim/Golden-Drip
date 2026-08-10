"use client";

import { useEffect, useState } from "react";
import { AppLoadingState, AppNotFoundState } from "@/components/feedback/app-state";
import { cafeDataService } from "@/services/cafe-data.service";
import type { Product } from "@/types/product.types";
import { ProductDetailClient } from "./product-detail-client";

export function ProductPageResolver({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null | undefined>();

  useEffect(() => {
    const resolve = () =>
      setProduct(
        cafeDataService
          .getBranchProducts()
          .find((item) => item.id === productId && item.isAvailable) ?? null,
      );
    resolve();
    window.addEventListener("branch:changed", resolve);
    window.addEventListener("tenant:changed", resolve);
    return () => {
      window.removeEventListener("branch:changed", resolve);
      window.removeEventListener("tenant:changed", resolve);
    };
  }, [productId]);

  if (product === undefined)
    return <AppLoadingState variant="cafe" title="جاري تحميل المنتج..." />;
  if (!product)
    return (
      <AppNotFoundState
        variant="cafe"
        description="المنتج غير متاح في منيو الفرع الحالي."
        actionHref="/menu"
        actionLabel="العودة إلى المنيو"
      />
    );
  return <ProductDetailClient product={product} />;
}
