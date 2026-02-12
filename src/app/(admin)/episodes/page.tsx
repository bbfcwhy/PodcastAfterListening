import { getAllEpisodes, getAllShows } from "@/lib/services/admin/episodes";
import { EpisodeTable } from "@/components/admin/EpisodeTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Episode } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; title?: string; is_published?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const title = params.title?.trim() || undefined;
  const is_published =
    params.is_published === "true"
      ? true
      : params.is_published === "false"
        ? false
        : undefined;

  const result = await getAllEpisodes({
    includeUnpublished: true,
    page,
    pageSize,
    title,
    is_published,
  });

  const { items: episodes, total } =
    typeof result === "object" && "items" in result && "total" in result
      ? result
      : { items: result as Episode[], total: (result as Episode[]).length };

  const shows = await getAllShows();
  const episodesWithShows = episodes.map((episode) => {
    const show = shows.find((s) => s.id === episode.show_id);
    return { ...episode, show };
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">單集管理</h1>
          <p className="text-text-secondary mt-2">
            管理所有 Podcast 單集
          </p>
        </div>
        <Button asChild className="bg-cta text-text-primary hover:bg-cta/90">
          <Link href="/episodes/new">
            <Plus className="mr-2 h-4 w-4" />
            新增單集
          </Link>
        </Button>
      </div>

      <form
        method="get"
        action="/episodes"
        className="flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="page" value="1" />
        <div className="space-y-1">
          <label htmlFor="ep-title" className="text-sm text-text-secondary">
            標題搜尋
          </label>
          <Input
            id="ep-title"
            name="title"
            type="search"
            placeholder="依標題篩選"
            defaultValue={params.title ?? ""}
            className="w-48"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="ep-published" className="text-sm text-text-secondary">
            上架狀態
          </label>
          <select
            id="ep-published"
            name="is_published"
            defaultValue={params.is_published ?? ""}
            className="flex h-9 w-36 rounded-md border border-border-subtle bg-surface px-3 py-1 text-sm text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cta"
          >
            <option value="">全部</option>
            <option value="true">已上架</option>
            <option value="false">未上架</option>
          </select>
        </div>
        <Button type="submit" variant="secondary">
          篩選
        </Button>
      </form>

      <EpisodeTable episodes={episodesWithShows} />
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        searchParams={{
          ...(title && { title }),
          ...(is_published !== undefined && { is_published: String(is_published) }),
        }}
      />
    </div>
  );
}
