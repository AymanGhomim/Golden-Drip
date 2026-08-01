import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        title="الصفحة غير موجودة"
        description="الصفحة التي تبحث عنها غير موجودة أو تم نقلها"
        icon="search"
        action={
          <Button asChild>
            <Link href={ROUTES.menu}>
              <Home className="ml-2 h-4 w-4" />
              العودة للقائمة
            </Link>
          </Button>
        }
      />
    </div>
  );
}
