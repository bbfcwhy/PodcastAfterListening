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
    comments: { content: string; createdAt: string }[];
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
        <div className="space-y-4">
            {items.map((item) => (
                <Link
                    key={item.episode.id}
                    href={`/episodes/${item.episode.show.slug}/${item.episode.slug}`}
                    className="block bg-surface rounded-xl border border-border-subtle shadow-sm hover:border-cta/50 transition-colors"
                >
                    <div className="flex items-center gap-4 p-4">
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
                    </div>
                    <div className="px-4 pb-4 space-y-2">
                        {item.comments.map((comment, idx) => (
                            <div key={idx} className="bg-canvas rounded-lg px-4 py-3">
                                <p className="text-sm text-text-primary line-clamp-2">{comment.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(comment.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhTW })}
                                </p>
                            </div>
                        ))}
                    </div>
                </Link>
            ))}
        </div>
    );
}
