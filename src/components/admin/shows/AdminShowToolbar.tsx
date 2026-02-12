"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

interface AdminShowToolbarProps {
    categories?: string[];
}

export function AdminShowToolbar({ categories = [] }: AdminShowToolbarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        params.set("page", "1"); // Reset to page 1 on search
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1"); // Reset to page 1
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("sort", value);
        } else {
            params.delete("sort");
        }
        // No need to reset page on sort change usually, but user might prefer seeing top
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handlePerPageChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("perPage", value);
        }
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-end sm:items-center">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
                    <Input
                        placeholder="搜尋節目名稱..."
                        className="pl-9"
                        defaultValue={searchParams.get("search")?.toString()}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                {categories.length > 0 && (
                    <Select
                        defaultValue={searchParams.get("category")?.toString() || "all"}
                        onValueChange={(val) => handleFilterChange("category", val)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="所有分類" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">所有分類</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
                <Select
                    defaultValue={searchParams.get("sort")?.toString() || "custom"}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="custom">自訂順序 (Custom)</SelectItem>
                        <SelectItem value="created_desc">建立時間 (新→舊)</SelectItem>
                        <SelectItem value="created_asc">建立時間 (舊→新)</SelectItem>
                        <SelectItem value="name_asc">名稱 (A→Z)</SelectItem>
                        <SelectItem value="name_desc">名稱 (Z→A)</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    defaultValue={searchParams.get("perPage")?.toString() || "10"}
                    onValueChange={handlePerPageChange}
                >
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="每頁" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 筆</SelectItem>
                        <SelectItem value="20">20 筆</SelectItem>
                        <SelectItem value="50">50 筆</SelectItem>
                        <SelectItem value="100">100 筆</SelectItem>
                        <SelectItem value="1000">顯示全部</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
