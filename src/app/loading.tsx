import { AppLoadingState } from "@/components/feedback/app-state";

export default function RootLoading() {
  return <AppLoadingState variant="neutral" title="جاري تحميل التطبيق..." fullScreen />;
}
