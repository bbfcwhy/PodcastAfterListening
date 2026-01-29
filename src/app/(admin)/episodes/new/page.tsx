import { getAllShows } from "@/lib/services/admin/episodes";
import { EpisodeForm } from "@/components/admin/EpisodeForm";
import { createEpisode } from "@/lib/services/admin/episodes";

export default async function NewEpisodePage() {
  const shows = await getAllShows();

  async function handleSubmit(formData: FormData) {
    "use server";
    const showId = formData.get("show_id") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const publishedAt = formData.get("published_at") as string;
    const originalUrl = formData.get("original_url") as string;
    const aiSummary = formData.get("ai_summary") as string;
    const aiSponsorship = formData.get("ai_sponsorship") as string;
    const hostNotes = formData.get("host_notes") as string;
    const durationSeconds = formData.get("duration_seconds") as string;
    const isPublished = formData.get("is_published") === "on";

    await createEpisode({
      show_id: showId,
      title,
      slug,
      published_at: publishedAt || null,
      original_url: originalUrl,
      ai_summary: aiSummary || null,
      ai_sponsorship: aiSponsorship || null,
      host_notes: hostNotes || null,
      duration_seconds: durationSeconds ? parseInt(durationSeconds) : null,
      is_published: isPublished,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新增節目</h1>
        <p className="text-muted-foreground mt-2">建立新的 Podcast 單集</p>
      </div>

      <EpisodeForm shows={shows} onSubmit={handleSubmit} />
    </div>
  );
}
