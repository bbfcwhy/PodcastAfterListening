import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Podcast 聽後回顧網站",
  description: "分享 Podcast 節目的個人心得與 AI 解析內容",
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
