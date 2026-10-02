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
