import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Podcast After Listening | Podcast 聽了以後",
  description: "記下那些改變我的，也找回那些你聽過的 - 個人 Podcast 筆記與回顧網站",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      {/* suppressHydrationWarning: 瀏覽器擴充可能在 React 載入前改動 html/body 屬性，導致 hydration 不一致 */}
      <body suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
