import type { Metadata } from "next";
import IngredientMatchClient from "@/components/IngredientMatchClient";

export const metadata: Metadata = {
  title: "Ingredient Match — Munchly",
  description: "A quick memory game: flip the cards and match every ingredient pair.",
  alternates: {
    canonical: "/games/ingredient-match",
  },
};

export default function IngredientMatchPage() {
  return <IngredientMatchClient />;
}
