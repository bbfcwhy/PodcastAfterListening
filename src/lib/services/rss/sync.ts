import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAndParseFeed } from "./parser";

/** Extract "Hosting provided by XXX" from channel description if present. */
function extractHostingProvidedBy(description: string | undefined): string | undefined {
  if (!description?.trim()) return undefined;
  const match = description.match(/Hosting\s+provided\s+by\s+([^.\n]+)/i);
  return match ? match[1].trim() : undefined;
}

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "episode";
}

function parsePubDate(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export type SyncResult = {
  ok: boolean;
  show_updated: boolean;
  episodes_updated: number;
  errors: string[];
};

/**
 * Sync a show and its episodes from its RSS feed.
 * Uses show's rss_feed_url; updates shows + hosts/show_hosts + podcast_episodes.
 * Partial success: logs errors, does not throw; returns result with errors array.
 */
export async function syncShowFromRss(
  supabase: SupabaseClient,
  showId: string
): Promise<SyncResult> {
  const errors: string[] = [];
  let show_updated = false;
  let episodes_updated = 0;

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("*")
    .eq("id", showId)
    .single();

  if (showError || !show) {
    return {
      ok: false,
      show_updated: false,
      episodes_updated: 0,
      errors: [showError?.message ?? "Show not found"],
    };
  }

  const rssUrl = (show as { rss_feed_url?: string | null }).rss_feed_url?.trim();
  if (!rssUrl) {
    return {
      ok: false,
      show_updated: false,
      episodes_updated: 0,
      errors: ["Show has no rss_feed_url"],
    };
  }

  const parseResult = await fetchAndParseFeed(rssUrl);
  if (!parseResult.ok) {
    return {
      ok: false,
      show_updated: false,
      episodes_updated: 0,
      errors: [parseResult.error],
    };
  }

  const { channel, items } = parseResult.feed;

  const hostingProvidedBy = extractHostingProvidedBy(channel.description);

  const showPayload: Record<string, unknown> = {};
  if (channel.title != null) showPayload.name = channel.title;
  if (channel.description != null) showPayload.description = channel.description;
  if (channel.link != null) showPayload.original_url = channel.link;
  if (channel.imageUrl != null) showPayload.cover_image_url = channel.imageUrl;
  if (hostingProvidedBy != null) showPayload.hosting_provided_by = hostingProvidedBy;
  if (channel.categories != null && channel.categories.length > 0)
    showPayload.show_categories = channel.categories;

  if (Object.keys(showPayload).length > 0) {
    const { error: updateShowError } = await supabase
      .from("shows")
      .update(showPayload)
      .eq("id", showId);
    if (updateShowError) {
      errors.push(`Show update: ${updateShowError.message}`);
    } else {
      show_updated = true;
    }
  }

  // Sync categories as tags
  if (channel.categories != null && channel.categories.length > 0) {
    for (const catName of channel.categories) {
      const trimmed = catName.trim();
      if (!trimmed) continue;

      // Upsert tag
      const { data: tag } = await supabase
        .from("tags")
        .upsert({ name: trimmed, slug: trimmed }, { onConflict: "name" })
        .select("id")
        .single();

      if (tag) {
        // Link show to tag
        await supabase
          .from("show_tags")
          .upsert({ show_id: showId, tag_id: tag.id }, { onConflict: "show_id,tag_id" });
      }
    }
  }

  if (channel.author?.trim()) {
    const hostName = channel.author.trim();
    const { data: existingHost } = await supabase
      .from("hosts")
      .select("id")
      .ilike("name", hostName)
      .limit(1)
      .maybeSingle();
    let hostId: string | null = existingHost?.id ?? null;
    if (!hostId) {
      const { data: newHost, error: insertHostError } = await supabase
        .from("hosts")
        .insert({ name: hostName })
        .select("id")
        .single();
      if (insertHostError) {
        errors.push(`Host insert: ${insertHostError.message}`);
      } else {
        hostId = newHost?.id ?? null;
      }
    }
    if (hostId) {
      const { error: linkError } = await supabase.from("show_hosts").upsert(
        { show_id: showId, host_id: hostId, role: "host" },
        { onConflict: "show_id,host_id" }
      );
      if (linkError) errors.push(`ShowHost link: ${linkError.message}`);
    }
  }

  for (const item of items) {
    const episodeId = item.guid?.trim() ?? item.link?.trim() ?? undefined;
    const title = item.title?.trim();
    if (!episodeId && !title) continue;
    const stableId = episodeId ?? slugify(title!);
    const slug = slugify(title ?? stableId);
    const publishedAt = parsePubDate(item.pubDate);

    const row = {
      episode_id: stableId,
      show_id: showId,
      title: title ?? stableId,
      slug,
      description: item.description?.trim() ?? null,
      duration_seconds: item.durationSeconds ?? null,
      published_at: publishedAt,
      original_url: item.link?.trim() ?? null,
    };

    const { error: upsertError } = await supabase
      .from("podcast_episodes")
      .upsert(row, { onConflict: "episode_id" });

    if (upsertError) {
      errors.push(`Episode ${stableId}: ${upsertError.message}`);
    } else {
      episodes_updated += 1;
    }
  }

  return {
    ok: errors.length === 0,
    show_updated,
    episodes_updated,
    errors,
  };
}
