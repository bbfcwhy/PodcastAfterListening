import { ShowCard } from "./ShowCard";
import type { Show } from "@/types/database";
import { Podcast } from "lucide-react";

interface ShowGridProps {
  shows: Show[];
}

export function ShowGrid({ shows }: ShowGridProps) {
  // shows now already contains episode_count from the updated getShows service
  const showsWithCounts = shows as (Show & { episode_count: number })[];

  if (showsWithCounts.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-3xl font-black flex items-center gap-4 text-text-primary mb-12 md:mb-16">
        <Podcast className="text-info" size={28} /> 頻道內容專區
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        {showsWithCounts.map((show) => (
          <ShowCard key={show.id} show={show} episodeCount={show.episode_count} />
        ))}
      </div>
    </div>
  );
}
