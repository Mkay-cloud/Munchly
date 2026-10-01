import type { Recipe } from "@/sanity/queries";

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const PLAN_MOODS = ["Anything", "Comfort", "Quick", "Spicy", "Sweet"] as const;
export type PlanMood = (typeof PLAN_MOODS)[number];

export type DayPlan = {
  day: WeekDay;
  slug: string | null;
  skip: boolean;
};

export type WeekPlan = {
  days: DayPlan[];
  generatedAt: string;
};

const STORAGE_KEY = "munchly_week_plan_v1";

// No sign-in for this feature (unlike Favorites) - the plan lives only in
// this browser via localStorage, not in Supabase. That's a deliberate
// trade-off for lower friction, so every read/write here is wrapped
// defensively: localStorage can throw (private browsing, blocked storage)
// and this must never crash the page over it.
export function loadWeekPlan(): WeekPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeekPlan;
    if (!Array.isArray(parsed?.days) || parsed.days.length !== WEEK_DAYS.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWeekPlan(plan: WeekPlan): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Storage full or blocked - the plan still works for this session,
    // it just won't persist across reloads. Not worth surfacing an error.
  }
}

export function clearWeekPlan(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same as above - safe to ignore.
  }
}

function moodPool(recipes: Recipe[], mood: PlanMood): Recipe[] {
  if (mood === "Anything") return recipes;
  const matching = recipes.filter((r) => r.moods.includes(mood));
  // Fall back to the full library if a mood is too narrow to fill a week
  // without heavy repeats.
  return matching.length >= WEEK_DAYS.length ? matching : recipes;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateWeekPlan(recipes: Recipe[], mood: PlanMood): WeekPlan {
  const pool = shuffle(moodPool(recipes, mood));
  const days: DayPlan[] = WEEK_DAYS.map((day, i) => ({
    day,
    // Wrap around if the pool is smaller than a week - better a repeat
    // than an empty day.
    slug: pool.length ? pool[i % pool.length].slug : null,
    skip: false,
  }));
  return { days, generatedAt: new Date().toISOString() };
}

// Reroll a single day, preferring a recipe not already used elsewhere in
// the week so a week rarely shows the same dish twice.
export function rerollDay(plan: WeekPlan, dayIndex: number, recipes: Recipe[], mood: PlanMood): WeekPlan {
  const pool = moodPool(recipes, mood);
  if (pool.length === 0) return plan;
  const usedSlugs = new Set(plan.days.filter((_, i) => i !== dayIndex).map((d) => d.slug));
  const fresh = pool.filter((r) => !usedSlugs.has(r.slug));
  const choices = fresh.length ? fresh : pool;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  const days = plan.days.map((d, i) => (i === dayIndex ? { ...d, slug: pick.slug, skip: false } : d));
  return { ...plan, days };
}

export function toggleSkipDay(plan: WeekPlan, dayIndex: number, recipes: Recipe[], mood: PlanMood): WeekPlan {
  const current = plan.days[dayIndex];
  if (!current.skip) {
    // Marking a day as "eating out" - just flip the flag, keep the slug
    // around in case they un-skip it.
    const days = plan.days.map((d, i) => (i === dayIndex ? { ...d, skip: true } : d));
    return { ...plan, days };
  }
  // Un-skipping: give the day a recipe again (rerollDay already handles
  // clearing `skip`).
  return rerollDay(plan, dayIndex, recipes, mood);
}
