import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import FridgeClient from "@/components/FridgeClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cook from your fridge — Munchly",
  description: "Tell us what's in the kitchen and we'll find what you can make with it.",
  alternates: {
    canonical: "/fridge",
  },
};

export default async function FridgePage() {
  const recipes = await getAllRecipes();
  return <FridgeClient recipes={recipes} />;
}
