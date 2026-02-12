import { getEpisodeById, getAllShows, updateEpisode } from "@/lib/services/admin/episodes";
import { EpisodeForm } from "@/components/admin/EpisodeForm";
import { notFound } from "next/navigation";

interface EditEpisodePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEpisodePage({ params }: EditEpisodePageProps) {
  const { id } = await params;
  const episode = await getEpisodeById(id);
  const shows = await getAllShows();

  if (!episode) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const showId = formData.get("show_id") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const publishedAt = formData.get("published_at") as string;
    const originalUrl = formData.get("original_url") as string;
    const aiSummary = formData.get("ai_summary") as string;
    const aiSponsorship = formData.get("ai_sponsorship") as string;
    const transcript = formData.get("transcript") as string;
    const durationSeconds = formData.get("duration_seconds") as string;
    const isPublished = formData.get("is_published") === "on";

    await updateEpisode(id, {
      show_id: showId,
      title,
      slug,
      published_at: publishedAt || null,
      original_url: originalUrl,
      ai_summary: aiSummary || null,
      ai_sponsorship: aiSponsorship || null,
      transcript: transcript || null,
      duration_seconds: durationSeconds ? parseInt(durationSeconds) : null,
      is_published: isPublished,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">編輯節目</h1>
        <p className="text-muted-foreground mt-2">修改節目資訊</p>
      </div>

      <EpisodeForm episode={episode} shows={shows} onSubmit={handleSubmit} />
    </div>
  );
}
