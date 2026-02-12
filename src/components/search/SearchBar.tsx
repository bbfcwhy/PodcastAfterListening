"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

export function SearchBar({ initialQuery = "", className }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary"
        size={18}
      />
      <input
        type="search"
        placeholder="搜尋感興趣的內容..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-surface border border-border-subtle rounded-[2.5rem] py-4 pl-14 pr-6 focus:ring-2 focus:ring-cta/20 outline-none text-sm transition-all shadow-sm placeholder:text-text-secondary text-text-primary"
      />
    </form>
  );
}
