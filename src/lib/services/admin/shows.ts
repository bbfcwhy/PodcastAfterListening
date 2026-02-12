import { createClient } from "@/lib/supabase/server";
import type { Show, Database } from "@/types/database";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { logger } from "@/lib/logger";

export type GetAllShowsOptions = {
  page?: number;
  pageSize?: number;
  name?: string;
};

export async function getAllShows(
  options: GetAllShowsOptions = {}
): Promise<{ items: Show[]; total: number }> {
  const supabase = await createClient();
  const { page, pageSize = DEFAULT_PAGE_SIZE, name } = options;

  let query = supabase.from("shows").select("*", { count: "exact" });

  if (name?.trim()) {
    query = query.ilike("name", `%${name.trim()}%`);
  }

  query = query.order("created_at", { ascending: false });

  if (page != null && page >= 1) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) {
      logger.error("Error fetching shows:", error);
      throw error;
    }
    return { items: data || [], total: count ?? 0 };
  }

  const { data, error, count } = await query;
  if (error) {
    logger.error("Error fetching all shows:", error);
    throw error;
  }
  return { items: data || [], total: count ?? 0 };
}

export async function getShowById(id: string): Promise<Show | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    logger.error("Error fetching show by id:", error);
    throw error;
  }

  return data;
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
      return null;
    }
    logger.error("Error fetching show by slug:", error);
    throw error;
  }

  return data;
}

export async function createShow(
  showData: Database["public"]["Tables"]["shows"]["Insert"]
): Promise<Show> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .insert(showData)
    .select()
    .single();

  if (error) {
    logger.error("Error creating show:", error);
    throw error;
  }

  return data;
}

export async function updateShow(
  id: string,
  showData: Database["public"]["Tables"]["shows"]["Update"]
): Promise<Show> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .update(showData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    logger.error("Error updating show:", error);
    throw error;
  }

  return data;
}
