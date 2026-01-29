import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { EpisodeSummary } from "@/components/episodes/EpisodeSummary";
import { SponsorshipSection } from "@/components/episodes/SponsorshipSection";
import { OwnerNotes } from "@/components/episodes/OwnerNotes";
import { OriginalLinkButton } from "@/components/episodes/OriginalLinkButton";
import { HostCard } from "@/components/hosts/HostCard";
import { CommentSection } from "@/components/comments/CommentSection";
import { AffiliateSection } from "@/components/affiliates/AffiliateSection";
import { getEpisodeDetail } from "@/lib/services/episodes";
import { getCommentsByEpisode } from "@/lib/services/comments";
import { getAffiliatesByEpisode } from "@/lib/services/affiliates";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import type { Metadata } from "next";

interface EpisodePageProps {
  params: Promise<{ showSlug: string; episodeSlug: string }>;
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { showSlug, episodeSlug } = await params;
  const data = await getEpisodeDetail(showSlug, episodeSlug);

  if (!data) {
    return {
      title: "單集不存在",
    };
  }

  const { episode, show } = data;

  return {
    title: `${episode.title} - ${show.name}`,
    description: episode.ai_summary || episode.host_notes || undefined,
    openGraph: {
      title: episode.title,
      description: episode.ai_summary || episode.host_notes || undefined,
      type: "article",
      publishedTime: episode.published_at || undefined,
    },
  };
}

export const revalidate = 3600; // ISR: revalidate every hour

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { showSlug, episodeSlug } = await params;
  const data = await getEpisodeDetail(showSlug, episodeSlug);

  if (!data) {
    notFound();
  }

  const { episode, show, hosts, tags } = data;

  // Fetch initial comments
  const initialComments = await getCommentsByEpisode(episode.id);

  // Fetch affiliates
  const affiliates = await getAffiliatesByEpisode(episode.id);

  const publishedDate = episode.published_at
    ? format(new Date(episode.published_at), "yyyy年MM月dd日", { locale: zhTW })
    : null;

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.ai_summary || episode.host_notes || undefined,
    datePublished: episode.published_at || undefined,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/episodes/${showSlug}/${episodeSlug}`,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: show.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shows/${show.slug}`,
    },
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <Link
              href={`/shows/${show.slug}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {show.name}
            </Link>
          </div>
          <h1 className="text-4xl font-bold">{episode.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {publishedDate && <span>發布日期：{publishedDate}</span>}
            {tags.length > 0 && (
              <div className="flex gap-2">
                {tags.map((tag) => (
                  <span key={tag.id} className="text-xs">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <OriginalLinkButton url={episode.original_url} />
        </div>

        {/* Hosts */}
        {hosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">主持人</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hosts.map((host) => (
                <HostCard
                  key={host.id}
                  name={host.name}
                  bio={host.bio}
                  avatarUrl={host.avatar_url}
                />
              ))}
            </div>
          </div>
        )}

        {/* Episode Summary */}
        {episode.ai_summary ? (
          <EpisodeSummary summary={episode.ai_summary} />
        ) : (
          <div className="text-muted-foreground">內容準備中</div>
        )}

        {/* Sponsorship */}
        {episode.ai_sponsorship ? (
          <SponsorshipSection sponsorship={episode.ai_sponsorship} />
        ) : (
          <div className="text-muted-foreground">內容準備中</div>
        )}

        {/* Owner Notes */}
        <OwnerNotes notes={episode.host_notes} />

        {/* Affiliate Section */}
        <AffiliateSection affiliates={affiliates} episodeId={episode.id} />

        {/* Comments Section */}
        <CommentSection episodeId={episode.id} initialComments={initialComments} />
      </article>
    </MainLayout>
  );
}
