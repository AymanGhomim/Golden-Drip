import { AdminSection } from "@/components/admin/admin-section";
import { mockProducts } from "@/mocks/products.mock";

export default function ProductsPage() {
  return (
    <AdminSection
      title={["Menu items", "عناصر المنيو"]}
      description={[
        "Manage drinks, offer-ready items, prices, images, and availability shown to guests.",
        "إدارة المشروبات والعناصر المعروضة للعميل، مع الأسعار والصور وحالة التوفر.",
      ]}
      count={mockProducts.length}
      label={["Available menu items", "عناصر متاحة في المنيو"]}
    />
  );
}
