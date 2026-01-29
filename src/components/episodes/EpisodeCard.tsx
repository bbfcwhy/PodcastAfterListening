import Link from "next/link";
import Image from "next/image";
import { Episode, Show } from "@/types/database";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { ChevronRight, Podcast } from "lucide-react";

interface EpisodeCardProps {
  episode: Episode;
  show?: Show;
}

export function EpisodeCard({ episode, show }: EpisodeCardProps) {
  const publishedDate = episode.published_at
    ? format(new Date(episode.published_at), "yyyy年MM月dd日", { locale: zhTW })
    : null;

  return (
    <Link
      href={`/episodes/${show?.slug || "unknown"}/${episode.slug}`}
      className="group bg-surface rounded-[2.5rem] p-8 border border-border-subtle hover:border-cta/40 transition-all hover:-translate-y-2 shadow-sm hover:shadow-md flex flex-col h-full"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-1 bg-surface-muted rounded-xl overflow-hidden shadow-sm shrink-0">
          {show?.cover_image_url ? (
            <Image
              src={show.cover_image_url}
              alt={show.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-canvas flex items-center justify-center">
              <Podcast className="text-cta" size={24} />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          {show && (
            <span className="text-[10px] font-black text-cta uppercase tracking-widest truncate">
              {show.name}
            </span>
          )}
          {publishedDate && (
            <span className="text-[10px] font-bold text-text-secondary">
              {publishedDate}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-xl font-black text-text-primary group-hover:text-cta transition-colors mb-4 leading-tight line-clamp-2">
        {episode.title}
      </h3>
      {episode.ai_summary && (
        <p className="text-sm text-text-secondary line-clamp-2 mb-8 flex-grow leading-relaxed font-medium">
          {episode.ai_summary}
        </p>
      )}
      <div className="flex items-center justify-between pt-6 border-t border-border-subtle mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-text-primary uppercase tracking-tighter bg-cta/20 px-3 py-1.5 rounded-full">
            AI 解析
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center text-cta group-hover:bg-cta group-hover:text-text-primary transition-all">
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
}
