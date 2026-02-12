import Link from "next/link";
import Image from "next/image";
import { Show } from "@/types/database";
import { ChevronRight, Podcast } from "lucide-react";
import { stripHtml } from "@/lib/utils/sanitize";

interface ShowCardProps {
  show: Show;
  episodeCount?: number;
}

export function ShowCard({ show, episodeCount }: ShowCardProps) {
  return (
    <div className="group bg-surface rounded-[2.5rem] overflow-hidden border border-border-subtle hover:border-cta/30 transition-all hover:shadow-md shadow-sm">
      <div className="aspect-[4/5] relative overflow-hidden">
        {show.cover_image_url ? (
          <Image
            src={show.cover_image_url}
            alt={show.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-canvas flex items-center justify-center">
            <Podcast className="text-cta" size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-text-primary/90 via-text-primary/30 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <h3 className="text-3xl md:text-4xl font-black text-surface">{show.name}</h3>
        </div>
      </div>
      <div className="p-8 md:p-12 pt-6 md:pt-8">
        {show.description && (
          <p className="text-text-secondary text-sm mb-8 md:mb-10 line-clamp-2 leading-relaxed font-bold">
            {stripHtml(show.description)}
          </p>
        )}
        {episodeCount !== undefined && (
          <p className="text-text-secondary text-xs mb-6 font-bold">
            {episodeCount} 集節目
          </p>
        )}
        <Link
          href={`/shows/${show.slug}`}
          className="flex items-center justify-center gap-3 w-full py-5 bg-canvas rounded-[1.5rem] text-[11px] font-black text-text-primary uppercase tracking-widest hover:bg-cta hover:text-text-primary transition-all"
        >
          進入節目列表 <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
