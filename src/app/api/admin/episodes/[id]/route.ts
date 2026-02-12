import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import {
  deleteEpisode,
  getEpisodeById,
  updateEpisode,
} from "@/lib/services/admin/episodes";
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

    const body = await request.json();
    const {
      updated_at: clientUpdatedAt,
      show_id,
      title,
      slug,
      published_at,
      original_url,
      ai_summary,
      ai_sponsorship,
      transcript,
      reflection,
      duration_seconds,
      is_published,
    } = body;

    if (title !== undefined && !String(title).trim()) {
      return NextResponse.json(
        { error: "標題為必填", field: "title" },
        { status: 400 }
      );
    }
    if (slug !== undefined && !String(slug).trim()) {
      return NextResponse.json(
        { error: "URL Slug 為必填", field: "slug" },
        { status: 400 }
      );
    }
    if (original_url !== undefined && !String(original_url).trim()) {
      return NextResponse.json(
        { error: "原始連結為必填", field: "original_url" },
        { status: 400 }
      );
    }
    if (show_id !== undefined && !show_id) {
      return NextResponse.json(
        { error: "請選擇節目系列", field: "show_id" },
        { status: 400 }
      );
    }

    if (clientUpdatedAt != null) {
      const current = await getEpisodeById(id);
      if (!current) {
        return NextResponse.json({ error: "Episode not found" }, { status: 404 });
      }
      const dbUpdated = new Date(current.updated_at).getTime();
      const clientSent = new Date(clientUpdatedAt).getTime();
      if (dbUpdated > clientSent) {
        return NextResponse.json(
          {
            reason: "newer_version",
            current_updated_at: current.updated_at,
          },
          { status: 409 }
        );
      }
    }

    const updateData: Parameters<typeof updateEpisode>[1] = {};
    if (show_id !== undefined) updateData.show_id = show_id;
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (published_at !== undefined) updateData.published_at = published_at;
    if (original_url !== undefined) updateData.original_url = original_url;
    if (ai_summary !== undefined) updateData.ai_summary = ai_summary;
    if (ai_sponsorship !== undefined) updateData.ai_sponsorship = ai_sponsorship;
    if (transcript !== undefined) updateData.transcript = transcript;
    if (reflection !== undefined) updateData.reflection = reflection;
    if (duration_seconds !== undefined)
      updateData.duration_seconds = duration_seconds;
    if (is_published !== undefined) updateData.is_published = is_published;

    const data = await updateEpisode(id, updateData);
    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error in PATCH /api/admin/episodes/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update episode" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEpisode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting episode:", error);
    return NextResponse.json(
      { error: "Failed to delete episode" },
      { status: 500 }
    );
  }
}
