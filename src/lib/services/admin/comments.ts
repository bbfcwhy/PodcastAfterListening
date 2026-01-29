import { createClient } from "@/lib/supabase/server";
import { Comment } from "@/types/database";

export async function getCommentsByStatus(
  status: "pending" | "approved" | "hidden" | "spam" | "all" = "all",
  limit: number = 50,
  offset: number = 0
): Promise<Comment[]> {
  const supabase = await createClient();
  let query = supabase.from("comments").select("*");

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching comments by status:", error);
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
    console.error("Error updating comment status:", error);
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
    console.error("Error fetching comment counts:", error);
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

  data?.forEach((comment) => {
    if (comment.status in counts) {
      counts[comment.status as keyof typeof counts]++;
    }
  });

  return counts;
}
