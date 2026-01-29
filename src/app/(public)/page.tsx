import { MainLayout } from "@/components/layout/MainLayout";
import { ShowGrid } from "@/components/shows/ShowGrid";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { EmptyState } from "@/components/ui/EmptyState";
import { getShows } from "@/lib/services/shows";
import { getLatestEpisodes } from "@/lib/services/episodes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcast 聽後回顧網站",
  description: "分享 Podcast 節目的個人心得與 AI 解析內容",
  openGraph: {
    title: "Podcast 聽後回顧網站",
    description: "分享 Podcast 節目的個人心得與 AI 解析內容",
    type: "website",
  },
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [shows, episodes] = await Promise.all([
    getShows(),
    getLatestEpisodes(12),
  ]);

  // Get shows for episodes to display show names
  const showMap = new Map(shows.map((show) => [show.id, show]));
  const episodesWithShows = episodes.map((episode) => ({
    episode,
    show: showMap.get(episode.show_id),
  }));

  const hasContent = shows.length > 0 || episodes.length > 0;

  return (
    <MainLayout>
      {!hasContent ? (
        <EmptyState
          title="尚無內容"
          description="目前還沒有任何節目或單集，請稍後再來。"
        />
      ) : (
        <div className="space-y-12">
          {episodes.length > 0 && (
            <EpisodeList episodes={episodes} shows={shows} />
          )}
          {shows.length > 0 && <ShowGrid shows={shows} />}
        </div>
      )}
    </MainLayout>
  );
}
