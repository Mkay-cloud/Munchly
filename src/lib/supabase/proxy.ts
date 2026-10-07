import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every navigation so that a token
// about to expire gets renewed before Server Components run. This is the
// pattern Supabase recommends for Next.js's App Router: getClaims() (not
// getSession()) is what actually triggers and validates the refresh here.
//
// Takes the response the caller already decided on (a plain next(), or the
// locale rewrite/redirect from src/proxy.ts) and layers the refreshed auth
// cookies onto it, rather than building its own - this proxy only gets one
// response per request, shared with the i18n locale routing.
export async function updateSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getClaims();

  return response;
}
