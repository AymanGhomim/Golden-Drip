import { AppNotFoundState } from "@/components/feedback/app-state";

export default function RootNotFound() {
  return <AppNotFoundState variant="neutral" description="تعذر العثور على الصفحة المطلوبة داخل التطبيق." actionHref="/" actionLabel="العودة إلى البداية" fullScreen />;
}
