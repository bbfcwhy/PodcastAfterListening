import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { syncShowFromRss } from "@/lib/services/rss/sync";
import { NextRequest, NextResponse } from "next/server";

const RSS_SYNC_HEADER = "x-rss-sync-key";

/**
 * POST /api/admin/shows/:id/sync-rss
 * Require admin auth (cookie) or API key (header X-RSS-Sync-Key).
 * Sync show and episodes from show's rss_feed_url.
 * Returns { ok, show_updated, episodes_updated, errors? }.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey = request.headers.get(RSS_SYNC_HEADER) ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const expectedKey = process.env.RSS_SYNC_API_KEY?.trim();

    let supabase: Awaited<ReturnType<typeof createServerClient>>;

    if (expectedKey && apiKey === expectedKey) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
      if (!url || !serviceKey) {
        return NextResponse.json(
          { error: "Server misconfiguration: RSS sync API key is set but SUPABASE_SERVICE_ROLE_KEY is missing" },
          { status: 500 }
        );
      }
      supabase = createSupabaseClient(url, serviceKey);
    } else {
      supabase = await createServerClient();
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
    }

    const result = await syncShowFromRss(supabase, id);

    if (!result.ok && result.errors.length > 0 && result.episodes_updated === 0 && !result.show_updated) {
      const msg = result.errors[0] ?? "Sync failed";
      if (msg.includes("not found") || msg.includes("no rss_feed_url")) {
        return NextResponse.json({ error: msg, ...result }, { status: 404 });
      }
      if (msg.includes("Fetch failed") || msg.includes("Invalid XML") || msg.includes("HTTP ")) {
        return NextResponse.json({ error: msg, ...result }, { status: 422 });
      }
      return NextResponse.json({ error: msg, ...result }, { status: 500 });
    }

    return NextResponse.json({
      ok: result.ok,
      show_updated: result.show_updated,
      episodes_updated: result.episodes_updated,
      ...(result.errors.length > 0 ? { errors: result.errors } : {}),
    });
  } catch (error) {
    console.error("Error in POST /api/admin/shows/[id]/sync-rss:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
