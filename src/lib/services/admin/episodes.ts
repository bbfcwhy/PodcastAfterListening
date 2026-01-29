import { createClient } from "@/lib/supabase/server";
import { Episode, Show } from "@/types/database";

export async function getAllEpisodes(includeUnpublished: boolean = true) {
  const supabase = await createClient();
  let query = supabase.from("episodes").select("*");

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all episodes:", error);
    throw error;
  }

  return data || [];
}

export async function getEpisodeById(id: string): Promise<Episode | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching episode by id:", error);
    throw error;
  }

  return data;
}

export async function createEpisode(
  episodeData: Omit<Episode, "id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .insert(episodeData)
    .select()
    .single();

  if (error) {
    console.error("Error creating episode:", error);
    throw error;
  }

  return data;
}

export async function updateEpisode(
  id: string,
  episodeData: Partial<Omit<Episode, "id" | "created_at" | "updated_at">>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .update(episodeData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating episode:", error);
    throw error;
  }

  return data;
}

export async function deleteEpisode(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("episodes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting episode:", error);
    throw error;
  }
}

export async function getAllShows(): Promise<Show[]> {
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
