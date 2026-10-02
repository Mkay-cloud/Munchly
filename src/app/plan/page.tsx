import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import PlanClient from "@/components/PlanClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Plan your week — Munchly",
  description: "Spin once for a full week of meals instead of deciding one at a time.",
  alternates: {
    canonical: "/plan",
  },
};

export default async function PlanPage() {
  const recipes = await getAllRecipes();
  return <PlanClient recipes={recipes} />;
}
