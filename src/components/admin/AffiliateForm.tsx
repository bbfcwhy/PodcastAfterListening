"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateContent } from "@/types/database";
import { toast } from "sonner";

interface AffiliateFormProps {
  affiliate?: AffiliateContent;
}

export function AffiliateForm({ affiliate }: AffiliateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: affiliate?.title || "",
    description: affiliate?.description || "",
    target_url: affiliate?.target_url || "",
    image_url: affiliate?.image_url || "",
    is_active: affiliate?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = affiliate
        ? `/api/admin/affiliates/${affiliate.id}`
        : "/api/admin/affiliates";
      const method = affiliate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "操作失敗");
      }

      toast.success(affiliate ? "已更新聯盟行銷內容" : "已建立聯盟行銷內容");
      router.push("/admin/affiliates");
      router.refresh();
    } catch (error) {
      console.error("Error saving affiliate:", error);
      toast.error(
        error instanceof Error ? error.message : "操作失敗，請稍後再試"
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="space-y-2">
            <Label htmlFor="title">標題 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="聯盟行銷內容標題"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="聯盟行銷內容描述"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_url">目標連結 *</Label>
            <Input
              id="target_url"
              type="url"
              value={formData.target_url}
              onChange={(e) =>
                setFormData({ ...formData, target_url: e.target.value })
              }
              required
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">圖片 URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked as boolean })
              }
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
              onClick={() => router.back()}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
