import { MainLayout } from "@/components/layout/MainLayout";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { EmptyState } from "@/components/ui/EmptyState";
import { getShowBySlug, getShowWithEpisodeCount } from "@/lib/services/shows";
import { getEpisodesByShow } from "@/lib/services/episodes";
import { notFound } from "next/navigation";
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
    title: `${show.name} - Podcast 聽後回顧`,
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">{show.name}</h1>
          {show.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {show.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            共 {episodeCount} 集節目
          </p>
        </div>

        {episodes.length === 0 ? (
          <EmptyState
            title="尚無單集"
            description="這個節目目前還沒有任何已發布的單集。"
          />
        ) : (
          <EpisodeList episodes={episodes} shows={[show]} />
        )}
      </div>
    </MainLayout>
  );
}
