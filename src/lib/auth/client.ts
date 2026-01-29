import { createClient as createBrowserClient } from "@/lib/supabase/client";

export type AuthProvider = "google" | "facebook" | "github";

export async function signIn(provider: AuthProvider, redirectTo?: string) {
  // Use browser client for OAuth flow
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
