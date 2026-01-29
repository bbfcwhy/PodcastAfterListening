import Image from "next/image";
import { MainLayout } from "@/components/layout/MainLayout";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { EmptyState } from "@/components/ui/EmptyState";
import { getShowBySlug, getShowWithEpisodeCount } from "@/lib/services/shows";
import { getEpisodesByShow } from "@/lib/services/episodes";
import { notFound } from "next/navigation";
import { Calendar, Podcast } from "lucide-react";
import type { Metadata } from "next";

interface ShowPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ShowPageProps): Promise<Metadata> {
  const { slug } = await params;
  const show = await getShowBySlug(slug);

  if (!show) {
    return {
      title: "節目不存在",
    };
  }

  return {
    title: `${show.name} - Podcast 聽了以後`,
    description: show.description || undefined,
    openGraph: {
      title: show.name,
      description: show.description || undefined,
      images: show.cover_image_url ? [show.cover_image_url] : undefined,
    },
  };
}

export const revalidate = 3600; // ISR: revalidate every hour

export default async function ShowPage({ params }: ShowPageProps) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);

  if (!show) {
    notFound();
  }

  const [episodes, episodeCount] = await Promise.all([
    getEpisodesByShow(show.id),
    getShowWithEpisodeCount(show.id),
  ]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-12 md:py-16 px-4 md:px-10">
        {/* Show Header */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-16 md:mb-24 items-center md:items-start bg-surface p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-border-subtle">
          <div className="relative shrink-0">
            {show.cover_image_url ? (
              <Image
                src={show.cover_image_url}
                alt={show.name}
                width={288}
                height={288}
                className="w-48 h-48 md:w-72 md:h-72 rounded-[2rem] md:rounded-[3rem] shadow-sm relative z-10 object-cover"
              />
            ) : (
              <div className="w-48 h-48 md:w-72 md:h-72 rounded-[2rem] md:rounded-[3rem] shadow-sm relative z-10 bg-canvas flex items-center justify-center">
                <Podcast className="text-cta" size={80} />
              </div>
            )}
            <div className="absolute -inset-4 bg-cta/10 rounded-[2.5rem] md:rounded-[3.5rem] blur-2xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight text-text-primary">
              {show.name}
            </h1>
            {show.description && (
              <p className="text-lg md:text-xl text-text-secondary mb-6 md:mb-10 max-w-2xl leading-relaxed font-medium">
                {show.description}
              </p>
            )}
            <p className="text-sm text-text-secondary font-bold">
              共 {episodeCount} 集節目
            </p>
          </div>
        </div>

        {/* Episodes Section */}
        {episodes.length === 0 ? (
          <EmptyState
            title="尚無單集"
            description="這個節目目前還沒有任何已發布的單集。"
          />
        ) : (
          <section>
            <h3 className="text-2xl md:text-3xl font-black mb-8 md:mb-12 text-text-primary flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-cta/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Calendar className="text-cta" size={24} />
              </div>
              最新單集
            </h3>
            <EpisodeList episodes={episodes} shows={[show]} hideSectionTitle />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
