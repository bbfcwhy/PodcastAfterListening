"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  LogOut,
  Radio,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "儀表板", icon: LayoutDashboard },
  { href: "/shows", label: "節目管理", icon: Radio },
  { href: "/episodes", label: "單集管理", icon: FileText },
  { href: "/comments", label: "留言審核", icon: MessageSquare },
  { href: "/affiliates", label: "聯盟行銷", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-border-subtle bg-surface p-4" role="complementary">
          <div className="space-y-2">
            <h2 id="admin-nav-heading" className="text-lg font-bold mb-4 text-text-primary">後台管理</h2>
            <nav className="space-y-1" role="navigation" aria-labelledby="admin-nav-heading">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-hover ${
                        active ? "bg-selected text-text-primary" : "text-text-secondary"
                      }`}
                      tabIndex={-1}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-border-subtle">
              <form action="/api/auth/signout" method="POST">
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start text-text-secondary hover:bg-hover"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 bg-canvas">{children}</main>
      </div>
    </MainLayout>
  );
}
