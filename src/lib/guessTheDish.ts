// Dish bank + answer matching for Guess the Dish (/games/guess-the-dish).
// Hardcoded and fully client-side, like the other games. No photos - each
// dish is an emoji clue plus a one-line hint.

import { BANK, type Region } from "./guessTheDishBank";

export type { Region };

export type Dish = {
  id: string;
  name: string;
  region: Region;
  // The clue shown up front.
  emoji: string;
  // One line, revealed on request or after the first wrong guess. Never
  // contains the dish's name.
  hint: string;
  // Other names people genuinely use for it - all accepted as correct.
  aliases?: string[];
};

export const DISHES_PER_ROUND = 10;
export const MAX_TRIES = 3;

export const REGIONS = Object.keys(BANK) as Region[];

export const DISHES: Dish[] = REGIONS.flatMap((region) =>
  BANK[region].map(([id, name, emoji, hint, aliases]) => ({ id, name, region, emoji, hint, aliases }))
);

// What a round draws from: one cuisine, or "all" of them together.
export type Category = "all" | Region;
export const CATEGORIES: Category[] = ["all", ...REGIONS];

export function dishesIn(category: Category): Dish[] {
  return category === "all" ? DISHES : DISHES.filter((d) => d.region === category);
}

export const categoryLabel = (c: Category) => (c === "all" ? "All cuisines" : c);

// --- Answer matching ----------------------------------------------------------

// "tacos" -> "taco", "dishes" -> "dish", "pancakes" -> "pancake"; leaves
// "hummus", "couscous" and short words alone.
function singular(w: string): string {
  if (w.length <= 3) return w;
  if (/(ch|sh|x|z|s)es$/.test(w)) return w.slice(0, -2);
  if (/[^su]s$/.test(w)) return w.slice(0, -1);
  return w;
}

// Lowercase, strip accents and punctuation, "&" -> "and", collapse spaces,
// drop a leading "a"/"an"/"the", and make each word singular -
// so "The Crème Brûlée!" and "creme brulee" compare equal, as do "taco"
// and "tacos".
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(a|an|the) /, "")
    .split(" ")
    .map(singular)
    .join(" ");
}

// Edit distance where swapping two neighbouring letters counts as one typo
// ("bahn mi" for "banh mi"), not two - optimal string alignment distance.
function distance(a: string, b: string): number {
  if (a === b) return 0;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// How many typos to forgive, by answer length: none for very short names
// (so "pho" doesn't accept "pie"), one for typical words, two for long names.
function allowedTypos(len: number): number {
  if (len <= 4) return 0;
  if (len <= 8) return 1;
  return 2;
}

const accepted = (d: Dish) => [d.name, ...(d.aliases ?? [])].map(normalize);

// Every accepted name of every dish, so a guess that *is* another dish is
// never waved through as a typo of this one.
const ALL_NAMES = new Map<string, string>();
for (const d of DISHES) for (const n of accepted(d)) ALL_NAMES.set(n, d.id);

export function isCorrectGuess(guess: string, dish: Dish): boolean {
  const g = normalize(guess);
  if (!g) return false;
  const owner = ALL_NAMES.get(g);
  if (owner !== undefined) return owner === dish.id;
  return accepted(dish).some((a) => {
    // Spaces don't matter ("padthai", "hot dog" / "hotdog").
    const ga = g.replace(/ /g, ""), aa = a.replace(/ /g, "");
    if (ga === aa) return true;
    return distance(ga, aa) <= allowedTypos(aa.length);
  });
}

// --- Rounds --------------------------------------------------------------------

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function dealRound(category: Category = "all", count: number = DISHES_PER_ROUND): Dish[] {
  return shuffle(dishesIn(category)).slice(0, count);
}

export function resultMessage(score: number, total: number): { title: string; body: string } {
  if (score === total) return { title: "Perfect plate! 🏆", body: "Ten for ten - you know your food." };
  if (score >= Math.ceil(total * 0.7)) return { title: "Master taster! 🧑‍🍳", body: "You can spot a dish from a few emoji. Impressive." };
  if (score >= Math.ceil(total * 0.4)) return { title: "Tasty work! 🍽️", body: "A good feed - a few more rounds and you'll clear the table." };
  return { title: "Hungry for more! 🥄", body: "Some of these are tricky. Have another go!" };
}

// --- Best score ----------------------------------------------------------------
// localStorage only (no sign-in), so it's a personal best for this
// browser/device. One key per category (plus "all"), so an Italian-only best
// never overwrites the all-cuisines one - same idea as Ingredient Match's
// per-level best times. "All" keeps the original key.

export function bestKey(category: Category): string {
  if (category === "all") return "munchly_dish_best_v1";
  return `munchly_dish_best_${category.toLowerCase().replace(/[^a-z]+/g, "_")}_v1`;
}
const ALL_BEST_KEYS = new Set(CATEGORIES.map(bestKey));
const BEST_EVENT = "munchly-dish-best-change";

export function loadBestScore(category: Category): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(bestKey(category));
    const n = raw === null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= 0 && n <= DISHES_PER_ROUND ? n : null;
  } catch {
    return null;
  }
}

// Saves `score` if it beats the stored best. The first finished round always
// sets a best (even 0, so there's something to beat) but only counts as a
// *new best* worth celebrating if it scored at least one.
export function recordScore(category: Category, score: number): boolean {
  const best = loadBestScore(category);
  if (best !== null && score <= best) return false;
  try {
    window.localStorage.setItem(bestKey(category), String(score));
  } catch {
    // Storage blocked - still celebrate this visit.
  }
  window.dispatchEvent(new Event(BEST_EVENT));
  return score > 0;
}

export function subscribeBestScore(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && ALL_BEST_KEYS.has(e.key)) onChange();
  };
  window.addEventListener(BEST_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BEST_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
