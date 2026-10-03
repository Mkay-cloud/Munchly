// The food games, in display order. Shared by /games and the home page's
// games section so the two lists can't drift apart.

export type GameEntry = { href: string; title: string; blurb: string; emoji: string; meta: string };

export const GAMES: GameEntry[] = [
  {
    href: "/games/ingredient-match",
    title: "Ingredient Match",
    blurb: "Flip the cards and find every matching pair of ingredients.",
    emoji: "🧄",
    meta: "Memory · 3 levels",
  },
  {
    href: "/games/food-trivia",
    title: "Food Trivia",
    blurb: "Ten quick questions on cuisines, ingredients, techniques and food history.",
    emoji: "🧠",
    meta: "Quiz · 10 questions",
  },
  {
    href: "/games/ingredient-merge",
    title: "Ingredient Merge",
    blurb: "Merge matching ingredients up the recipe chain and serve every order.",
    emoji: "🍝",
    meta: "Puzzle · 3 recipes",
  },
  {
    href: "/games/guess-the-dish",
    title: "Guess the Dish",
    blurb: "Name the dish from a handful of emoji - dishes from all over the world.",
    emoji: "🌮",
    meta: "Guessing · 10 dishes",
  },
];
