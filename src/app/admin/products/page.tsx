import { AdminSection } from "@/components/admin/admin-section";
import { mockProducts } from "@/mocks/products.mock";
export default function ProductsPage() { return <AdminSection title={["Products", "المنتجات"]} description={["Manage drinks, pricing, and availability.", "إدارة المشروبات والأسعار والتوفر."]} count={mockProducts.length} label={["Active drinks", "مشروبات متاحة"]} />; }
