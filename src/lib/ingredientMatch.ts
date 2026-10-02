// Deck-building helpers for the Ingredient Match memory game. Hardcoded
// ingredient list for now - deliberately not pulled from the Sanity recipe
// data, to keep this first version small and fully client-side.

export type Ingredient = { name: string; emoji: string };

export type MatchCard = {
  // Unique per card (each ingredient has two cards).
  id: number;
  // Shared by the two cards of a pair - this is what "matching" compares.
  pairKey: string;
  name: string;
  emoji: string;
};

export const PAIR_COUNT = 8;

// A bigger pool than PAIR_COUNT so each new game draws a different mix.
const INGREDIENTS: Ingredient[] = [
  { name: "Tomato", emoji: "🍅" },
  { name: "Garlic", emoji: "🧄" },
  { name: "Cheese", emoji: "🧀" },
  { name: "Onion", emoji: "🧅" },
  { name: "Carrot", emoji: "🥕" },
  { name: "Egg", emoji: "🥚" },
  { name: "Lemon", emoji: "🍋" },
  { name: "Avocado", emoji: "🥑" },
  { name: "Chilli", emoji: "🌶️" },
  { name: "Mushroom", emoji: "🍄" },
  { name: "Potato", emoji: "🥔" },
  { name: "Broccoli", emoji: "🥦" },
  { name: "Corn", emoji: "🌽" },
  { name: "Butter", emoji: "🧈" },
  { name: "Rice", emoji: "🍚" },
  { name: "Bread", emoji: "🍞" },
];

// Fisher-Yates - returns a new array, leaves the input alone.
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildDeck(pairCount: number = PAIR_COUNT): MatchCard[] {
  const picked = shuffle(INGREDIENTS).slice(0, pairCount);
  const cards = picked.flatMap((ing) => [
    { pairKey: ing.name, name: ing.name, emoji: ing.emoji },
    { pairKey: ing.name, name: ing.name, emoji: ing.emoji },
  ]);
  return shuffle(cards).map((c, i) => ({ ...c, id: i }));
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Best times get a tenth of a second ("42.3s", "1:05.3") - whole seconds
// would make a slightly faster game look like a tie with the old best.
export function formatBestTime(ms: number): string {
  const tenths = Math.max(0, Math.floor(ms / 100));
  const minutes = Math.floor(tenths / 600);
  const seconds = ((tenths % 600) / 10).toFixed(1);
  return minutes === 0 ? `${seconds}s` : `${minutes}:${seconds.padStart(4, "0")}`;
}

// --- Best time -------------------------------------------------------------
// Stored in this browser's localStorage only - there's no sign-in for the
// games, so it's a personal best for this browser/device, not a leaderboard.

const BEST_TIME_KEY = "munchly_match_best_v1";
const BEST_TIME_EVENT = "munchly-match-best-change";

export function loadBestTime(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BEST_TIME_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

// Saves `ms` if it beats the stored best (or there isn't one yet). Returns
// whether it was a new best.
export function recordTime(ms: number): boolean {
  const best = loadBestTime();
  if (best !== null && ms >= best) return false;
  try {
    window.localStorage.setItem(BEST_TIME_KEY, String(Math.round(ms)));
  } catch {
    // Storage blocked - still count it as a best for this visit's message,
    // it just won't be remembered.
  }
  window.dispatchEvent(new Event(BEST_TIME_EVENT));
  return true;
}

// For useSyncExternalStore (avoids a hydration mismatch, since the server
// can't know the stored value).
export function subscribeBestTime(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === BEST_TIME_KEY) onChange();
  };
  window.addEventListener(BEST_TIME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BEST_TIME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
