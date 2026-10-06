import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the middleware.ts file convention to proxy.ts - this
// is the site's single proxy entry point, so it has to do both jobs that
// used to be two separate concerns: resolve/route the visitor's locale,
// then refresh their Supabase auth session on top of whatever response
// that produced. Only one of these files is allowed per project.

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Routes this proxy should never touch: API handlers, the Sanity Studio,
// the admin review tool, the legacy WordPress image proxy, and anything
// that looks like a static file (has a dot in the last segment -
// favicon.ico, robots.txt, images, etc). Next's internal /_next/ assets are
// excluded via the matcher config below instead.
function isExcludedPath(pathname: string): boolean {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/wp-content/")
  ) {
    return true;
  }
  const lastSegment = pathname.split("/").pop() || "";
  return lastSegment.includes(".");
}

// Picks the best supported locale out of an Accept-Language header like
// "fr-FR,fr;q=0.9,en;q=0.8" - a lightweight stand-in for a full
// content-negotiation library, good enough for an 8-locale list.
function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0].toLowerCase())
    .map((tag) => tag.split("-")[0]);
  for (const candidate of candidates) {
    if (isLocale(candidate)) return candidate;
  }
  return DEFAULT_LOCALE;
}

// Resolves the locale response for this request (next/rewrite/redirect,
// with the NEXT_LOCALE cookie set), or null if this path is excluded from
// locale routing entirely.
function resolveLocaleResponse(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  if (isExcludedPath(pathname)) {
    return null;
  }

  const segments = pathname.split("/");
  const firstSegment = segments[1] || "";

  if (isLocale(firstSegment)) {
    // Already on a prefixed URL (e.g. someone followed a /es/... link
    // directly, or the language switcher just navigated here) - let it
    // through as-is, and refresh the cookie so this choice sticks.
    const res = NextResponse.next();
    res.cookies.set(COOKIE_NAME, firstSegment, { maxAge: COOKIE_MAX_AGE, path: "/" });
    return res;
  }

  // No locale prefix in the URL - work out which locale this visitor
  // should see: their previous explicit choice (cookie) first, then their
  // browser's language, then English.
  const cookieLocale = req.cookies.get(COOKIE_NAME)?.value;
  const locale =
    cookieLocale && isLocale(cookieLocale)
      ? cookieLocale
      : negotiateLocale(req.headers.get("accept-language"));

  if (locale === DEFAULT_LOCALE) {
    // English stays unprefixed in the address bar ("/recipes", not
    // "/en/recipes") - internally rewrite to the [locale] route so it
    // still matches the file structure under src/app/[locale]/.
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    const res = NextResponse.rewrite(url);
    res.cookies.set(COOKIE_NAME, DEFAULT_LOCALE, { maxAge: COOKIE_MAX_AGE, path: "/" });
    return res;
  }

  // Any other locale gets a real redirect, so the address bar reflects the
  // language ("/fr/recipes") and it's bookmarkable/shareable as such.
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_NAME, locale, { maxAge: COOKIE_MAX_AGE, path: "/" });
  return res;
}

export async function proxy(request: NextRequest) {
  // A redirect can't also carry the refreshed Supabase cookies usefully -
  // the browser follows it straight to the new URL, which hits this proxy
  // again and refreshes the session then. So only layer the auth refresh
  // onto locale responses that aren't themselves a redirect.
  const localeResponse = resolveLocaleResponse(request);
  if (localeResponse && localeResponse.headers.get("location")) {
    return localeResponse;
  }

  const response = localeResponse ?? NextResponse.next({ request });
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
