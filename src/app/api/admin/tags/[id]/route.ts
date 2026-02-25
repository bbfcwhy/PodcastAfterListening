import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function PATCH(
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
    const { name, slug } = body;

    // Check tag exists
    const { data: existing } = await supabase
      .from("tags")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "標籤不存在" },
        { status: 404 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "標籤名稱為必填", field: "name" },
        { status: 400 }
      );
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: "標籤 slug 為必填", field: "slug" },
        { status: 400 }
      );
    }

    // Check name uniqueness (exclude self)
    const { data: conflictName } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name.trim())
      .neq("id", id)
      .single();

    if (conflictName) {
      return NextResponse.json(
        { error: "此標籤名稱已存在", field: "name" },
        { status: 409 }
      );
    }

    // Check slug uniqueness (exclude self)
    const { data: conflictSlug } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", slug.trim())
      .neq("id", id)
      .single();

    if (conflictSlug) {
      return NextResponse.json(
        { error: "此 slug 已被使用", field: "slug" },
        { status: 409 }
      );
    }

    const { data: tag, error } = await supabase
      .from("tags")
      .update({ name: name.trim(), slug: slug.trim() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating tag:", error);
      return NextResponse.json(
        { error: "更新標籤失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    logger.error("Error in PATCH /api/admin/tags/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "標籤不存在" },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("tags").delete().eq("id", id);

    if (error) {
      logger.error("Error deleting tag:", error);
      return NextResponse.json(
        { error: "刪除標籤失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error in DELETE /api/admin/tags/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
