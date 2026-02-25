import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getTagsWithCounts } from "@/lib/tags/actions";

export async function GET() {
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

    const tags = await getTagsWithCounts();
    return NextResponse.json(tags);
  } catch (error) {
    logger.error("Error in GET /api/admin/tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, slug } = body;

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

    // Check name uniqueness
    const { data: existingByName } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name.trim())
      .single();

    if (existingByName) {
      return NextResponse.json(
        { error: "此標籤名稱已存在", field: "name" },
        { status: 409 }
      );
    }

    // Check slug uniqueness
    const { data: existingBySlug } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", slug.trim())
      .single();

    if (existingBySlug) {
      return NextResponse.json(
        { error: "此 slug 已被使用", field: "slug" },
        { status: 409 }
      );
    }

    const { data: tag, error } = await supabase
      .from("tags")
      .insert({ name: name.trim(), slug: slug.trim() })
      .select()
      .single();

    if (error) {
      logger.error("Error creating tag:", error);
      return NextResponse.json(
        { error: "建立標籤失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    logger.error("Error in POST /api/admin/tags:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
