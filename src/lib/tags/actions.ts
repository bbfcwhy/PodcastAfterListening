"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tag } from "@/types/database";

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Tag[]) || [];
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Tag;
}

export async function getEpisodesByTag(tagId: string) {
  const supabase = await createClient();

  // Get episode IDs with this tag
  const { data: tagLinks } = await supabase
    .from("episode_tags")
    .select("episode_id")
    .eq("tag_id", tagId);

  if (!tagLinks || tagLinks.length === 0) return [];

  const episodeIds = (tagLinks as { episode_id: string }[]).map(
    (link) => link.episode_id
  );

  // Get published episodes with show info
  const { data: episodes } = await supabase
    .from("episodes")
    .select("*, show:shows(id, name, slug, cover_image_url)")
    .in("id", episodeIds)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return episodes || [];
}

export async function getShowsByTag(tagId: string) {
  const supabase = await createClient();

  const { data: tagLinks } = await supabase
    .from("show_tags")
    .select("show_id")
    .eq("tag_id", tagId);

  if (!tagLinks || tagLinks.length === 0) return [];

  const showIds = (tagLinks as { show_id: string }[]).map(
    (link) => link.show_id
  );

  const { data: shows } = await supabase
    .from("shows")
    .select("*")
    .in("id", showIds)
    .order("name", { ascending: true });

  return shows || [];
}

export async function getTagUsageCount(
  tagId: string
): Promise<{ episode_count: number; show_count: number }> {
  const supabase = await createClient();

  const [episodeResult, showResult] = await Promise.all([
    supabase
      .from("episode_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagId),
    supabase
      .from("show_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagId),
  ]);

  return {
    episode_count: episodeResult.count || 0,
    show_count: showResult.count || 0,
  };
}

export async function getTagsWithCounts(): Promise<
  (Tag & { episode_count: number; show_count: number })[]
> {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (!tags || tags.length === 0) return [];

  const typedTags = tags as Tag[];
  const tagIds = typedTags.map((t) => t.id);

  const [episodeCounts, showCounts] = await Promise.all([
    supabase.from("episode_tags").select("tag_id").in("tag_id", tagIds),
    supabase.from("show_tags").select("tag_id").in("tag_id", tagIds),
  ]);

  const episodeCountMap = new Map<string, number>();
  for (const item of (episodeCounts.data || []) as { tag_id: string }[]) {
    episodeCountMap.set(
      item.tag_id,
      (episodeCountMap.get(item.tag_id) || 0) + 1
    );
  }

  const showCountMap = new Map<string, number>();
  for (const item of (showCounts.data || []) as { tag_id: string }[]) {
    showCountMap.set(
      item.tag_id,
      (showCountMap.get(item.tag_id) || 0) + 1
    );
  }

  return typedTags.map((tag) => ({
    ...tag,
    episode_count: episodeCountMap.get(tag.id) || 0,
    show_count: showCountMap.get(tag.id) || 0,
  }));
}
