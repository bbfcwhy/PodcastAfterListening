import { createClient } from "@/lib/supabase/server";
import { getCommentsByEpisode, createComment } from "@/lib/services/comments";
import { checkSpam } from "@/lib/spam-filter";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute
    return true;
  }

  if (userLimit.count >= 3) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
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
      profiles?.map((p) => [p.id, p]) || []
    );

    const commentsWithUsers = comments.map((comment) => ({
      ...comment,
      user: profilesMap.get(comment.user_id) || null,
    }));

    return NextResponse.json({ comments: commentsWithUsers });
  } catch (error) {
    console.error("Error fetching comments:", error);
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
    if (!checkRateLimit(user.id)) {
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
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
