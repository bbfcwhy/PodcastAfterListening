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
import type { Show, Tag } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFiltersProps {
  shows: Show[];
  tags: Tag[];
}

export function SearchFilters({ shows, tags: _tags }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
