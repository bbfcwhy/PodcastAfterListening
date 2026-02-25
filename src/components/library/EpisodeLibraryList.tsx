"use client";

import type { EpisodeLibraryItemWithEpisode } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface EpisodeLibraryListProps {
    items: EpisodeLibraryItemWithEpisode[];
}

export function EpisodeLibraryList({ items }: EpisodeLibraryListProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-20 text-text-secondary">
                <p className="text-lg font-bold mb-4">還沒有收藏的單集</p>
                <Button asChild>
                    <Link href="/">去探索單集</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {items.map((item) => {
                const formattedPublishedDate = item.episode.published_at
                    ? format(new Date(item.episode.published_at), "yyyy年MM月dd日", { locale: zhTW })
                    : null;

                return (
                    <EpisodeCard
                        key={item.id}
                        episode={{ ...item.episode, formattedPublishedDate }}
                        show={item.episode.show as any}
                    />
                );
            })}
        </div>
    );
}
