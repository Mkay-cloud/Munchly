import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key - bypasses Row
// Level Security entirely. Never import this into a client component, and
// never use it for anything user-specific (favorites, community recipes,
// etc. all go through the cookie-bound server client in server.ts, which
// respects RLS). This one exists only to read/write the
// content_translations cache table (see scripts/supabase-content-translations.sql),
// which has no RLS write policies of its own for exactly that reason.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
