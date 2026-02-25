import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getTagUsageCount } from "@/lib/tags/actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const usage = await getTagUsageCount(id);
    return NextResponse.json(usage);
  } catch (error) {
    logger.error("Error in GET /api/admin/tags/[id]/usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag usage" },
      { status: 500 }
    );
  }
}
