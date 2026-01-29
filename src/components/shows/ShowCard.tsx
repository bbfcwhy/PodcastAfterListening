import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Show } from "@/types/database";

interface ShowCardProps {
  show: Show;
  episodeCount?: number;
}

export function ShowCard({ show, episodeCount }: ShowCardProps) {
  return (
    <Link href={`/shows/${show.slug}`}>
      <Card className="hover:shadow-lg transition-shadow">
        {show.cover_image_url && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={show.cover_image_url}
              alt={show.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{show.name}</CardTitle>
          {show.description && (
            <CardDescription className="line-clamp-2">
              {show.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {episodeCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {episodeCount} 集節目
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
