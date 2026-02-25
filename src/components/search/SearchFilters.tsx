"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Show, Tag } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFiltersProps {
  shows: Show[];
  tags: Tag[];
}

export function SearchFilters({ shows, tags }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // "all" 代表清除該篩選條件
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  const toggleTag = (tagId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("tags")?.split(",").filter(Boolean) || [];

    let updated: string[];
    if (current.includes(tagId)) {
      updated = current.filter((id) => id !== tagId);
    } else {
      updated = [...current, tagId];
    }

    if (updated.length > 0) {
      params.set("tags", updated.join(","));
    } else {
      params.delete("tags");
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-5 p-6 bg-surface border border-border-subtle rounded-[2rem] sticky top-24">
      <h3 className="font-black text-text-primary text-lg">篩選條件</h3>

      <div className="space-y-2">
        <Label htmlFor="show" className="text-text-secondary text-sm font-bold">節目系列</Label>
        <Select
          value={searchParams.get("show") || "all"}
          onValueChange={(value) => handleFilterChange("show", value)}
        >
          <SelectTrigger id="show">
            <SelectValue placeholder="全部節目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部節目</SelectItem>
            {shows.map((show) => (
              <SelectItem key={show.id} value={show.id}>
                {show.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-text-secondary text-sm font-bold">標籤</Label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {tag.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fromDate" className="text-text-secondary text-sm font-bold">開始日期</Label>
        <Input
          id="fromDate"
          type="date"
          value={searchParams.get("fromDate") || ""}
          onChange={(e) => handleFilterChange("fromDate", e.target.value)}
          className="bg-canvas/20 border-border-subtle rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toDate" className="text-text-secondary text-sm font-bold">結束日期</Label>
        <Input
          id="toDate"
          type="date"
          value={searchParams.get("toDate") || ""}
          onChange={(e) => handleFilterChange("toDate", e.target.value)}
          className="bg-canvas/20 border-border-subtle rounded-xl"
        />
      </div>

      <Button
        variant="outline"
        onClick={() => router.push("/search")}
        className="w-full rounded-xl"
      >
        清除篩選
      </Button>
    </div>
  );
}
