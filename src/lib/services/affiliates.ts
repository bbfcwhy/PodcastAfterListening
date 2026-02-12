import { createClient } from "@/lib/supabase/server";
import type { AffiliateContent } from "@/types/database";
import { logger } from "@/lib/logger";

export async function getAffiliatesByEpisode(
  episodeId: string
): Promise<AffiliateContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episode_affiliates")
    .select("affiliate_contents(*)")
    .eq("episode_id", episodeId)
    .eq("affiliate_contents.is_active", true)
    .order("position", { ascending: true });

  if (error) {
    logger.error("Error fetching affiliates by episode:", error);
    throw error;
  }

  return (
    data
      ?.map((item: { affiliate_contents: AffiliateContent | null }) => item.affiliate_contents)
      .filter(Boolean) || []
  );
}

export async function recordClick(
  affiliateId: string,
  episodeId: string | null = null,
  userId: string | null = null,
  userAgent: string | null = null,
  referer: string | null = null
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliate_clicks")
    .insert({
      affiliate_id: affiliateId,
      episode_id: episodeId,
      user_id: userId,
      user_agent: userAgent,
      referer: referer,
    })
    .select()
    .single();

  if (error) {
    logger.error("Error recording affiliate click:", error);
    throw error;
  }

  return data;
}

export async function getAffiliateById(
  affiliateId: string
): Promise<AffiliateContent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliate_contents")
    .select("*")
    .eq("id", affiliateId)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    logger.error("Error fetching affiliate by id:", error);
    throw error;
  }

  return data;
}
