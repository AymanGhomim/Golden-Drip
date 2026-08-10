import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Penta-K | إدارة الكافيهات والمطاعم",
  description: "منصة Penta-K لإدارة الكافيهات والمطاعم",
  icons: { icon: "/logo platform.png", shortcut: "/logo platform.png", apple: "/logo platform.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" suppressHydrationWarning><body className="font-sans antialiased"><AppProviders>{children}<Toaster position="top-center" richColors closeButton dir="rtl" toastOptions={{ style: { fontFamily: "var(--tenant-font-family, var(--font-cairo), system-ui, sans-serif)" } }} /></AppProviders></body></html>;
}
