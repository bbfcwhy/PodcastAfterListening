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
import { RefreshCw } from "lucide-react";

type FieldError = Record<string, string>;

// 欄位長度限制
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

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
  const [networkError, setNetworkError] = useState<string | null>(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setConflict(null);
    setNetworkError(null);

    // 前端欄位長度驗證
    if (formData.name.length > MAX_NAME_LENGTH) {
      setFieldErrors({ name: `名稱不可超過 ${MAX_NAME_LENGTH} 字元` });
      setIsSubmitting(false);
      return;
    }
    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      setFieldErrors({ description: `描述不可超過 ${MAX_DESCRIPTION_LENGTH} 字元` });
      setIsSubmitting(false);
      return;
    }

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
      // 判斷錯誤類型，提供友善提示
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setNetworkError("網路連線錯誤，請檢查網路後重試");
      } else {
        setNetworkError("伺服器錯誤，請稍後再試");
      }
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setNetworkError(null);
    handleSubmit();
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

          {networkError && (
            <div
              className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400 space-y-2"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-medium">{networkError}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重試
              </Button>
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
              <span className="text-text-secondary text-xs ml-2">
                ({formData.name.length}/{MAX_NAME_LENGTH})
              </span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                markDirty();
              }}
              required
              maxLength={MAX_NAME_LENGTH}
              placeholder="節目名稱"
              className="bg-surface border-border-subtle"
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-sm text-warn" role="alert">
                {fieldErrors.name}
              </p>
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
              aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
              aria-invalid={!!fieldErrors.slug}
            />
            {fieldErrors.slug && (
              <p id="slug-error" className="text-sm text-warn" role="alert">
                {fieldErrors.slug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">
              描述（選填）
              <span className="text-text-secondary text-xs ml-2">
                ({formData.description.length}/{MAX_DESCRIPTION_LENGTH})
              </span>
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
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="bg-surface border-border-subtle"
              aria-describedby={fieldErrors.description ? "description-error" : undefined}
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && (
              <p id="description-error" className="text-sm text-warn" role="alert">
                {fieldErrors.description}
              </p>
            )}
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
