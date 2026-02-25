import { notFound } from "next/navigation";
import { getTagBySlug, getEpisodesByTag } from "@/lib/tags/actions";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import type { Episode, Show } from "@/types/database";

type EpisodeWithShow = Episode & {
  show: Pick<Show, "id" | "name" | "slug" | "cover_image_url">;
};

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const tag = await getTagBySlug(decodedSlug);

  if (!tag) {
    notFound();
  }

  const episodes = (await getEpisodesByTag(tag.id)) as EpisodeWithShow[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">#{tag.name}</h1>
        <p className="text-text-secondary mt-2">
          {episodes.length > 0
            ? `共 ${episodes.length} 集相關單集`
            : "目前沒有相關單集"}
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg">此標籤目前沒有相關的已發布單集</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {episodes.map((episode) => {
            const formattedPublishedDate = episode.published_at
              ? format(new Date(episode.published_at), "yyyy年MM月dd日", {
                  locale: zhTW,
                })
              : null;

            return (
              <EpisodeCard
                key={episode.id}
                episode={{ ...episode, formattedPublishedDate }}
                show={episode.show as Show}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
