import { updateCommentStatus } from "@/lib/services/admin/comments";
import { logger } from "@/lib/logger";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (
      !["pending", "approved", "hidden", "spam"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const comment = await updateCommentStatus(
      id,
      status as "pending" | "approved" | "hidden" | "spam"
    );

    return NextResponse.json({ comment });
  } catch (error) {
    logger.error("Error updating comment status:", error);
    return NextResponse.json(
      { error: "Failed to update comment status" },
      { status: 500 }
    );
  }
}
