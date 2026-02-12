import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Episode, Show } from "@/types/database";

interface SearchResultsProps {
  episodes: Episode[];
  shows: Show[];
  query?: string;
}

export function SearchResults({
  episodes,
  shows,
  query,
}: SearchResultsProps) {
  const showsMap = new Map(shows.map((s) => [s.id, s]));

  if (episodes.length === 0) {
    return (
      <EmptyState
        title="沒有找到相關節目"
        description={query ? `沒有符合「${query}」的搜尋結果` : "請嘗試調整搜尋條件"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-text-secondary font-bold">
        找到 {episodes.length} 個結果
        {query && `（關鍵字：${query}）`}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {episodes.map((episode) => {
          const show = showsMap.get(episode.show_id);
          return (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              show={show}
            />
          );
        })}
      </div>
    </div>
  );
}
