import type { Recipe } from "@/sanity/queries";
import type { WeekPlan } from "@/lib/weekPlan";

export type ShoppingItem = {
  id: string; // normalized ingredient text, used as a stable key
  text: string; // original casing, from the first time this line appeared
  count: number; // how many planned days call for this exact line
};

function normalize(line: string): string {
  return line.trim().toLowerCase().replace(/\s+/g, " ");
}

// Builds the combined list straight from whichever recipes are on the
// current week plan - no quantities/units/aisles to merge on, since recipe
// ingredients are free-text lines in Sanity (see recipe.ts schema). Lines
// that are identical once trimmed/lowercased are folded into one entry with
// a count, so "2 eggs" on both Monday and Thursday shows as "2 eggs ×2"
// rather than two separate rows.
export function buildShoppingList(recipes: Recipe[], plan: WeekPlan | null): ShoppingItem[] {
  if (!plan) return [];
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const items = new Map<string, ShoppingItem>();

  for (const day of plan.days) {
    if (day.skip || !day.slug) continue;
    const recipe = bySlug.get(day.slug);
    if (!recipe) continue;
    for (const line of recipe.ingredients) {
      const text = line.trim();
      if (!text) continue;
      const id = normalize(text);
      const existing = items.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        items.set(id, { id, text, count: 1 });
      }
    }
  }

  return [...items.values()].sort((a, b) => a.text.localeCompare(b.text));
}

const CHECKED_KEY = "munchly_shopping_checked_v1";

// Checked-off state is kept separate from the list itself (and from the
// week plan) so re-planning the week, or just reloading, doesn't wipe out
// what someone already checked off while actually shopping.
export function loadCheckedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(CHECKED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function saveCheckedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHECKED_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage full or blocked - safe to ignore, checks just won't persist.
  }
}
