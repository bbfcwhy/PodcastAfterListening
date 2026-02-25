import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Minimal thenable chain that resolves to empty data. Used when Supabase env is missing (e.g. E2E). */
function emptyChain(options?: { count?: boolean; single?: boolean }) {
  const value = options?.count
    ? { count: 0, error: null }
    : options?.single
      ? { data: null, error: null }
      : { data: [], error: null };
  const p = Promise.resolve(value);
  const chain = {
    select: (_a?: string, b?: { count?: string; head?: boolean }) =>
      emptyChain({ ...options, count: b?.count === "exact" }),
    eq: () => chain,
    or: () => chain,
    gte: () => chain,
    lte: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (onFulfilled?: (v: unknown) => unknown, onRejected?: (v: unknown) => unknown) =>
      p.then(onFulfilled, onRejected),
    catch: (onRejected?: (v: unknown) => unknown) => p.catch(onRejected),
  };
  return chain;
}

/** Mock Supabase client when env is missing (e.g. E2E without .env). Avoids createServerClient(undefined, ...) throwing. */
function createMockServerClient(): Awaited<ReturnType<typeof createServerClient>> {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => emptyChain(),
    rpc: () => Promise.resolve({ data: [], error: null }),
  } as Awaited<ReturnType<typeof createServerClient>>;
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return createMockServerClient();
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/** Service-role client that bypasses RLS. Use only for system-level operations. */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for service client");
  }

  return createSupabaseClient(url, serviceKey);
}
