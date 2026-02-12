"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { addToLibrary, removeFromLibrary } from "@/lib/library/actions";
import { Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToLibraryButtonProps {
    showId: string;
    initialIsAdded: boolean;
    className?: string;
}

export function AddToLibraryButton({ showId, initialIsAdded, className }: AddToLibraryButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(initialIsAdded);

    const toggleLibrary = () => {
        startTransition(async () => {
            try {
                if (isAdded) {
                    await removeFromLibrary(showId);
                    setIsAdded(false);
                } else {
                    await addToLibrary(showId);
                    setIsAdded(true);
                }
            } catch (error) {
                // Simple error handling, could be improved with toast
                console.error("Library action failed", error);
                // Revert state if needed, or rely on server revalidation
            }
        });
    };

    return (
        <Button
            variant={isAdded ? "secondary" : "default"}
            size="sm"
            className={cn("gap-2 font-bold", className)}
            onClick={toggleLibrary}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isAdded ? (
                <Check className="w-4 h-4" />
            ) : (
                <Plus className="w-4 h-4" />
            )}
            {isAdded ? "In Library" : "Library"}
        </Button>
    );
}
