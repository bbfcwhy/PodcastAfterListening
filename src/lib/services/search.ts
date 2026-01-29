import { createClient } from "@/lib/supabase/server";
import { Episode } from "@/types/database";

export interface SearchFilters {
  query?: string;
  showId?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
}

export async function searchEpisodes(
  filters: SearchFilters,
  limit: number = 20,
  offset: number = 0
): Promise<Episode[]> {
  const supabase = await createClient();

  let query = supabase.rpc("search_episodes", {
    query: filters.query || "",
    filter_show_id: filters.showId || null,
    filter_tags: filters.tags || [],
    from_date: filters.fromDate || null,
    to_date: filters.toDate || null,
  });

  const { data, error } = await query;

  if (error) {
    console.error("Error searching episodes:", error);
    // Fallback to basic search if function doesn't exist
    return await basicSearch(filters, limit, offset);
  }

  // Apply pagination manually since RPC doesn't support it directly
  return (data || []).slice(offset, offset + limit);
}

async function basicSearch(
  filters: SearchFilters,
  limit: number,
  offset: number
): Promise<Episode[]> {
  const supabase = await createClient();
  // Use podcast_episodes table directly, or episodes view if available
  let query = supabase
    .from("podcast_episodes")
    .select("*")
    .eq("is_published", true);

  if (filters.showId) {
    query = query.eq("show_id", filters.showId);
  }

  if (filters.fromDate) {
    query = query.gte("published_at", filters.fromDate);
  }

  if (filters.toDate) {
    query = query.lte("published_at", filters.toDate);
  }

  if (filters.query) {
    // Basic text search using ilike
    query = query.or(
      `title.ilike.%${filters.query}%,ai_summary.ilike.%${filters.query}%,host_notes.ilike.%${filters.query}%`
    );
  }

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error in basic search:", error);
    return [];
  }

  return data || [];
}
