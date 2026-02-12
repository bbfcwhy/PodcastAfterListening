import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { Comment } from "@/types/database";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export type GetCommentsByStatusOptions = {
  page?: number;
  pageSize?: number;
};

export async function getCommentsByStatus(
  status: "pending" | "approved" | "hidden" | "spam" | "all" = "all",
  limitOrOptions: number | GetCommentsByStatusOptions = 50,
  offset: number = 0
): Promise<Comment[] | { items: Comment[]; total: number }> {
  const supabase = await createClient();
  const usePagination =
    typeof limitOrOptions === "object" &&
    limitOrOptions != null &&
    (limitOrOptions as GetCommentsByStatusOptions).page != null;
  const page =
    typeof limitOrOptions === "object" ? (limitOrOptions as GetCommentsByStatusOptions).page ?? 1 : 1;
  const pageSize =
    typeof limitOrOptions === "object" && (limitOrOptions as GetCommentsByStatusOptions).pageSize != null
      ? (limitOrOptions as GetCommentsByStatusOptions).pageSize!
      : DEFAULT_PAGE_SIZE;
  const limit =
    typeof limitOrOptions === "number" ? limitOrOptions : 50;

  if (usePagination && page >= 1) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let query = supabase.from("comments").select("*", { count: "exact" });
    if (status !== "all") query = query.eq("status", status);
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) {
      logger.error("Error fetching comments by status:", error);
      throw error;
    }
    return { items: data || [], total: count ?? 0 };
  }

  let query = supabase.from("comments").select("*");
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    logger.error("Error fetching comments by status:", error);
    throw error;
  }
  return data || [];
}

export async function updateCommentStatus(
  commentId: string,
  status: "pending" | "approved" | "hidden" | "spam"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ status })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    logger.error("Error updating comment status:", error);
    throw error;
  }

  return data;
}

export async function getCommentCounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("status");

  if (error) {
    logger.error("Error fetching comment counts:", error);
    return {
      pending: 0,
      approved: 0,
      hidden: 0,
      spam: 0,
      total: 0,
    };
  }

  const counts = {
    pending: 0,
    approved: 0,
    hidden: 0,
    spam: 0,
    total: data?.length || 0,
  };

  data?.forEach((comment: { status: string }) => {
    if (comment.status in counts) {
      counts[comment.status as keyof typeof counts]++;
    }
  });

  return counts;
}
