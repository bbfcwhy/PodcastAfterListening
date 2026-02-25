"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TagWithCounts {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  episode_count: number;
  show_count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TagWithCounts | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<{ episode_count: number; show_count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchTags() {
    try {
      const res = await fetch("/api/admin/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch {
      toast.error("載入標籤失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTags();
  }, []);

  async function handleDeleteClick(tag: TagWithCounts) {
    setDeleteTarget(tag);
    setDeleteUsage(null);
    try {
      const res = await fetch(`/api/admin/tags/${tag.id}/usage`);
      if (res.ok) {
        const usage = await res.json();
        setDeleteUsage(usage);
      }
    } catch {
      setDeleteUsage({ episode_count: 0, show_count: 0 });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tags/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`已刪除標籤「${deleteTarget.name}」`);
        setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      } else {
        const data = await res.json();
        toast.error(data.error || "刪除失敗");
      }
    } catch {
      toast.error("刪除標籤失敗");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">標籤管理</h1>
          <p className="text-sm text-text-secondary mt-1">
            管理所有標籤，用於分類單集與節目
          </p>
        </div>
        <Button asChild>
          <Link href="/tags/new">
            <Plus className="mr-2 h-4 w-4" />
            新增標籤
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">載入中...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg font-bold mb-4">還沒有標籤</p>
          <Button asChild>
            <Link href="/tags/new">建立第一個標籤</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">單集數</TableHead>
                <TableHead className="text-center">節目數</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge variant="secondary">{tag.name}</Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary text-sm">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-center">{tag.episode_count}</TableCell>
                  <TableCell className="text-center">{tag.show_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tags/${tag.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(tag)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除標籤</DialogTitle>
            <DialogDescription>
              確定要刪除標籤「{deleteTarget?.name}」嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          {deleteUsage ? (
            <div className="py-2 text-sm text-text-secondary">
              {deleteUsage.episode_count > 0 || deleteUsage.show_count > 0 ? (
                <p>
                  此標籤目前被 {deleteUsage.episode_count} 個單集和{" "}
                  {deleteUsage.show_count} 個節目使用，刪除後這些關聯將一併移除。
                </p>
              ) : (
                <p>此標籤目前沒有被任何單集或節目使用。</p>
              )}
            </div>
          ) : (
            <div className="py-2 text-sm text-text-secondary">載入使用統計中...</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting || !deleteUsage}
            >
              {deleting ? "刪除中..." : "確認刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
