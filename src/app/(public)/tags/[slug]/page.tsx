import { notFound } from "next/navigation";
import { getTagBySlug, getShowsByTag } from "@/lib/tags/actions";
import { ShowCard } from "@/components/shows/ShowCard";
import type { Show } from "@/types/database";

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

  const shows = (await getShowsByTag(tag.id)) as Show[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">#{tag.name}</h1>
        <p className="text-text-secondary mt-2">
          {shows.length > 0
            ? `共 ${shows.length} 個相關頻道`
            : "目前沒有相關頻道"}
        </p>
      </div>

      {shows.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg">此標籤目前沒有相關的頻道</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}
