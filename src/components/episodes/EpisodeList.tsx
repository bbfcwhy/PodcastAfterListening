"use client";

import { useState } from "react";
import { EpisodeCard } from "./EpisodeCard";
import { Episode, Show } from "@/types/database";
import { Pagination } from "@/components/ui/Pagination";

interface EpisodeListProps {
  episodes: Episode[];
  shows?: (Show & { episode_count?: number })[];
  /* New props */
  showLimitControl?: boolean;
  itemsPerPage?: number;
  hideSectionTitle?: boolean;
}

export function EpisodeList({
  episodes,
  shows = [],
  itemsPerPage = 10,
  hideSectionTitle = false,
  showLimitControl = false,
}: EpisodeListProps) {
  const [limit, setLimit] = useState(itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(episodes.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const currentEpisodes = episodes.slice(startIndex, endIndex);

  // Create a map of show_id to Show for quick lookup
  const showMap = new Map(shows.map((show) => [show.id, show]));

  if (episodes.length === 0) {
    return null;
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {!hideSectionTitle && (
          <h2 className="text-2xl font-bold text-text-primary">最新單集</h2>
        )}

        {showLimitControl && (
          <div className="flex items-center gap-2 text-sm font-bold text-text-secondary ml-auto">
            <span>顯示數量：</span>
            <div className="flex bg-surface border border-border-subtle rounded-[2.5rem] p-1">
              {[10, 20, 30].map((value) => (
                <button
                  key={value}
                  onClick={() => handleLimitChange(value)}
                  className={`px-3 py-1 rounded-[1.5rem] transition-all text-sm font-bold ${limit === value
                    ? "bg-cta text-white shadow-sm"
                    : "hover:bg-hover text-text-secondary"
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        {currentEpisodes.map((episode) => {
          const show = showMap.get(episode.show_id);
          return (
            <EpisodeCard key={episode.id} episode={episode} show={show} />
          );
        })}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
