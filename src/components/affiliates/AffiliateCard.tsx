import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

// Note: For Next.js Image optimization, you may need to configure
// images.remotePatterns in next.config.js for external image URLs

interface AffiliateCardProps {
  id: string;
  title: string;
  description: string | null;
  targetUrl: string;
  imageUrl: string | null;
  episodeId: string;
}

export function AffiliateCard({
  id,
  title,
  description,
  targetUrl,
  imageUrl,
  episodeId,
}: AffiliateCardProps) {
  const trackingUrl = `/api/affiliate/redirect/${id}?episodeId=${episodeId}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">推廣</Badge>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      {imageUrl && (
        <div className="relative w-full h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="pt-4">
        <Button asChild className="w-full">
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
            查看詳情
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
