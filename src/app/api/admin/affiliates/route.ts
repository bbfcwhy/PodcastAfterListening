import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
    const { title, description, target_url, image_url, is_active } = body;

    if (!title || !target_url) {
      return NextResponse.json(
        { error: "Title and target URL are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("affiliate_contents")
      .insert({
        title,
        description: description || null,
        target_url,
        image_url: image_url || null,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating affiliate:", error);
      return NextResponse.json(
        { error: "Failed to create affiliate" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/admin/affiliates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
