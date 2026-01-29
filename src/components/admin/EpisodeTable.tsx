"use client";

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
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface EpisodeTableProps {
  episodes: (Episode & { show?: Show })[];
  onDelete?: (id: string) => void;
}

export function EpisodeTable({ episodes, onDelete }: EpisodeTableProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>標題</TableHead>
          <TableHead>節目</TableHead>
          <TableHead>發布日期</TableHead>
          <TableHead>狀態</TableHead>
          <TableHead>建立時間</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {episodes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              尚無節目
            </TableCell>
          </TableRow>
        ) : (
          episodes.map((episode) => (
            <TableRow key={episode.id}>
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
                <Badge variant={episode.is_published ? "default" : "secondary"}>
                  {episode.is_published ? "已發布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(episode.created_at), "yyyy-MM-dd HH:mm", {
                  locale: zhTW,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/episodes/edit/${episode.id}`}>
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
