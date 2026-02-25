import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
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
    const body = await request.json();
    const { tag_ids } = body as { tag_ids: string[] };

    if (!Array.isArray(tag_ids)) {
      return NextResponse.json(
        { error: "tag_ids 必須為陣列" },
        { status: 400 }
      );
    }

    // Delete existing tags and insert new ones
    await supabase.from("show_tags").delete().eq("show_id", id);

    if (tag_ids.length > 0) {
      const { error } = await supabase.from("show_tags").insert(
        tag_ids.map((tag_id) => ({ show_id: id, tag_id }))
      );

      if (error) {
        logger.error("Error setting show tags:", error);
        return NextResponse.json(
          { error: "設定標籤失敗" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error in PUT /api/admin/shows/[id]/tags:", error);
    return NextResponse.json(
      { error: "Failed to set show tags" },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;
    const { data } = await supabase
      .from("show_tags")
      .select("tag_id")
      .eq("show_id", id);

    const tagIds = (data as { tag_id: string }[] || []).map((d) => d.tag_id);
    return NextResponse.json({ tag_ids: tagIds });
  } catch (error) {
    logger.error("Error in GET /api/admin/shows/[id]/tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch show tags" },
      { status: 500 }
    );
  }
}
