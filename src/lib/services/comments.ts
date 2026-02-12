import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/types/database";
import { logger } from "@/lib/logger";

export async function getCommentsByEpisode(
  episodeId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("episode_id", episodeId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error("Error fetching comments:", error);
    throw error;
  }

  return data || [];
}

export async function createComment(
  episodeId: string,
  userId: string,
  content: string,
  spamScore: number = 0
): Promise<Comment> {
  const supabase = await createClient();

  // Determine status based on spam score
  let status: "pending" | "approved" | "hidden" | "spam" = "approved";
  if (spamScore > 0.7) {
    status = "spam";
  } else if (spamScore > 0.3) {
    status = "pending";
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      episode_id: episodeId,
      user_id: userId,
      content,
      status,
      spam_score: spamScore,
    })
    .select()
    .single();

  if (error) {
    logger.error("Error creating comment:", error);
    throw error;
  }

  return data;
}

export async function getCommentCount(episodeId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("episode_id", episodeId)
    .eq("status", "approved");

  if (error) {
    logger.error("Error counting comments:", error);
    return 0;
  }

  return count || 0;
}
