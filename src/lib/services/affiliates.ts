import { createClient } from "@/lib/supabase/server";
import { AffiliateContent } from "@/types/database";

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
    console.error("Error fetching affiliates by episode:", error);
    throw error;
  }

  return (
    data
      ?.map((item: any) => item.affiliate_contents)
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
    console.error("Error recording affiliate click:", error);
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
    console.error("Error fetching affiliate by id:", error);
    throw error;
  }

  return data;
}
