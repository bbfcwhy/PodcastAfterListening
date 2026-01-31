"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Episode, Show } from "@/types/database";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { toast } from "sonner";

interface EpisodeTableProps {
  episodes: (Episode & { show?: Show })[];
  onDelete?: (id: string) => void;
}

export function EpisodeTable({ episodes, onDelete }: EpisodeTableProps) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleTogglePublished = async (episode: Episode & { show?: Show }) => {
    setTogglingId(episode.id);
    try {
      const res = await fetch(`/api/admin/episodes/${episode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_published: !episode.is_published,
          updated_at: episode.updated_at,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toast.warning("此筆內容已有更新版本，請重新整理後再切換");
        router.refresh();
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "切換失敗");
        return;
      }
      toast.success(episode.is_published ? "已改為下架" : "已改為上架");
      router.refresh();
    } catch (error) {
      console.error("Error toggling published:", error);
      toast.error("切換失敗");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除這個節目嗎？此操作無法復原。")) {
      try {
        const response = await fetch(`/api/admin/episodes/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          onDelete?.(id);
          window.location.reload();
        } else {
          alert("刪除失敗");
        }
      } catch (error) {
        console.error("Error deleting episode:", error);
        alert("刪除失敗");
      }
    }
  };

  return (
    <Table className="bg-surface">
      <TableHeader>
        <TableRow className="border-border-subtle">
          <TableHead className="text-text-primary">標題</TableHead>
          <TableHead className="text-text-primary">節目</TableHead>
          <TableHead className="text-text-primary">發布日期</TableHead>
          <TableHead className="text-text-primary">狀態</TableHead>
          <TableHead className="text-text-primary">建立時間</TableHead>
          <TableHead className="text-right text-text-primary">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {episodes.length === 0 ? (
          <TableRow className="border-border-subtle">
            <TableCell colSpan={6} className="text-center text-text-secondary">
              尚無節目
            </TableCell>
          </TableRow>
        ) : (
          episodes.map((episode) => (
            <TableRow key={episode.id} className="border-border-subtle hover:bg-hover">
              <TableCell className="font-medium">{episode.title}</TableCell>
              <TableCell>{episode.show?.name || "未知"}</TableCell>
              <TableCell>
                {episode.published_at
                  ? format(new Date(episode.published_at), "yyyy-MM-dd", {
                      locale: zhTW,
                    })
                  : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={episode.is_published ? "default" : "secondary"}>
                    {episode.is_published ? "已發布" : "草稿"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={togglingId === episode.id}
                    onClick={() => handleTogglePublished(episode)}
                    title={episode.is_published ? "改為下架" : "改為上架"}
                    aria-label={episode.is_published ? "改為下架" : "改為上架"}
                  >
                    {togglingId === episode.id
                      ? "…"
                      : episode.is_published
                        ? "下架"
                        : "上架"}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(episode.created_at), "yyyy-MM-dd HH:mm", {
                  locale: zhTW,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/episodes/edit/${episode.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(episode.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {episode.is_published && episode.show && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`/episodes/${episode.show.slug}/${episode.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
