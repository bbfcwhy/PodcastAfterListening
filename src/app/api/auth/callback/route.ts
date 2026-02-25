import { createClient, createServiceClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      const { user } = session;
      const displayName = user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0];
      const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;

      // Use service client to bypass RLS for profile upsert (INSERT policy not needed)
      try {
        const serviceClient = createServiceClient();
        await serviceClient.from("profiles").upsert({
          id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
      } catch (err) {
        logger.error("Failed to sync profile:", err);
      }
    }
  }

  // Redirect to home page
  const origin = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
  return NextResponse.redirect(new URL("/", origin));
}
