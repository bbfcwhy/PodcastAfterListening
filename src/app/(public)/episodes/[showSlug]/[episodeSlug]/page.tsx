import Link from "next/link";
import Image from "next/image";
import { MainLayout } from "@/components/layout/MainLayout";
import { EpisodeSummary } from "@/components/episodes/EpisodeSummary";
import { SponsorshipSection } from "@/components/episodes/SponsorshipSection";
import { OwnerNotes } from "@/components/episodes/OwnerNotes";
import { TranscriptSection } from "@/components/episodes/TranscriptSection";
import { OriginalLinkButton } from "@/components/episodes/OriginalLinkButton";
import { HostCard } from "@/components/hosts/HostCard";
import { CommentSection } from "@/components/comments/CommentSection";
import { AffiliateSection } from "@/components/affiliates/AffiliateSection";
import { getEpisodeDetail } from "@/lib/services/episodes";
import { getCommentsByEpisode } from "@/lib/services/comments";
import { getAffiliatesByEpisode } from "@/lib/services/affiliates";
import { stripHtml } from "@/lib/utils/sanitize";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Podcast } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    description: episode.ai_summary || episode.reflection || undefined,
    openGraph: {
      title: episode.title,
      description: episode.ai_summary || episode.reflection || undefined,
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
    description: episode.ai_summary || episode.reflection || undefined,
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
        {/* 節目區塊 */}
        <div className="rounded-[2.5rem] border border-border-subtle bg-surface p-6 md:p-8 shadow-sm">
          <Link
            href={`/shows/${show.slug}`}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center group"
          >
            <div className="relative shrink-0">
              {show.cover_image_url ? (
                <Image
                  src={show.cover_image_url}
                  alt={show.name}
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.2rem] object-cover"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.2rem] bg-cta/10 flex items-center justify-center">
                  <Podcast className="text-cta" size={32} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground mb-1">所屬節目</p>
              <h2 className="text-xl font-bold text-text-primary group-hover:underline">
                {show.name}
              </h2>
              {show.description && (
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                  {stripHtml(show.description)}
                </p>
              )}
              {show.hosting_provided_by && (
                <p className="text-xs text-muted-foreground mt-1">
                  Hosting provided by {show.hosting_provided_by}
                </p>
              )}
              {show.show_categories && show.show_categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {show.show_categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-0.5 rounded bg-cta/10 text-cta"
                    >
                      #{cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
          {hosts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-sm font-medium text-text-secondary mb-2">主持人</p>
              <div className="flex flex-wrap gap-2">
                {hosts.map((h) => (
                  <span key={h.id} className="text-sm text-text-primary">
                    {h.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

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

        {/* 單集說明（節目自己填的說明） */}
        {episode.description ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">單集說明</h2>
            <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
              {stripHtml(episode.description)}
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">本集無單集說明</div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-surface border border-border-subtle p-1 h-auto rounded-[2rem]">
            <TabsTrigger
              value="summary"
              className="rounded-[1.5rem] py-3 text-sm md:text-base font-bold data-[state=active]:bg-cta data-[state=active]:text-white transition-all"
            >
              內容大綱
            </TabsTrigger>
            <TabsTrigger
              value="sponsorship"
              className="rounded-[1.5rem] py-3 text-sm md:text-base font-bold data-[state=active]:bg-cta data-[state=active]:text-white transition-all"
            >
              業配資訊
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className="rounded-[1.5rem] py-3 text-sm md:text-base font-bold data-[state=active]:bg-cta data-[state=active]:text-white transition-all"
            >
              站長聽後感
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6 animate-in fade-in-50 duration-300">
            {episode.ai_summary ? (
              <EpisodeSummary summary={episode.ai_summary} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-surface rounded-[2.5rem] border border-border-subtle">
                <p className="font-medium">內容準備中</p>
                <p className="text-sm mt-2">AI 摘要尚未生成</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sponsorship" className="space-y-6 animate-in fade-in-50 duration-300">
            {episode.ai_sponsorship ? (
              <SponsorshipSection sponsorship={episode.ai_sponsorship} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-surface rounded-[2.5rem] border border-border-subtle">
                <p className="font-medium">本集無業配資訊</p>
                <p className="text-sm mt-2">或 AI 尚未擷取相關內容</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reflection" className="space-y-6 animate-in fade-in-50 duration-300">
            {episode.reflection ? (
              <OwnerNotes notes={episode.reflection} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-surface rounded-[2.5rem] border border-border-subtle">
                <p className="font-medium">站長還沒聽</p>
                <p className="text-sm mt-2">敬請期待心得分享</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Transcript Section */}
        <TranscriptSection transcript={episode.transcript} />

        {/* Affiliate Section */}
        <AffiliateSection affiliates={affiliates} episodeId={episode.id} />

        {/* Comments Section */}
        <CommentSection episodeId={episode.id} initialComments={initialComments} />
      </article>
    </MainLayout>
  );
}
