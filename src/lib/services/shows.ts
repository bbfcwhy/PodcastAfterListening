import { createClient } from "@/lib/supabase/server";
import { Show } from "@/types/database";

export async function getShows(): Promise<Show[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shows:", error);
    throw error;
  }

  return data || [];
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
    console.error("Error fetching show by slug:", error);
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
    console.error("Error counting episodes:", error);
    return 0;
  }

  return count || 0;
}
