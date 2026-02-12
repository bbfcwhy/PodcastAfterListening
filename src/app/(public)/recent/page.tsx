
import { MainLayout } from "@/components/layout/MainLayout";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { getLatestEpisodes } from "@/lib/services/episodes";
import { getShows } from "@/lib/services/shows";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "最新單集 - Podcast 聽了以後",
    description: "瀏覽所有最新發布的 Podcast 單集筆記",
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function RecentPage() {
    const [episodes, shows] = await Promise.all([
        getLatestEpisodes(50),
        getShows(),
    ]);

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-cta/10 rounded-2xl flex items-center justify-center">
                        <Clock className="text-cta" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-text-primary">
                            最新單集
                        </h1>
                        <p className="text-text-secondary font-bold mt-2">
                            瀏覽所有最新收錄的 Podcast 內容
                        </p>
                    </div>
                </div>

                <EpisodeList episodes={episodes} shows={shows} hideSectionTitle showLimitControl />
            </div>
        </MainLayout>
    );
}
