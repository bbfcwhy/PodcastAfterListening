import { getAllShows } from "@/lib/services/admin/shows";
import { ShowTable } from "@/components/admin/ShowTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminShowsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const { items: shows, total } = await getAllShows({ page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">節目管理</h1>
          <p className="text-text-secondary mt-2">管理所有 Podcast 節目系列</p>
        </div>
        <Button asChild className="bg-cta text-text-primary hover:bg-cta/90">
          <Link href="/shows/new">
            <Plus className="mr-2 h-4 w-4" />
            新增節目
          </Link>
        </Button>
      </div>

      <ShowTable shows={shows} />
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        searchParams={{}}
      />
    </div>
  );
}
