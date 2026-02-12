"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Show } from "@/types/database";
import { Edit, ExternalLink, Image as ImageIcon, Plus, Radio } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import Image from "next/image";
import { AdminPagination } from "@/components/admin/AdminPagination";
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
} from "@dnd-kit/sortable";
import { SortableShowRow } from "./SortableShowRow";
import { updateShowOrder } from "@/lib/shows/actions";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { logger } from "@/lib/logger";

interface ShowListProps {
    initialShows: Show[];
    totalCount: number;
    page: number;
    perPage: number;
}

function CoverImage({ src, alt }: { src: string | null; alt: string }) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="w-12 h-12 rounded bg-surface-muted flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-text-secondary" />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={48}
            height={48}
            className="w-12 h-12 rounded object-cover"
            onError={() => setHasError(true)}
        />
    );
}

export function ShowList({
    initialShows,
    totalCount,
    page,
    perPage,
}: ShowListProps) {
    const [items, setItems] = useState(initialShows);
    const searchParams = useSearchParams();

    // Sync items when props change (e.g. pagination/filter from parent)
    useEffect(() => {
        setItems(initialShows);
    }, [initialShows]);

    const sort = searchParams.get("sort") || "custom";
    const filter = searchParams.get("search");
    const category = searchParams.get("category");

    // Draggable only if custom sort and no filters
    const isDraggable = sort === "custom" && !filter && (!category || category === "all");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);

            // Optimistic update
            setItems(newItems);

            // Calculate payload
            // Instead of reusing potentially duplicate currentPositions (which might be all 0),
            // we regenerate positions based on the current page and index.
            // This ensures every item gets a distinct, ordered position value.
            const startPosition = (page - 1) * perPage;

            const updatePayload = newItems.map((item, index) => ({
                id: item.id,
                position: startPosition + index + 1 // 1-based index for safety, though 0 is fine
            }));



            try {
                await updateShowOrder(updatePayload);
                toast.success("順序已更新");
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "未知錯誤";
                toast.error(`更新順序失敗: ${errorMessage}`);

                // Log error with context for debugging
                logger.errorWithContext(
                    "Failed to update show order",
                    err,
                    {
                        itemCount: newItems.length,
                        page,
                        perPage,
                    }
                );

                setItems(items); // Revert on failure
            }
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-surface border border-border-subtle rounded-lg py-16 px-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-cta/10 flex items-center justify-center mb-4">
                    <Radio className="w-8 h-8 text-cta" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">尚無節目</h3>
                <p className="text-text-secondary mb-6">{filter ? "沒有符合條件的節目" : "建立您的第一個 Podcast 節目系列"}</p>
                <Button asChild className="bg-cta text-text-primary hover:bg-cta/90">
                    <Link href="/shows/new">
                        <Plus className="mr-2 h-4 w-4" />
                        新增節目
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="rounded-lg border border-border-subtle overflow-hidden bg-surface/40 backdrop-blur-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border-subtle">
                                    {isDraggable && <TableHead className="w-[50px]"></TableHead>}
                                    <TableHead className="text-text-primary w-16">封面</TableHead>
                                    <TableHead className="text-text-primary">名稱</TableHead>
                                    <TableHead className="text-text-primary">Slug</TableHead>
                                    <TableHead className="text-text-primary">建立時間</TableHead>
                                    <TableHead className="text-right text-text-primary">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((show) => (
                                    <SortableShowRow key={show.id} id={show.id} isDraggable={isDraggable} className="border-border-subtle hover:bg-hover">
                                        <TableCell>
                                            <CoverImage src={show.cover_image_url} alt={show.name} />
                                        </TableCell>
                                        <TableCell className="font-medium text-text-primary">
                                            {show.name}
                                        </TableCell>
                                        <TableCell className="text-text-secondary">{show.slug}</TableCell>
                                        <TableCell className="text-text-secondary">
                                            {format(new Date(show.created_at), "yyyy-MM-dd", {
                                                locale: zhTW,
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/shows/${show.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {show.original_url && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a
                                                            href={show.original_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </SortableShowRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SortableContext>
            </DndContext>

            <AdminPagination
                currentPage={page}
                totalPages={Math.ceil(totalCount / perPage)}
                searchParams={Object.fromEntries(searchParams.entries())}
            />
        </div>
    );
}
