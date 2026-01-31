"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Show } from "@/types/database";
import { toast } from "sonner";

type FieldError = Record<string, string>;

interface ShowFormProps {
  show?: Show;
}

export function ShowForm({ show }: ShowFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [conflict, setConflict] = useState<{ current_updated_at: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: show?.name ?? "",
    slug: show?.slug ?? "",
    description: show?.description ?? "",
    cover_image_url: show?.cover_image_url ?? "",
    original_url: show?.original_url ?? "",
  });

  const isEdit = !!show;

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setConflict(null);

    try {
      const url = show ? `/api/admin/shows/${show.id}` : "/api/admin/shows";
      const method = show ? "PATCH" : "POST";
      const body: Record<string, unknown> = { ...formData };
      if (show?.updated_at) body.updated_at = show.updated_at;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        if (data.current_updated_at) {
          setConflict({
            current_updated_at: data.current_updated_at,
          });
        } else {
          setFieldErrors({ slug: data.error || "slug 已被使用" });
        }
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 400 && data.field) {
          setFieldErrors({ [data.field]: data.error || "驗證失敗" });
        } else {
          toast.error(data.error || "操作失敗");
        }
        setIsSubmitting(false);
        return;
      }

      setDirty(false);
      setSaveSuccess(true);
      toast.success(show ? "已更新節目資訊" : "已建立節目");
      if (!show) {
        router.push("/shows");
        router.refresh();
      } else {
        router.refresh();
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving show:", error);
      toast.error(
        error instanceof Error ? error.message : "操作失敗，請稍後再試"
      );
      setIsSubmitting(false);
    }
  };

  const handleConflictReload = () => {
    setConflict(null);
    router.refresh();
  };

  const handleConflictOverwrite = async () => {
    if (!show) return;
    setConflict(null);
    const body = { ...formData };
    try {
      const res = await fetch(`/api/admin/shows/${show.id}`, {
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
      setIsSubmitting(false);
    }
  };

  const handleConflictDismiss = () => {
    setConflict(null);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    if (dirty && !confirm("有未儲存的變更，確定要離開嗎？")) return;
    router.back();
  };

  return (
    <Card className="bg-surface border-border-subtle">
      <CardHeader>
        <CardTitle className="text-text-primary">
          {show ? "編輯節目" : "新增節目"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {conflict && (
            <div
              className="rounded-md border border-warn/50 bg-warn/10 px-4 py-3 text-sm text-warn space-y-2"
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
                onClick={() => router.push("/shows")}
              >
                返回列表
              </Button>
              <span>或繼續編輯下方內容。</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-text-primary">
              節目名稱 <span className="text-warn">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                markDirty();
              }}
              required
              placeholder="節目名稱"
              className="bg-surface border-border-subtle"
            />
            {fieldErrors.name && (
              <p className="text-sm text-warn">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-text-primary">
              URL Slug <span className="text-warn">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value.toLowerCase() });
                markDirty();
              }}
              required
              placeholder="show-slug（小寫英文、數字、連字號）"
              pattern="[a-z0-9-]+"
              className="bg-surface border-border-subtle"
            />
            {fieldErrors.slug && (
              <p className="text-sm text-warn">{fieldErrors.slug}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">
              描述（選填）
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                markDirty();
              }}
              placeholder="節目描述"
              rows={4}
              maxLength={2000}
              className="bg-surface border-border-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url" className="text-text-primary">
              封面圖片 URL（選填）
            </Label>
            <Input
              id="cover_image_url"
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => {
                setFormData({ ...formData, cover_image_url: e.target.value });
                markDirty();
              }}
              placeholder="https://example.com/cover.jpg"
              className="bg-surface border-border-subtle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="original_url" className="text-text-primary">
              原始連結（選填）
            </Label>
            <Input
              id="original_url"
              type="url"
              value={formData.original_url}
              onChange={(e) => {
                setFormData({ ...formData, original_url: e.target.value });
                markDirty();
              }}
              placeholder="https://podcasts.apple.com/..."
              className="bg-surface border-border-subtle"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cta text-text-primary hover:bg-cta/90"
            >
              {isSubmitting ? "處理中..." : show ? "更新" : "建立"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-border-subtle"
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
