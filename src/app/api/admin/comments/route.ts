import { getCommentsByStatus } from "@/lib/services/admin/comments";
import { logger } from "@/lib/logger";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = (searchParams.get("status") ||
      "all") as "pending" | "approved" | "hidden" | "spam" | "all";

    const comments = await getCommentsByStatus(status);

    return NextResponse.json({ comments });
  } catch (error) {
    logger.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
