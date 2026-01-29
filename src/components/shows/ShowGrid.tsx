import { ShowCard } from "./ShowCard";
import { Show } from "@/types/database";
import { getShowWithEpisodeCount } from "@/lib/services/shows";

interface ShowGridProps {
  shows: Show[];
}

export async function ShowGrid({ shows }: ShowGridProps) {
  // Fetch episode counts for each show
  const showsWithCounts = await Promise.all(
    shows.map(async (show) => {
      const count = await getShowWithEpisodeCount(show.id);
      return { show, count };
    })
  );

  if (showsWithCounts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">節目系列</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showsWithCounts.map(({ show, count }) => (
          <ShowCard key={show.id} show={show} episodeCount={count} />
        ))}
      </div>
    </div>
  );
}
