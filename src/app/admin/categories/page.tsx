import { AdminSection } from "@/components/admin/admin-section";
import { mockCategories } from "@/mocks/categories.mock";
export default function CategoriesPage() { return <AdminSection title={["Categories", "الأقسام"]} description={["Organize your café menu categories.", "تنظيم أقسام منيو الكافيه."]} count={mockCategories.length} label={["Menu categories", "أقسام المنيو"]} />; }
