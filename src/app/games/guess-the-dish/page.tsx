import type { Metadata } from "next";
import GuessTheDishClient from "@/components/GuessTheDishClient";

export const metadata: Metadata = {
  title: "Guess the Dish — Munchly",
  description: "Name the dish from a few emoji - 10 dishes from around the world, 3 tries each.",
  alternates: {
    canonical: "/games/guess-the-dish",
  },
};

export default function GuessTheDishPage() {
  return <GuessTheDishClient />;
}
