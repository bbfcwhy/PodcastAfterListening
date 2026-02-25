"use client";

import type { EpisodeLibraryItemWithEpisode } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddEpisodeToLibraryButton } from "./AddEpisodeToLibraryButton";
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
        <div className="max-w-3xl space-y-3">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border-subtle shadow-sm hover:border-cta/50 transition-colors"
                >
                    <Link
                        href={`/episodes/${item.episode.show.slug}/${item.episode.slug}`}
                        className="flex-1 flex items-center gap-4 min-w-0"
                    >
                        <div className="w-16 h-16 rounded-lg bg-surface-highlight overflow-hidden shrink-0">
                            {item.episode.show.cover_image_url ? (
                                <img
                                    src={item.episode.show.cover_image_url}
                                    alt={item.episode.show.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-cta/10 flex items-center justify-center text-cta font-bold">
                                    {item.episode.show.name.slice(0, 1)}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-text-primary truncate">{item.episode.title}</h3>
                            <p className="text-sm text-text-secondary truncate">
                                {item.episode.show.name}
                            </p>
                            {item.episode.published_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(item.episode.published_at), "yyyy年MM月dd日", { locale: zhTW })}
                                </p>
                            )}
                        </div>
                    </Link>

                    <AddEpisodeToLibraryButton
                        episodeId={item.episode_id}
                        initialIsAdded={true}
                        className="shrink-0"
                    />
                </div>
            ))}
        </div>
    );
}
