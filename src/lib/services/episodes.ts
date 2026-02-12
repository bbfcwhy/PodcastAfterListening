import { createClient } from "@/lib/supabase/server";
import type { Episode, Host, Show, Tag } from "@/types/database";
import { logger } from "@/lib/logger";

export async function getLatestEpisodes(limit: number = 10): Promise<Episode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("*, comments(count)")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Error fetching latest episodes:", error);
    throw error;
  }

  return data || [];
}

export async function getEpisodesByShow(showId: string): Promise<Episode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("*, comments(count)")
    .eq("show_id", showId)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching episodes by show:", error);
    throw error;
  }

  return data || [];
}

export async function getEpisodeWithShow(
  showSlug: string,
  episodeSlug: string
): Promise<{ episode: Episode; show: Show } | null> {
  const supabase = await createClient();

  // Decode slugs to ensure chinese characters are handled correctly
  const decodedShowSlug = decodeURIComponent(showSlug);
  const decodedEpisodeSlug = decodeURIComponent(episodeSlug);

  // First get the show
  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("*")
    .eq("slug", decodedShowSlug)
    .single();

  if (showError || !show) {
    return null;
  }

  // Then get the episode
  const { data: episode, error: episodeError } = await supabase
    .from("episodes")
    .select("*")
    .eq("show_id", show.id)
    .eq("slug", decodedEpisodeSlug)
    .eq("is_published", true)
    .single();

  if (episodeError || !episode) {
    return null;
  }

  return { episode, show };
}

export async function getEpisodeDetail(
  showSlug: string,
  episodeSlug: string
): Promise<{
  episode: Episode;
  show: Show;
  hosts: Array<{ id: string; name: string; bio: string | null; avatar_url: string | null }>;
  tags: Array<{ id: string; name: string; slug: string }>;
} | null> {
  const supabase = await createClient();

  // Get episode with show
  const episodeWithShow = await getEpisodeWithShow(showSlug, episodeSlug);
  if (!episodeWithShow) {
    return null;
  }

  const { episode, show } = episodeWithShow;

  // Get hosts for this show
  const { data: hostsData } = await supabase
    .from("show_hosts")
    .select("hosts(id, name, bio, avatar_url)")
    .eq("show_id", show.id);

  const hosts =
    hostsData?.map((item: { hosts: Host | null }) => item.hosts).filter(Boolean) || [];

  // Get tags for this episode
  const { data: tagsData } = await supabase
    .from("episode_tags")
    .select("tags(id, name, slug)")
    .eq("episode_id", episode.id);

  const tags = tagsData?.map((item: { tags: Tag | null }) => item.tags).filter(Boolean) || [];

  return {
    episode,
    show,
    hosts,
    tags,
  };
}
