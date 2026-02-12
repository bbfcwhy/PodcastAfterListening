import { MainLayout } from "@/components/layout/MainLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar (Client Component) */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 bg-canvas">{children}</main>
      </div>
    </MainLayout>
  );
}
