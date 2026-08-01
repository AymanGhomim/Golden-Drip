import { AdminSection } from "@/components/admin/admin-section";
import { mockCategories } from "@/mocks/categories.mock";

export default function CategoriesPage() {
  return (
    <AdminSection
      title={["Menu categories", "أقسام المنيو"]}
      description={[
        "Organize the QR menu into clear drink categories for faster customer ordering.",
        "تنظيم منيو الـ QR إلى أقسام واضحة تساعد العميل يطلب بسرعة.",
      ]}
      count={mockCategories.length}
      label={["Customer-facing categories", "أقسام ظاهرة للعميل"]}
    />
  );
}
