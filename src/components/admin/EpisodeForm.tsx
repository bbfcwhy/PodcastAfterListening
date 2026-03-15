"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
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
import type { Episode, Show } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EPISODE_LONG_TEXT_MAX_LENGTH } from "@/lib/constants";
import { TagPicker } from "@/components/admin/TagPicker";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface EpisodeFormProps {
  episode?: Episode;
  shows: Show[];
  onSubmit: (data: FormData) => Promise<void>;
}

type FieldError = Record<string, string>;

export function EpisodeForm({ episode, shows, onSubmit }: EpisodeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [conflict, setConflict] = useState<{ current_updated_at: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showId, setShowId] = useState(episode?.show_id ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const isEdit = !!episode;
  const showDeletedWarning =
    isEdit && episode && !shows.some((s) => s.id === episode.show_id);

  // Load existing tags for edit mode
  useEffect(() => {
    if (!episode?.id) return;
    fetch(`/api/admin/episodes/${episode.id}/tags`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tag_ids) setSelectedTagIds(data.tag_ids);
      })
      .catch(() => {});
  }, [episode?.id]);

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setConflict(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (isEdit && episode) {
        const body = {
          show_id: formData.get("show_id") as string,
          title: (formData.get("title") as string)?.trim(),
          slug: (formData.get("slug") as string)?.trim(),
          published_at: (formData.get("published_at") as string) || null,
          original_url: (formData.get("original_url") as string)?.trim(),
          ai_summary: (formData.get("ai_summary") as string) || null,
          ai_sponsorship: (formData.get("ai_sponsorship") as string) || null,
          transcript: (formData.get("transcript") as string) || null,
          reflection: (formData.get("reflection") as string) || null,
          duration_seconds: formData.get("duration_seconds")
            ? parseInt(formData.get("duration_seconds") as string, 10)
            : null,
          is_published: formData.get("is_published") === "on",
          updated_at: episode.updated_at,
        };

        const res = await fetch(`/api/admin/episodes/${episode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          setConflict({
            current_updated_at: data.current_updated_at ?? "",
          });
          setLoading(false);
          return;
        }

        if (!res.ok) {
          if (res.status === 400 && data.field) {
            setFieldErrors({ [data.field]: data.error || "驗證失敗" });
          } else {
            toast.error(data.error || "更新失敗");
          }
          setLoading(false);
          return;
        }

        // Save tags
        await fetch(`/api/admin/episodes/${episode.id}/tags`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag_ids: selectedTagIds }),
        });

        setDirty(false);
        setSaveSuccess(true);
        toast.success("單集已更新");
        router.refresh();
      } else {
        await onSubmit(formData);
        toast.success("單集已建立");
        router.push("/episodes");
        router.refresh();
      }
    } catch (error) {
      logger.error("Error submitting episode:", error);
      toast.error(
        error instanceof Error ? error.message : "操作失敗，請稍後再試"
      );
    } finally {
      if (!isEdit) setLoading(false);
      else if (!conflict) setLoading(false);
    }
  };

  const handleConflictReload = () => {
    setConflict(null);
    router.refresh();
  };

  const handleConflictOverwrite = async () => {
    if (!episode) return;
    setConflict(null);
    const form = document.querySelector("form");
    if (!form) return;
    const formData = new FormData(form);
    const body = {
      show_id: formData.get("show_id") as string,
      title: (formData.get("title") as string)?.trim(),
      slug: (formData.get("slug") as string)?.trim(),
      published_at: (formData.get("published_at") as string) || null,
      original_url: (formData.get("original_url") as string)?.trim(),
      ai_summary: (formData.get("ai_summary") as string) || null,
      ai_sponsorship: (formData.get("ai_sponsorship") as string) || null,
      transcript: (formData.get("transcript") as string) || null,
      reflection: (formData.get("reflection") as string) || null,
      duration_seconds: formData.get("duration_seconds")
        ? parseInt(formData.get("duration_seconds") as string, 10)
        : null,
      is_published: formData.get("is_published") === "on",
      updated_at: null,
    };
    try {
      const res = await fetch(`/api/admin/episodes/${episode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("覆蓋失敗");
      setDirty(false);
      setSaveSuccess(true);
      toast.success("已覆蓋為目前內容");
      router.refresh();
    } catch {
      toast.error("覆蓋失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleConflictDismiss = () => {
    setConflict(null);
    setLoading(false);
  };

  const handleCancel = () => {
    if (dirty && !confirm("有未儲存的變更，確定要離開嗎？")) return;
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {showDeletedWarning && (
        <div
          className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
          role="alert"
        >
          所屬節目已刪除，請在下方重新選擇節目。
        </div>
      )}

      {conflict && (
        <div
          className="rounded-md border border-orange-500/50 bg-orange-500/10 px-4 py-3 text-sm text-orange-800 dark:text-orange-200 space-y-2"
          role="alert"
        >
          <p className="font-medium">此筆內容已有更新版本</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={handleConflictReload}
            >
              重新載入
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleConflictOverwrite}
            >
              覆蓋
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleConflictDismiss}
            >
              放棄
            </Button>
          </div>
        </div>
      )}

      {saveSuccess && isEdit && (
        <div className="flex gap-2 text-sm text-green-600 dark:text-green-400">
          <span>儲存成功。</span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-green-600 dark:text-green-400"
            onClick={() => router.push("/episodes")}
          >
            返回列表
          </Button>
          <span>或繼續編輯下方內容。</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="show_id">
          節目系列 <span className="text-destructive">*</span>
        </Label>
        <input type="hidden" name="show_id" value={showId} />
        <Select
          value={showId || undefined}
          required
          disabled={loading}
          onValueChange={(v) => {
            setShowId(v);
            markDirty();
          }}
        >
          <SelectTrigger id="show_id">
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
        {fieldErrors.show_id && (
          <p className="text-sm text-destructive">{fieldErrors.show_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          標題 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={episode?.title}
          required
          disabled={loading}
          onChange={markDirty}
        />
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          URL Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={episode?.slug}
          required
          disabled={loading}
          onChange={markDirty}
        />
        {fieldErrors.slug && (
          <p className="text-sm text-destructive">{fieldErrors.slug}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="published_at">發布日期（選填）</Label>
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
          onChange={markDirty}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="original_url">
          原始連結 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="original_url"
          name="original_url"
          type="url"
          defaultValue={episode?.original_url}
          required
          disabled={loading}
          onChange={markDirty}
        />
        {fieldErrors.original_url && (
          <p className="text-sm text-destructive">{fieldErrors.original_url}</p>
        )}
      </div>

      <ContentTabs
        episode={episode}
        loading={loading}
        markDirty={markDirty}
      />

      <div className="space-y-2">
        <Label>標籤（選填，最多 10 個）</Label>
        <TagPicker
          selectedTagIds={selectedTagIds}
          onChange={(ids) => {
            setSelectedTagIds(ids);
            markDirty();
          }}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_seconds">時長（秒）（選填）</Label>
        <Input
          id="duration_seconds"
          name="duration_seconds"
          type="number"
          defaultValue={episode?.duration_seconds ?? ""}
          disabled={loading}
          onChange={markDirty}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_published"
          name="is_published"
          defaultChecked={episode?.is_published ?? false}
          disabled={loading}
          className="h-4 w-4 rounded border-gray-300"
          onChange={markDirty}
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
          onClick={handleCancel}
          disabled={loading}
        >
          取消
        </Button>
      </div>
    </form >
  );
}

// ---------------------------------------------------------------------------
// Content Tabs — 四個長文欄位的 tab 編輯介面
// ---------------------------------------------------------------------------

const CONTENT_FIELDS = [
  { key: "ai_summary", label: "內容大綱", rows: 16 },
  { key: "ai_sponsorship", label: "業配資訊", rows: 12 },
  { key: "reflection", label: "站長聽後感", rows: 12 },
  { key: "transcript", label: "逐字稿", rows: 20 },
] as const;

type ContentFieldKey = (typeof CONTENT_FIELDS)[number]["key"];

function ContentTabs({
  episode,
  loading,
  markDirty,
}: {
  episode?: Episode;
  loading: boolean;
  markDirty: () => void;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validKeys = CONTENT_FIELDS.map((f) => f.key) as readonly string[];
  const defaultTab = (tabParam && validKeys.includes(tabParam) ? tabParam : "ai_summary") as ContentFieldKey;

  const [previewing, setPreviewing] = useState<ContentFieldKey | null>(null);
  const [values, setValues] = useState<Record<ContentFieldKey, string>>(() => ({
    ai_summary: episode?.ai_summary || "",
    ai_sponsorship: episode?.ai_sponsorship || "",
    reflection: episode?.reflection || "",
    transcript: episode?.transcript || "",
  }));

  const handleChange = (key: ContentFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full justify-start">
        {CONTENT_FIELDS.map((f) => (
          <TabsTrigger key={f.key} value={f.key}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {CONTENT_FIELDS.map((f) => (
        <TabsContent key={f.key} value={f.key} forceMount className="data-[state=inactive]:hidden">
          {/* hidden input so FormData always includes the value */}
          <input type="hidden" name={f.key} value={values[f.key]} />

          <div className="flex items-center justify-between mb-2">
            <Label>{f.label}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setPreviewing((cur) => (cur === f.key ? null : f.key))
              }
            >
              {previewing === f.key ? "關閉預覽" : "預覽"}
            </Button>
          </div>

          {previewing === f.key ? (
            <div className="grid grid-cols-2 gap-4">
              <Textarea
                value={values[f.key]}
                rows={f.rows}
                maxLength={
                  f.key === "ai_summary"
                    ? EPISODE_LONG_TEXT_MAX_LENGTH
                    : undefined
                }
                disabled={loading}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
              <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto rounded-md border border-input bg-white dark:bg-surface p-3 whitespace-pre-wrap">
                {values[f.key] || (
                  <span className="text-muted-foreground">（無內容）</span>
                )}
              </div>
            </div>
          ) : (
            <Textarea
              className="bg-white dark:bg-surface"
              value={values[f.key]}
              rows={f.rows}
              maxLength={
                f.key === "ai_summary"
                  ? EPISODE_LONG_TEXT_MAX_LENGTH
                  : undefined
              }
              disabled={loading}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          )}

          {values[f.key] && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {values[f.key].length.toLocaleString()} 字
            </p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
