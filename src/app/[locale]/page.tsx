import HomeClient from "@/components/HomeClient";
import { getAllRecipes } from "@/sanity/queries";
import { getLatestBlogPosts } from "@/sanity/blogQueries";
import { translateRecipes, translateBlogPostSummaries } from "@/lib/contentTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const revalidate = 60;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [rawRecipes, rawPosts] = await Promise.all([getAllRecipes(), getLatestBlogPosts(3)]);
  const [recipes, posts] = await Promise.all([
    translateRecipes(rawRecipes, locale),
    translateBlogPostSummaries(rawPosts, locale),
  ]);
  return <HomeClient recipes={recipes} posts={posts} />;
}
