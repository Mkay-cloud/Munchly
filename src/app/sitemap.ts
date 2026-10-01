import type { MetadataRoute } from "next";
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
    // /favorites is intentionally left out - it's marked noindex (signed-in,
    // user-specific) and has nothing useful for a crawler to index.
  ];

  const recipeRoutes: MetadataRoute.Sitemap = recipes.map((r) => ({
    url: `${SITE_URL}/recipes/${r.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...recipeRoutes];
}
