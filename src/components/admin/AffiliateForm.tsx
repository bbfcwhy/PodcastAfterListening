"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AffiliateContent } from "@/types/database";
import { toast } from "sonner";

type FieldError = Record<string, string>;

interface AffiliateFormProps {
  affiliate?: AffiliateContent;
}

export function AffiliateForm({ affiliate }: AffiliateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [conflict, setConflict] = useState<{ current_updated_at: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: affiliate?.title ?? "",
    description: affiliate?.description ?? "",
    target_url: affiliate?.target_url ?? "",
    image_url: affiliate?.image_url ?? "",
    is_active: affiliate?.is_active ?? true,
  });

  const isEdit = !!affiliate;

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
      const url = affiliate
        ? `/api/affiliates/${affiliate.id}`
        : "/api/affiliates";
      const method = affiliate ? "PATCH" : "POST";
      const body: Record<string, unknown> = { ...formData };
      if (affiliate?.updated_at) body.updated_at = affiliate.updated_at;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setConflict({
          current_updated_at: data.current_updated_at ?? "",
        });
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
      toast.success(affiliate ? "已更新聯盟行銷內容" : "已建立聯盟行銷內容");
      if (!affiliate) {
        router.push("/affiliates");
        router.refresh();
      } else {
        router.refresh();
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving affiliate:", error);
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
    if (!affiliate) return;
    setConflict(null);
    const body = { ...formData };
    try {
      const res = await fetch(`/api/affiliates/${affiliate.id}`, {
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
    <Card>
      <CardHeader>
        <CardTitle>
          {affiliate ? "編輯聯盟行銷內容" : "新增聯盟行銷內容"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                onClick={() => router.push("/affiliates")}
              >
                返回列表
              </Button>
              <span>或繼續編輯下方內容。</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              標題 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                markDirty();
              }}
              required
              placeholder="聯盟行銷內容標題"
            />
            {fieldErrors.title && (
              <p className="text-sm text-destructive">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（選填）</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                markDirty();
              }}
              placeholder="聯盟行銷內容描述"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_url">
              目標連結 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="target_url"
              type="url"
              value={formData.target_url}
              onChange={(e) => {
                setFormData({ ...formData, target_url: e.target.value });
                markDirty();
              }}
              required
              placeholder="https://example.com"
            />
            {fieldErrors.target_url && (
              <p className="text-sm text-destructive">
                {fieldErrors.target_url}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">圖片 URL（選填）</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => {
                setFormData({ ...formData, image_url: e.target.value });
                markDirty();
              }}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, is_active: checked as boolean });
                markDirty();
              }}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              啟用此聯盟行銷內容
            </Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "處理中..."
                : affiliate
                  ? "更新"
                  : "建立"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
