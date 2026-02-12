import { createClient } from "@/lib/supabase/server";
import type { Show } from "@/types/database";
import { logger } from "@/lib/logger";

export async function getShows(): Promise<(Show & { episode_count: number })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("*, episodes(count)")
    .eq("episodes.is_published", true)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching shows:", error);
    throw error;
  }



  // Transform data to match expected structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((show: any) => ({
    ...show,
    episode_count: show.episodes?.[0]?.count || 0,
  }));
}

export async function getShowBySlug(slug: string): Promise<Show | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    logger.error("Error fetching show by slug:", error);
    throw error;
  }

  return data;
}

export async function getShowWithEpisodeCount(showId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("episodes")
    .select("*", { count: "exact", head: true })
    .eq("show_id", showId)
    .eq("is_published", true);

  if (error) {
    logger.error("Error counting episodes:", error);
    return 0;
  }

  return count || 0;
}
