import { createBrowserClient } from "@supabase/ssr";

/** 當 Supabase env 未設定時回傳的 mock，避免 createBrowserClient(undefined, ...) 拋錯。 */
function createMockBrowserClient(): ReturnType<typeof createBrowserClient> {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({
        data: { provider: null, url: null },
        error: { message: "Supabase not configured" },
      }),
    },
    from: () => ({
      select: () => ({ then: (fn: (v: unknown) => unknown) => fn({ data: [], error: null }), catch: () => ({}) }),
    }),
  } as ReturnType<typeof createBrowserClient>;
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    return createMockBrowserClient();
  }
  return createBrowserClient(url, key);
}
