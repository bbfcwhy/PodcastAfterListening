"use client";

import type { Episode, Show } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export interface CommentedEpisodeItem {
    episode: Episode & { show: Pick<Show, "name" | "slug" | "cover_image_url"> };
    commentCount: number;
    latestCommentAt: string;
}

interface CommentedEpisodeListProps {
    items: CommentedEpisodeItem[];
}

export function CommentedEpisodeList({ items }: CommentedEpisodeListProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-20 text-text-secondary">
                <p className="text-lg font-bold mb-4">還沒有留言過的單集</p>
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
                    key={item.episode.id}
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
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-text-primary truncate">{item.episode.title}</h3>
                            <p className="text-sm text-text-secondary truncate">
                                {item.episode.show.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                                {item.episode.published_at && (
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(item.episode.published_at), "yyyy年MM月dd日", { locale: zhTW })}
                                    </p>
                                )}
                                <span className="flex items-center gap-1 text-xs text-cta font-medium">
                                    <MessageSquare className="w-3 h-3" />
                                    {item.commentCount} 則留言
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
}
