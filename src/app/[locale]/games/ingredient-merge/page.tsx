import type { Metadata } from "next";
import IngredientMergeClient from "@/components/IngredientMergeClient";

export const metadata: Metadata = {
  title: "Ingredient Merge — Munchly",
  description: "Merge matching ingredients into finished dishes and serve every order.",
  alternates: {
    canonical: "/games/ingredient-merge",
  },
};

export default function IngredientMergePage() {
  return <IngredientMergeClient />;
}
