import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { HomeHero } from "@/components/home/HomeHero";
import { ShowGrid } from "@/components/shows/ShowGrid";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { EmptyState } from "@/components/ui/EmptyState";
import { getShows } from "@/lib/services/shows";
import { getLatestEpisodes } from "@/lib/services/episodes";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcast After Listening | Podcast 聽了以後",
  description: "記下那些改變我的，也找回那些你聽過的 - 個人 Podcast 筆記與回顧網站",
  openGraph: {
    title: "Podcast After Listening | Podcast 聽了以後",
    description: "記下那些改變我的，也找回那些你聽過的 - 個人 Podcast 筆記與回顧網站",
    type: "website",
  },
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [shows, episodes] = await Promise.all([
    getShows(),
    getLatestEpisodes(12),
  ]);

  const hasContent = shows.length > 0 || episodes.length > 0;

  return (
    <MainLayout>
      <HomeHero />

      {!hasContent ? (
        <div className="max-w-7xl mx-auto px-4 md:px-10 pb-24">
          <EmptyState
            title="尚無內容"
            description="目前還沒有任何節目或單集，請稍後再來。"
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 md:px-10 pb-24 space-y-24 md:space-y-32">
          {episodes.length > 0 && (
            <section className="mb-24 md:mb-32" id="最新單集">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 md:mb-16">
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-text-primary mb-2 md:mb-4">
                    最新百科收錄
                  </h3>
                  <p className="text-text-secondary font-bold">
                    每日自動彙整熱門集數，不漏掉任何細節。
                  </p>
                </div>
                <Link
                  href="/search"
                  className="text-[10px] font-black text-cta uppercase tracking-[0.3em] hover:translate-x-2 transition-all flex items-center gap-2 shrink-0"
                >
                  查看全部 <ChevronRight size={14} />
                </Link>
              </div>
              <EpisodeList episodes={episodes} shows={shows} hideSectionTitle />
            </section>
          )}

          {shows.length > 0 && (
            <section id="節目系列">
              <ShowGrid shows={shows} />
            </section>
          )}
        </div>
      )}
    </MainLayout>
  );
}
