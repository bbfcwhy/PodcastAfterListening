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
import { Show, Tag } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFiltersProps {
  shows: Show[];
  tags: Tag[];
}

export function SearchFilters({ shows, tags }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">篩選條件</h3>

      <div className="space-y-2">
        <Label htmlFor="show">節目系列</Label>
        <Select
          value={searchParams.get("show") || ""}
          onValueChange={(value) => handleFilterChange("show", value)}
        >
          <SelectTrigger id="show">
            <SelectValue placeholder="全部節目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部節目</SelectItem>
            {shows.map((show) => (
              <SelectItem key={show.id} value={show.id}>
                {show.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fromDate">開始日期</Label>
        <Input
          id="fromDate"
          type="date"
          value={searchParams.get("fromDate") || ""}
          onChange={(e) => handleFilterChange("fromDate", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toDate">結束日期</Label>
        <Input
          id="toDate"
          type="date"
          value={searchParams.get("toDate") || ""}
          onChange={(e) => handleFilterChange("toDate", e.target.value)}
        />
      </div>

      <Button
        variant="outline"
        onClick={() => router.push("/search")}
        className="w-full"
      >
        清除篩選
      </Button>
    </div>
  );
}
