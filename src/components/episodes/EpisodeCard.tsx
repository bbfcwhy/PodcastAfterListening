import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Episode, Show } from "@/types/database";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface EpisodeCardProps {
  episode: Episode;
  show?: Show;
}

export function EpisodeCard({ episode, show }: EpisodeCardProps) {
  const publishedDate = episode.published_at
    ? format(new Date(episode.published_at), "yyyy年MM月dd日", { locale: zhTW })
    : null;

  return (
    <Link href={`/episodes/${show?.slug || "unknown"}/${episode.slug}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-2">{episode.title}</CardTitle>
          {show && (
            <CardDescription>{show.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {publishedDate && (
            <p className="text-sm text-muted-foreground">
              發布日期：{publishedDate}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
