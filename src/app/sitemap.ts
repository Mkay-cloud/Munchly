import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAllRecipes } from "@/sanity/queries";
import { getPublishedBlogPosts } from "@/sanity/blogQueries";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";

const SITE_URL = "https://munchly.online";

function localizedUrl(path: string, locale: Locale): string {
  // The default locale isn't prefixed in the URL (see i18n/locales.ts), so
  // "" + path is the bare English URL and every other locale gets "/es",
  // "/fr", etc. in front of it.
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

// Every locale variant of `path` as hreflang alternates, plus x-default
// pointing at the English version - lets Google show each visitor's
// language's URL instead of treating the translations as duplicates of the
// English page. Call this on routes that actually have translated content;
// for the community pages (user-submitted, English-only) the routes below
// just list a single English entry with no alternates.
function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = localizedUrl(path, locale);
  }
  languages["x-default"] = localizedUrl(path, DEFAULT_LOCALE);
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getAllRecipes();
  const blogPosts = await getPublishedBlogPosts();

  const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/recipes", changeFrequency: "daily", priority: 0.9 },
    { path: "/plan", changeFrequency: "monthly", priority: 0.7 },
    { path: "/shopping-list", changeFrequency: "monthly", priority: 0.6 },
    { path: "/fridge", changeFrequency: "monthly", priority: 0.7 },
    { path: "/community", changeFrequency: "daily", priority: 0.7 },
    { path: "/suggest", changeFrequency: "monthly", priority: 0.5 },
    { path: "/games", changeFrequency: "monthly", priority: 0.5 },
    { path: "/games/ingredient-match", changeFrequency: "monthly", priority: 0.5 },
    { path: "/games/food-trivia", changeFrequency: "monthly", priority: 0.5 },
    { path: "/games/ingredient-merge", changeFrequency: "monthly", priority: 0.5 },
    { path: "/games/guess-the-dish", changeFrequency: "monthly", priority: 0.5 },
    { path: "/blog", changeFrequency: "daily", priority: 0.7 },
    { path: "/about", changeFrequency: "yearly", priority: 0.4 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
    { path: "/download", changeFrequency: "yearly", priority: 0.3 },
    // /privacy and /terms are deliberately English-only (not translated),
    // so they're listed once below with no locale alternates, same as the
    // community routes.
    // /favorites and /profile are intentionally left out entirely - both
    // are marked noindex (signed-in, user-specific) and have nothing
    // useful for a crawler to index.
  ];

  // One entry per (static route x locale), each carrying hreflang
  // alternates to every other locale of that same route.
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(path, locale),
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    }))
  );

  const englishOnlyRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const recipeRoutes: MetadataRoute.Sitemap = recipes.flatMap((r) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(`/recipes/${r.slug}`, locale),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages: languageAlternates(`/recipes/${r.slug}`) },
    }))
  );

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(`/${p.slug}`, locale),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: languageAlternates(`/${p.slug}`) },
    }))
  );

  // A plain anonymous client (not the cookie-bound server one) - this route
  // doesn't need the viewer's session, and using cookies() here would force
  // the whole sitemap to render dynamically on every request instead of
  // being cached.
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: communityRows } = await supabase
    .from("community_recipes")
    .select("id")
    .eq("status", "approved");
  // Community recipes are user-submitted and not machine-translated, so
  // unlike the routes above they get a single English entry each, no
  // locale alternates.
  const communityRoutes: MetadataRoute.Sitemap = (communityRows ?? []).map((r) => ({
    url: `${SITE_URL}/community/${r.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...englishOnlyRoutes, ...recipeRoutes, ...blogRoutes, ...communityRoutes];
}
