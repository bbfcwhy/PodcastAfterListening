import { createClient } from "@/lib/supabase/server";
import { Episode, Show, Database } from "@/types/database";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export type GetAllEpisodesOptions = {
  includeUnpublished?: boolean;
  page?: number;
  pageSize?: number;
  title?: string;
  is_published?: boolean;
};

export async function getAllEpisodes(
  includeUnpublishedOrOptions: boolean | GetAllEpisodesOptions = true
): Promise<Episode[] | { items: Episode[]; total: number }> {
  const supabase = await createClient();
  const options: GetAllEpisodesOptions =
    typeof includeUnpublishedOrOptions === "boolean"
      ? { includeUnpublished: includeUnpublishedOrOptions }
      : { includeUnpublished: true, ...includeUnpublishedOrOptions };

  const {
    includeUnpublished = true,
    page,
    pageSize = DEFAULT_PAGE_SIZE,
    title,
    is_published,
  } = options;

  let query = supabase.from("episodes").select("*", { count: "exact" });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }
  if (title?.trim()) {
    query = query.ilike("title", `%${title.trim()}%`);
  }
  if (is_published !== undefined) {
    query = query.eq("is_published", is_published);
  }

  query = query.order("created_at", { ascending: false });

  if (page != null && page >= 1) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) {
      console.error("Error fetching episodes:", error);
      throw error;
    }
    return { items: data || [], total: count ?? 0 };
  }

  const { data, error } = await query;
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
  episodeData: Database["public"]["Tables"]["episodes"]["Insert"]
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
  episodeData: Database["public"]["Tables"]["episodes"]["Update"]
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
