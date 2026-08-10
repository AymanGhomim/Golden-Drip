import { AppNotFoundState } from "@/components/feedback/app-state";

export default function PlatformNotFound() {
  return <AppNotFoundState variant="platform" description="تعذر العثور على الصفحة المطلوبة داخل لوحة إدارة المنصة." actionHref="/platform/dashboard" actionLabel="العودة إلى لوحة المنصة" />;
}
