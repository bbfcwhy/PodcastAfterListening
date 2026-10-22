import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
