import Image from "next/image";
import { MainLayout } from "@/components/layout/MainLayout";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { EmptyState } from "@/components/ui/EmptyState";
import { HostCard } from "@/components/hosts/HostCard";
import { getShowBySlug, getShowWithEpisodeCount } from "@/lib/services/shows";
import { getEpisodesByShow } from "@/lib/services/episodes";
import { getHostsByShow } from "@/lib/services/hosts";
import { stripHtml } from "@/lib/utils/sanitize";
import { notFound } from "next/navigation";
import { Calendar, Podcast } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { AddToLibraryButton } from "@/components/library/AddToLibraryButton";
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

  const [episodes, episodeCount, hosts] = await Promise.all([
    getEpisodesByShow(show.id),
    getShowWithEpisodeCount(show.id),
    getHostsByShow(show.id),
  ]);

  // Check if user is logged in and if show is in library
  const user = await getCurrentUser();
  let isInLibrary = false;

  if (user) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("library_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("show_id", show.id);
    isInLibrary = !!count;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-12 md:py-16 px-4 md:px-10">
        {/* Show Header */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-16 md:mb-24 items-center md:items-start bg-surface p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-border-subtle">
          <div className="relative shrink-0">
            {show.cover_image_url ? (
              <Image
                src={show.cover_image_url}
                alt={show.name}
                width={288}
                height={288}
                className="w-48 h-48 md:w-72 md:h-72 rounded-[2rem] shadow-sm relative z-10 object-cover"
              />
            ) : (
              <div className="w-48 h-48 md:w-72 md:h-72 rounded-[2rem] shadow-sm relative z-10 bg-canvas flex items-center justify-center">
                <Podcast className="text-cta" size={80} />
              </div>
            )}
            <div className="absolute -inset-4 bg-cta/10 rounded-[2.5rem] blur-2xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4 md:mb-6">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-primary">
                {show.name}
              </h1>
              {user && (
                <AddToLibraryButton
                  showId={show.id}
                  initialIsAdded={isInLibrary}
                  className="shrink-0 mx-auto md:mx-0"
                />
              )}
            </div>
            {show.description && (
              <p className="text-lg md:text-xl text-text-secondary mb-6 md:mb-10 max-w-2xl leading-relaxed font-medium">
                {stripHtml(show.description)}
              </p>
            )}
            {hosts.length > 0 && (
              <p className="text-base text-text-secondary mb-2 font-medium">
                主持人：{hosts.map((h) => h.name).join("、")}
              </p>
            )}
            {show.hosting_provided_by && (
              <p className="text-sm text-text-secondary mb-2">
                Hosting provided by {show.hosting_provided_by}
              </p>
            )}
            {show.show_categories && show.show_categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.show_categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs font-medium px-2 py-1 rounded-md bg-cta/10 text-cta"
                  >
                    #{cat}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-text-secondary font-bold">
              共 {episodeCount} 集節目
            </p>
          </div>
        </div>

        {hosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-text-primary flex items-center gap-4">
              主持人
            </h2>
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
          </section>
        )}

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
            <EpisodeList episodes={episodes} shows={[show]} hideSectionTitle showLimitControl />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
