"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [tag, setTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchTag() {
      try {
        const res = await fetch("/api/admin/tags");
        if (res.ok) {
          const tags: Tag[] = await res.json();
          const found = tags.find((t) => t.id === id);
          if (found) {
            setTag(found);
            setName(found.name);
            setSlug(found.slug);
          }
        }
      } catch {
        toast.error("載入標籤失敗");
      } finally {
        setLoading(false);
      }
    }
    fetchTag();
  }, [id]);

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
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "PATCH",
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

      if (res.status === 404) {
        toast.error("標籤不存在");
        router.push("/tags");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "更新標籤失敗");
        return;
      }

      toast.success(`已更新標籤「${name.trim()}」`);
      router.push("/tags");
      router.refresh();
    } catch {
      toast.error("更新標籤失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-text-secondary">載入中...</div>;
  }

  if (!tag) {
    return (
      <div className="text-center py-20 text-text-secondary">
        <p className="text-lg font-bold mb-4">找不到此標籤</p>
        <Button asChild>
          <Link href="/tags">返回標籤列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">編輯標籤</h1>
        <p className="text-sm text-text-secondary mt-1">
          修改標籤「{tag.name}」的資訊
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名稱 *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
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
            onChange={(e) => {
              setSlug(e.target.value);
              setFieldErrors((prev) => ({ ...prev, slug: "" }));
            }}
            placeholder="例如：科技"
          />
          <p className="text-xs text-text-secondary">
            用於 URL 路徑
          </p>
          {fieldErrors.slug && (
            <p className="text-sm text-destructive">{fieldErrors.slug}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "儲存中..." : "儲存變更"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tags">取消</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
