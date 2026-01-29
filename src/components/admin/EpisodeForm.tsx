"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Episode, Show } from "@/types/database";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EpisodeFormProps {
  episode?: Episode;
  shows: Show[];
  onSubmit: (data: FormData) => Promise<void>;
}

export function EpisodeForm({ episode, shows, onSubmit }: EpisodeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      toast.success(episode ? "節目已更新" : "節目已建立");
      router.push("/admin/episodes");
      router.refresh();
    } catch (error) {
      console.error("Error submitting episode:", error);
      toast.error(
        error instanceof Error ? error.message : "操作失敗，請稍後再試"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="show_id">節目系列 *</Label>
        <Select
          name="show_id"
          defaultValue={episode?.show_id}
          required
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="選擇節目系列" />
          </SelectTrigger>
          <SelectContent>
            {shows.map((show) => (
              <SelectItem key={show.id} value={show.id}>
                {show.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">標題 *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={episode?.title}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug *</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={episode?.slug}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="published_at">發布日期</Label>
        <Input
          id="published_at"
          name="published_at"
          type="date"
          defaultValue={
            episode?.published_at
              ? new Date(episode.published_at).toISOString().split("T")[0]
              : ""
          }
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="original_url">原始連結 *</Label>
        <Input
          id="original_url"
          name="original_url"
          type="url"
          defaultValue={episode?.original_url}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai_summary">AI 大綱</Label>
        <Textarea
          id="ai_summary"
          name="ai_summary"
          defaultValue={episode?.ai_summary || ""}
          rows={6}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai_sponsorship">業配內容</Label>
        <Textarea
          id="ai_sponsorship"
          name="ai_sponsorship"
          defaultValue={episode?.ai_sponsorship || ""}
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="host_notes">站長心得</Label>
        <Textarea
          id="host_notes"
          name="host_notes"
          defaultValue={episode?.host_notes || ""}
          rows={6}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_seconds">時長（秒）</Label>
        <Input
          id="duration_seconds"
          name="duration_seconds"
          type="number"
          defaultValue={episode?.duration_seconds || ""}
          disabled={loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_published"
          name="is_published"
          defaultChecked={episode?.is_published || false}
          disabled={loading}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="is_published" className="cursor-pointer">
          公開顯示
        </Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "處理中..." : episode ? "更新" : "建立"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
