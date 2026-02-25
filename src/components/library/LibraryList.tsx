"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import type {
    DragEndEvent} from "@dnd-kit/core";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Show, LibraryItem } from "@/types/database";
import { updateLibraryOrder } from "@/lib/library/actions";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToLibraryButton } from "./AddToLibraryButton";

type LibraryItemWithShow = LibraryItem & { show: Show };

interface LibraryListProps {
    items: LibraryItemWithShow[];
}

function SortableItem({ item }: { item: LibraryItemWithShow }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 p-4 bg-surface rounded-xl border border-border-subtle mb-3 ${isDragging ? "opacity-50 z-50 shadow-xl" : "shadow-sm hover:border-cta/50 transition-colors"
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary p-2"
            >
                <GripVertical size={20} />
            </div>

            <Link href={`/shows/${item.show.slug}`} className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-surface-highlight overflow-hidden shrink-0">
                    {item.show.cover_image_url ? (
                        <img
                            src={item.show.cover_image_url}
                            alt={item.show.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-cta/10 flex items-center justify-center text-cta font-bold">
                            {item.show.name.slice(0, 1)}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-text-primary truncate">{item.show.name}</h3>
                    <p className="text-sm text-text-secondary truncate max-w-[200px] md:max-w-md">
                        {item.show.description?.replace(/<[^>]*>?/gm, "").slice(0, 60)}...
                    </p>
                </div>
            </Link>

            <AddToLibraryButton
                showId={item.show.id}
                initialIsAdded={true}
                className="shrink-0"
            />
        </div>
    );
}

export function LibraryList({ items }: LibraryListProps) {
    const [sortedItems, setSortedItems] = useState(items);

    // Sync with server data when props change (fixes stale props after router.refresh)
    if (items !== sortedItems && JSON.stringify(items.map(i => i.id)) !== JSON.stringify(sortedItems.map(i => i.id))) {
        setSortedItems(items);
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSortedItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(prev, oldIndex, newIndex);

                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    position: index,
                }));

                updateLibraryOrder(updates).catch((err) => {
                    logger.error("Failed to update order", err);
                });

                return newItems;
            });
        }
    };

    if (sortedItems.length === 0) {
        return (
            <div className="text-center py-20 text-text-secondary">
                <p className="text-lg font-bold mb-4">你的收藏庫是空的</p>
                <Button asChild>
                    <Link href="/">去探索節目</Link>
                </Button>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={sortedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="max-w-3xl">
                    {sortedItems.map((item) => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
