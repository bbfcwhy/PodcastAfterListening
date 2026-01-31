import { createClient } from "@/lib/supabase/server";
import {
  getShowById,
  getShowBySlug,
  updateShow,
} from "@/lib/services/admin/shows";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const show = await getShowById(id);
    if (!show) {
      return NextResponse.json({ error: "節目不存在" }, { status: 404 });
    }

    return NextResponse.json(show);
  } catch (error) {
    console.error("Error in GET /api/admin/shows/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch show" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      updated_at: clientUpdatedAt,
      name,
      slug,
      description,
      cover_image_url,
      original_url,
    } = body;

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json(
        { error: "節目名稱為必填", field: "name" },
        { status: 400 }
      );
    }

    if (slug !== undefined && !String(slug).trim()) {
      return NextResponse.json(
        { error: "URL Slug 為必填", field: "slug" },
        { status: 400 }
      );
    }

    if (slug !== undefined) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { error: "Slug 僅能包含小寫英文、數字與連字號", field: "slug" },
          { status: 400 }
        );
      }
    }

    const current = await getShowById(id);
    if (!current) {
      return NextResponse.json({ error: "節目不存在" }, { status: 404 });
    }

    if (clientUpdatedAt != null) {
      const dbUpdated = new Date(current.updated_at).getTime();
      const clientSent = new Date(clientUpdatedAt).getTime();
      if (dbUpdated > clientSent) {
        return NextResponse.json(
          {
            error: "此筆內容已有更新版本",
            current_updated_at: current.updated_at,
          },
          { status: 409 }
        );
      }
    }

    if (slug !== undefined && slug !== current.slug) {
      const existing = await getShowBySlug(slug);
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "slug 已被使用", field: "slug" },
          { status: 409 }
        );
      }
    }

    const updateData: Parameters<typeof updateShow>[1] = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slug.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (cover_image_url !== undefined)
      updateData.cover_image_url = cover_image_url?.trim() || null;
    if (original_url !== undefined)
      updateData.original_url = original_url?.trim() || null;

    const data = await updateShow(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /api/admin/shows/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update show" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("DELETE show requested for id:", id);
  return NextResponse.json(
    { error: "刪除功能尚未開放" },
    { status: 501 }
  );
}
