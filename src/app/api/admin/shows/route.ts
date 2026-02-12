import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { getAllShows, createShow, getShowBySlug } from "@/lib/services/admin/shows";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = parseInt(
      searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
      10
    );
    const name = searchParams.get("name") ?? undefined;

    const result = await getAllShows({ page, pageSize, name });
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error in GET /api/admin/shows:", error);
    return NextResponse.json(
      { error: "Failed to fetch shows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { name, slug, description, cover_image_url, original_url } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "節目名稱為必填", field: "name" },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "URL Slug 為必填", field: "slug" },
        { status: 400 }
      );
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug 僅能包含小寫英文、數字與連字號", field: "slug" },
        { status: 400 }
      );
    }

    const existing = await getShowBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: "slug 已被使用", field: "slug" },
        { status: 409 }
      );
    }

    const data = await createShow({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      cover_image_url: cover_image_url?.trim() || null,
      original_url: original_url?.trim() || null,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error("Error in POST /api/admin/shows:", error);
    return NextResponse.json(
      { error: "Failed to create show" },
      { status: 500 }
    );
  }
}
