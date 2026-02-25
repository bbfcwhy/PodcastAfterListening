import { getCurrentUser } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { LibraryList } from "@/components/library/LibraryList";
import { EpisodeLibraryList } from "@/components/library/EpisodeLibraryList";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "我的收藏庫 - Podcast 聽了以後",
};

export default async function LibraryPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    const supabase = await createClient();

    // 查詢頻道收藏
    const { data: libraryItems, error } = await supabase
        .from("library_items")
        .select(`
      *,
      show:shows(*)
    `)
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .order("added_at", { ascending: false });

    if (error) {
        logger.error("Error fetching library items:", error);
    }

    // 查詢單集收藏
    const { data: episodeLibraryItems, error: episodeError } = await supabase
        .from("episode_library_items")
        .select(`
      *,
      episode:episodes(*, show:shows(name, slug, cover_image_url))
    `)
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

    if (episodeError) {
        logger.error("Error fetching episode library items:", episodeError);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedItems = (libraryItems || []).map((item: any) => ({
        ...item,
        show: item.show,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validItems = formattedItems.filter((item: any) => item.show !== null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validEpisodeItems = (episodeLibraryItems || []).filter((item: any) => item.episode !== null);

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-12 px-4 md:px-10">
                <h1 className="text-3xl font-black mb-8 text-text-primary">我的收藏庫</h1>
                <Tabs defaultValue="shows" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-surface border border-border-subtle p-1 h-auto rounded-[2rem] max-w-md">
                        <TabsTrigger
                            value="shows"
                            className="rounded-[1.5rem] py-3 text-sm md:text-base font-bold data-[state=active]:bg-cta data-[state=active]:text-white transition-all"
                        >
                            頻道
                        </TabsTrigger>
                        <TabsTrigger
                            value="episodes"
                            className="rounded-[1.5rem] py-3 text-sm md:text-base font-bold data-[state=active]:bg-cta data-[state=active]:text-white transition-all"
                        >
                            單集
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="shows" className="animate-in fade-in-50 duration-300">
                        <LibraryList items={validItems} />
                    </TabsContent>

                    <TabsContent value="episodes" className="animate-in fade-in-50 duration-300">
                        <EpisodeLibraryList items={validEpisodeItems} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
