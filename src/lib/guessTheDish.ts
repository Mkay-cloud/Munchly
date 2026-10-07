// Rounds, multiple-choice options and best scores for Guess the Dish
// (/games/guess-the-dish). Hardcoded and fully client-side, like the other
// games. No photos - each dish is an emoji clue plus a one-line hint; the
// dishes themselves live in guessTheDishBank.ts.

import { BANK, type Region } from "./guessTheDishBank";

export type { Region };

export type Dish = {
  id: string;
  name: string;
  region: Region;
  // The clue shown up front.
  emoji: string;
  // One line, revealed on request (or once the question is answered). Never
  // contains the dish's name.
  hint: string;
  // Other names people genuinely use for it. Used so a wrong option can
  // never be another name for the right dish.
  aliases?: string[];
};

export const DISHES_PER_ROUND = 10;

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

// --- Answer options ------------------------------------------------------------

// Lowercase, strip accents and punctuation, "&" -> "and", collapse spaces.
// Only used to compare dish names when picking wrong options.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

// Every name a dish is known by (its name plus aliases), normalised.
const acceptedNames = (d: Dish) => new Set([d.name, ...(d.aliases ?? [])].map(normalize));

// Could `other` be mistaken for a second right answer to `dish`? True if
// any name or alias of one is also a name or alias of the other.
export function sharesAName(dish: Dish, other: Dish): boolean {
  const mine = acceptedNames(dish);
  for (const n of acceptedNames(other)) if (mine.has(n)) return true;
  return false;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type DealtDish = Dish & {
  // The dish's own name plus three wrong ones, in random order.
  options: string[];
};

// Three wrong options for `dish`, drawn fresh at random from `pool` (the
// cuisine being played, or the whole bank for "All"), so the same dish gets
// different company every round. Never the dish itself, never a dish that
// shares any name or alias with it, never two options with the same name.
// Falls back to the whole bank if the pool is too small.
export function pickWrongOptions(dish: Dish, pool: Dish[]): string[] {
  const picked: string[] = [];
  const used = new Set([normalize(dish.name)]);
  for (const source of [pool, DISHES]) {
    for (const other of shuffle(source)) {
      if (picked.length === 3) return picked;
      if (other.id === dish.id || sharesAName(dish, other)) continue;
      const key = normalize(other.name);
      if (used.has(key)) continue;
      used.add(key);
      picked.push(other.name);
    }
  }
  return picked;
}

export function dealRound(category: Category = "all", count: number = DISHES_PER_ROUND): DealtDish[] {
  const pool = dishesIn(category);
  return shuffle(pool)
    .slice(0, count)
    .map((d) => ({ ...d, options: shuffle([d.name, ...pickWrongOptions(d, pool)]) }));
}

export type ResultTier = "perfect" | "master" | "tasty" | "hungry";

export function resultTier(score: number, total: number): ResultTier {
  if (score === total) return "perfect";
  if (score >= Math.ceil(total * 0.7)) return "master";
  if (score >= Math.ceil(total * 0.4)) return "tasty";
  return "hungry";
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
