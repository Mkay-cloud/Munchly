import type { Recipe } from "@/sanity/queries";

const PANTRY_KEY = "munchly_fridge_pantry_v1";

// Mirrors the weekPlan.ts / shoppingList.ts pattern: client-only state,
// saved in the browser, nothing sent anywhere, every read/write wrapped
// defensively since localStorage can throw (private browsing, blocked).
export function loadPantry(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PANTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function savePantry(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked - the pantry still works for this visit, it
    // just won't be there next time. Not worth surfacing an error.
  }
}

export function addPantryItem(items: string[], raw: string): string[] {
  const text = raw.trim();
  if (!text) return items;
  const exists = items.some((i) => i.toLowerCase() === text.toLowerCase());
  if (exists) return items;
  return [...items, text];
}

export function removePantryItem(items: string[], item: string): string[] {
  return items.filter((i) => i !== item);
}

// --- Matching ---
//
// Recipe ingredients are free-text lines in Sanity ("500g chicken thighs,
// sliced") with no structured name/quantity/unit - so matching a pantry
// item against a line is inherently fuzzy. The approach: split both into
// lowercase word tokens, and consider a pantry word "present" in a line if
// it appears exactly, or as the singular/plural of a word in the line
// (word+"s" or word+"es"). That catches "egg" matching "2 eggs" and
// "tomato" matching "3 tomatoes, diced" without the false positives a
// looser prefix match would cause (e.g. "egg" should NOT match
// "eggplant").
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z]+/g) ?? [];
}

function wordsMatch(pantryWord: string, lineWord: string): boolean {
  if (pantryWord === lineWord) return true;
  if (pantryWord + "s" === lineWord) return true;
  if (pantryWord + "es" === lineWord) return true;
  if (lineWord + "s" === pantryWord) return true;
  return false;
}

function pantryItemInLine(pantryItem: string, lineTokens: string[]): boolean {
  const pantryWords = tokenize(pantryItem);
  if (pantryWords.length === 0) return false;
  return pantryWords.every((pw) => lineTokens.some((lw) => wordsMatch(pw, lw)));
}

export type FridgeMatch = {
  recipe: Recipe;
  matched: number;
  total: number;
  missing: string[];
};

// Ranks every recipe that has at least one ingredient line overlapping the
// pantry, best match first. Recipes with zero overlap, or no ingredients
// listed at all, are left out entirely - "ranked" still means relevant.
export function matchFridgeRecipes(recipes: Recipe[], pantry: string[]): FridgeMatch[] {
  if (pantry.length === 0) return [];
  const results: FridgeMatch[] = [];

  for (const recipe of recipes) {
    if (recipe.ingredients.length === 0) continue;
    let matched = 0;
    const missing: string[] = [];
    for (const line of recipe.ingredients) {
      const tokens = tokenize(line);
      const found = pantry.some((item) => pantryItemInLine(item, tokens));
      if (found) {
        matched += 1;
      } else {
        missing.push(line);
      }
    }
    if (matched > 0) {
      results.push({ recipe, matched, total: recipe.ingredients.length, missing });
    }
  }

  results.sort((a, b) => {
    const ratioA = a.matched / a.total;
    const ratioB = b.matched / b.total;
    if (ratioB !== ratioA) return ratioB - ratioA;
    if (b.matched !== a.matched) return b.matched - a.matched;
    return a.recipe.title.localeCompare(b.recipe.title);
  });

  return results;
}
