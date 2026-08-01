import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { Toaster } from "sonner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Golden Drip Café - نظام الطلبات الذكي",
  description: "منيو وطلبات Golden Drip Café عبر QR Code",
  icons: {
    icon: "/logo-transparent.png",
    shortcut: "/logo-transparent.png",
    apple: "/logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            dir="ltr"
            toastOptions={{
              style: {
                fontFamily: "var(--font-cairo), system-ui, sans-serif",
              },
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
