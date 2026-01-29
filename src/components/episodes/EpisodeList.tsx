"use client";

import { useState } from "react";
import { EpisodeCard } from "./EpisodeCard";
import { Episode, Show } from "@/types/database";
import { Pagination } from "@/components/ui/Pagination";

interface EpisodeListProps {
  episodes: Episode[];
  shows?: Show[];
  itemsPerPage?: number;
  /** 隱藏區塊標題（由外層提供，如首頁「最新百科收錄」） */
  hideSectionTitle?: boolean;
}

export function EpisodeList({
  episodes,
  shows = [],
  itemsPerPage = 10,
  hideSectionTitle = false,
}: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(episodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEpisodes = episodes.slice(startIndex, endIndex);

  // Create a map of show_id to Show for quick lookup
  const showMap = new Map(shows.map((show) => [show.id, show]));

  if (episodes.length === 0) {
    return null;
  }

  return (
    <div>
      {!hideSectionTitle && (
        <h2 className="text-2xl font-bold mb-6 text-text-primary">最新單集</h2>
      )}
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
