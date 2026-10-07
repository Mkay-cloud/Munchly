import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import ShoppingListClient from "@/components/ShoppingListClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shopping list — Munchly",
  description: "Your planned week's meals, turned into one shopping list.",
  alternates: {
    canonical: "/shopping-list",
  },
};

export default async function ShoppingListPage() {
  const recipes = await getAllRecipes();
  return <ShoppingListClient recipes={recipes} />;
}
