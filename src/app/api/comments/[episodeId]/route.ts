import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { getCommentsByEpisode, createComment } from "@/lib/services/comments";
import { checkSpam } from "@/lib/spam-filter";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

// Rate limiting: check recent comments count in DB (works across stateless runtimes)
async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneMinuteAgo);
  return (count ?? 0) < 3;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const comments = await getCommentsByEpisode(episodeId);

    // Fetch user profiles for comments
    const supabase = await createClient();
    const userIds = comments.map((c) => c.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    const profilesMap = new Map(
      (profiles ?? []).map((p: { id: string }) => [p.id, p])
    );

    const commentsWithUsers = comments.map((comment) => ({
      ...comment,
      user: profilesMap.get(comment.user_id) || null,
    }));

    return NextResponse.json({ comments: commentsWithUsers });
  } catch (error) {
    logger.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!(await checkRateLimit(supabase, user.id))) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before posting again." },
        { status: 429 }
      );
    }

    const { episodeId } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Content too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Check spam
    const spamScore = checkSpam(content);

    // Create comment
    const comment = await createComment(episodeId, user.id, content, spamScore);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    logger.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
