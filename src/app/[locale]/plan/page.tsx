import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import PlanClient from "@/components/PlanClient";
import { translateRecipes } from "@/lib/contentTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Plan your week — Munchly",
  description: "Spin once for a full week of meals instead of deciding one at a time.",
  alternates: {
    canonical: "/plan",
  },
};

export default async function PlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const recipes = await translateRecipes(await getAllRecipes(), locale);
  return <PlanClient recipes={recipes} />;
}
