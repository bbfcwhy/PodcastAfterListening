"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Show } from "@/types/database";
import { Logo } from "@/components/ui/Logo";
import {
  Library,
  Clock,
  LayoutGrid,
  Hash
} from "lucide-react";

interface SidebarProps {
  shows: (Show & { episode_count?: number })[];
  className?: string;
}

export function SidebarContent({ shows }: { shows: (Show & { episode_count?: number })[] }) {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <div className="mb-8">
        <Logo href="/" size="md" />
      </div>

      <nav className="space-y-8">
        <div>
          <div className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-4 pl-3">
            Menu
          </div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                  pathname === "/"
                    ? "bg-selected text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-hover"
                )}
              >
                <LayoutGrid size={18} />
                <span>Discover</span>
              </Link>
            </li>
            <li>
              <Link
                href="/recent"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                  pathname === "/recent"
                    ? "bg-selected text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-hover"
                )}
              >
                <Clock size={18} />
                <span>Recent</span>
              </Link>
            </li>
            <li>
              <Link
                href="/library"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                  pathname === "/library"
                    ? "bg-selected text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-hover"
                )}
              >
                <Library size={18} />
                <span>Library</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-4 pl-3">
            Channels
          </div>
          <ul className="space-y-1">
            {shows.map((show) => (
              <li key={show.id}>
                <Link
                  href={`/shows/${show.slug}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                    pathname === `/shows/${show.slug}`
                      ? "bg-selected text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-hover"
                  )}
                >
                  <div className="w-5 h-5 rounded overflow-hidden shrink-0 bg-surface-highlight">
                    {show.cover_image_url ? (
                      <img
                        src={show.cover_image_url}
                        alt={show.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cta/20 flex items-center justify-center text-[8px] font-black text-cta">
                        {show.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <span className="truncate">{show.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-4 pl-3">
            Tags
          </div>
          <ul className="space-y-1">
            {/* Categories can be dynamically loaded here later */}
            <li>
              <Link
                href="/tags/tech"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
              >
                <Hash size={18} />
                <span>Tech</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export function Sidebar({ shows, className }: SidebarProps) {
  return (
    <aside className={cn(
      "w-72 bg-surface border-r border-border-subtle h-screen fixed left-0 top-0 overflow-y-auto hidden lg:block",
      className
    )}>
      <SidebarContent shows={shows} />
    </aside>
  );
}
