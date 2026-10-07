import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import ShoppingListClient from "@/components/ShoppingListClient";
import { translateRecipes } from "@/lib/contentTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shopping list — Munchly",
  description: "Your planned week's meals, turned into one shopping list.",
  alternates: {
    canonical: "/shopping-list",
  },
};

export default async function ShoppingListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const recipes = await translateRecipes(await getAllRecipes(), locale);
  return <ShoppingListClient recipes={recipes} />;
}
