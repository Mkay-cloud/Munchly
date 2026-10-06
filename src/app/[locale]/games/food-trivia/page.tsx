import type { Metadata } from "next";
import FoodTriviaClient from "@/components/FoodTriviaClient";

export const metadata: Metadata = {
  title: "Food Trivia — Munchly",
  description: "A quick 10-question food quiz: world cuisines, ingredients, cooking techniques and food history.",
  alternates: {
    canonical: "/games/food-trivia",
  },
};

export default function FoodTriviaPage() {
  return <FoodTriviaClient />;
}
