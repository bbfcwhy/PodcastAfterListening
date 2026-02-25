"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewTagPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(value.trim());
    }
    setFieldErrors((prev) => ({ ...prev, name: "" }));
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugManuallyEdited(true);
    setFieldErrors((prev) => ({ ...prev, slug: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: "標籤名稱為必填" });
      return;
    }

    if (!slug.trim()) {
      setFieldErrors({ slug: "Slug 為必填" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });

      const data = await res.json();

      if (res.status === 409 || res.status === 400) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "建立標籤失敗");
        return;
      }

      toast.success(`已建立標籤「${name.trim()}」`);
      router.push("/tags");
      router.refresh();
    } catch {
      toast.error("建立標籤失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">新增標籤</h1>
        <p className="text-sm text-text-secondary mt-1">
          建立新的標籤用於分類內容
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名稱 *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="例如：科技"
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <p className="text-sm text-destructive">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="例如：科技"
          />
          <p className="text-xs text-text-secondary">
            用於 URL 路徑，預設與名稱相同，可自行修改
          </p>
          {fieldErrors.slug && (
            <p className="text-sm text-destructive">{fieldErrors.slug}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "建立中..." : "建立標籤"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tags">取消</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
