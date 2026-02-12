import { getAdminShows, getShowCategories } from "@/lib/shows/actions";
import { ShowList } from "@/components/admin/shows/ShowList";
import { AdminShowToolbar } from "@/components/admin/shows/AdminShowToolbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminShowsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    search?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = parseInt(params.perPage ?? "10", 10) || 10;
  const sort = (params.sort as any) || "custom";
  const filter = params.search;
  const category = params.category;

  const [{ data: shows, count }, categories] = await Promise.all([
    getAdminShows({ page, perPage, sort, filter, category }),
    getShowCategories(),
  ]);

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

      <AdminShowToolbar categories={categories} />

      <ShowList
        initialShows={shows}
        totalCount={count}
        page={page}
        perPage={perPage}
      />
    </div>
  );
}
