"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { addEpisodeToLibrary, removeEpisodeFromLibrary } from "@/lib/library/episode-actions";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEpisodeToLibraryButtonProps {
    episodeId: string;
    initialIsAdded: boolean;
    className?: string;
}

export function AddEpisodeToLibraryButton({ episodeId, initialIsAdded, className }: AddEpisodeToLibraryButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(initialIsAdded);
    const router = useRouter();

    const toggleLibrary = () => {
        startTransition(async () => {
            try {
                if (isAdded) {
                    await removeEpisodeFromLibrary(episodeId);
                    setIsAdded(false);
                } else {
                    await addEpisodeToLibrary(episodeId);
                    setIsAdded(true);
                }
                router.refresh();
            } catch (error) {
                logger.error("Episode library action failed", error);
            }
        });
    };

    return (
        <Button
            variant={isAdded ? "secondary" : "outline"}
            size="sm"
            className={cn("gap-2 font-bold", className)}
            onClick={toggleLibrary}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Bookmark className={cn("w-4 h-4", isAdded && "fill-current")} />
            )}
            {isAdded ? "已收藏單集" : "收藏單集"}
        </Button>
    );
}
