import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import FridgeClient from "@/components/FridgeClient";
import { translateRecipes } from "@/lib/contentTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cook from your fridge — Munchly",
  description: "Tell us what's in the kitchen and we'll find what you can make with it.",
  alternates: {
    canonical: "/fridge",
  },
};

export default async function FridgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const recipes = await translateRecipes(await getAllRecipes(), locale);
  return <FridgeClient recipes={recipes} />;
}
