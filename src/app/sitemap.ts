import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAllRecipes } from "@/sanity/queries";

const SITE_URL = "https://munchly.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getAllRecipes();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/recipes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/plan`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/shopping-list`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/fridge`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/suggest`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/games`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/games/ingredient-match`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/games/food-trivia`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    // /favorites and /profile are intentionally left out - both are marked
    // noindex (signed-in, user-specific) and have nothing useful for a
    // crawler to index.
  ];

  const recipeRoutes: MetadataRoute.Sitemap = recipes.map((r) => ({
    url: `${SITE_URL}/recipes/${r.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

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
  const communityRoutes: MetadataRoute.Sitemap = (communityRows ?? []).map((r) => ({
    url: `${SITE_URL}/community/${r.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...recipeRoutes, ...communityRoutes];
}
