import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    // Check if user is admin
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
      title,
      description,
      target_url,
      image_url,
      is_active,
    } = body;

    if (clientUpdatedAt != null) {
      const { data: current } = await supabase
        .from("affiliate_contents")
        .select("updated_at")
        .eq("id", id)
        .single();

      if (current?.updated_at) {
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
    }

    if (title !== undefined && !String(title).trim()) {
      return NextResponse.json(
        { error: "標題為必填", field: "title" },
        { status: 400 }
      );
    }
    if (target_url !== undefined && !String(target_url).trim()) {
      return NextResponse.json(
        { error: "目標連結為必填", field: "target_url" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (target_url !== undefined) updateData.target_url = target_url;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from("affiliate_contents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating affiliate:", error);
      return NextResponse.json(
        { error: "Failed to update affiliate" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /api/admin/affiliates/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("affiliate_contents")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting affiliate:", error);
      return NextResponse.json(
        { error: "Failed to delete affiliate" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/affiliates/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
