import { getAllEpisodes, getAllShows } from "@/lib/services/admin/episodes";
import { EpisodeTable } from "@/components/admin/EpisodeTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEpisodesPage() {
  const episodes = await getAllEpisodes(true);
  const shows = await getAllShows();

  // Enrich episodes with show data
  const supabase = await createClient();
  const episodesWithShows = await Promise.all(
    episodes.map(async (episode) => {
      const show = shows.find((s) => s.id === episode.show_id);
      return { ...episode, show };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">節目管理</h1>
          <p className="text-muted-foreground mt-2">
            管理所有 Podcast 節目單集
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/episodes/new">
            <Plus className="mr-2 h-4 w-4" />
            新增節目
          </Link>
        </Button>
      </div>

      <EpisodeTable episodes={episodesWithShows} />
    </div>
  );
}
