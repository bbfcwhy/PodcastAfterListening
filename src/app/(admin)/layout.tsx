import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r bg-muted/40 p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-bold mb-4">後台管理</h2>
            <nav className="space-y-1">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  儀表板
                </Button>
              </Link>
              <Link href="/episodes">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  單集管理
                </Button>
              </Link>
              <Link href="/comments">
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  留言審核
                </Button>
              </Link>
              <Link href="/affiliates">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  聯盟行銷
                </Button>
              </Link>
            </nav>
            <div className="pt-4 border-t">
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <Button type="submit" variant="ghost" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </MainLayout>
  );
}
