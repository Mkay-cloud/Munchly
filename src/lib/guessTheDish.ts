// Dish bank + answer matching for Guess the Dish (/games/guess-the-dish).
// Hardcoded and fully client-side, like the other games. No photos - each
// dish is an emoji clue plus a one-line hint.

export type Region = "Italian" | "Asian" | "African" | "Latin American" | "North American" | "European" | "Middle Eastern";

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

export const DISHES: Dish[] = [
  // --- Italian ---
  { id: "bolognese", name: "Spaghetti bolognese", region: "Italian", emoji: "🍝🥩🍅", hint: "Long pasta strands under a slow-cooked meat and tomato ragù named after a northern Italian city.", aliases: ["spag bol", "bolognese", "spaghetti bolognaise", "bolognaise"] },
  { id: "margherita", name: "Pizza Margherita", region: "Italian", emoji: "🍕🍅🧀🌿", hint: "Naples' classic in the colours of the Italian flag: tomato, mozzarella and basil.", aliases: ["margherita pizza", "margherita", "pizza", "margarita pizza"] },
  { id: "lasagna", name: "Lasagna", region: "Italian", emoji: "🧀🥩🍅🧀", hint: "Flat pasta sheets layered with meat sauce, béchamel and cheese, then baked.", aliases: ["lasagne"] },
  { id: "risotto", name: "Risotto", region: "Italian", emoji: "🍚🧀🍄🥄", hint: "Short-grain rice stirred slowly with hot stock until creamy.", aliases: ["mushroom risotto"] },
  { id: "tiramisu", name: "Tiramisu", region: "Italian", emoji: "☕🍰🍫", hint: "Coffee-soaked sponge fingers layered with mascarpone cream and dusted with cocoa.", aliases: ["tiramisù"] },

  // --- Asian ---
  { id: "sushi", name: "Sushi", region: "Asian", emoji: "🍣🍚🐟", hint: "Japanese vinegared rice topped or rolled with raw fish.", aliases: ["sushi roll", "maki", "nigiri"] },
  { id: "ramen", name: "Ramen", region: "Asian", emoji: "🍜🥚🐖", hint: "Japanese wheat-noodle soup with rich broth, sliced pork and a soft-boiled egg.", aliases: ["ramen noodles"] },
  { id: "pad-thai", name: "Pad Thai", region: "Asian", emoji: "🍜🥜🦐🍋", hint: "Stir-fried rice noodles with peanuts, shrimp and lime - Bangkok street-food royalty." },
  { id: "pho", name: "Pho", region: "Asian", emoji: "🍜🐄🌿🌶️", hint: "Vietnamese beef broth with rice noodles and a pile of fresh herbs.", aliases: ["phở", "pho bo"] },
  { id: "dumplings", name: "Dumplings", region: "Asian", emoji: "🥟🥢", hint: "Pleated little dough parcels with a savoury filling, steamed or pan-fried.", aliases: ["dumpling", "gyoza", "jiaozi", "potstickers", "dim sum"] },
  { id: "fried-rice", name: "Fried rice", region: "Asian", emoji: "🍳🍚🥕🧅", hint: "Yesterday's rice tossed in a very hot wok with egg and vegetables.", aliases: ["egg fried rice"] },
  { id: "butter-chicken", name: "Butter chicken", region: "Asian", emoji: "🍗🧈🍅🍛", hint: "A mild, creamy tomato curry that first came out of a Delhi restaurant.", aliases: ["murgh makhani", "chicken makhani"] },
  { id: "biryani", name: "Biryani", region: "Asian", emoji: "🍚🍗🌶️🧅", hint: "Fragrant rice layered with spiced meat and slow-cooked in a sealed pot.", aliases: ["biriyani", "chicken biryani", "briyani"] },
  { id: "bibimbap", name: "Bibimbap", region: "Asian", emoji: "🍚🥚🥕🌶️🥢", hint: "Korean rice bowl topped with vegetables, a fried egg and red chilli paste - stir it all up." },
  { id: "peking-duck", name: "Peking duck", region: "Asian", emoji: "🦆🥞🥒", hint: "Crispy-skinned roast duck rolled up in thin pancakes with cucumber and hoisin.", aliases: ["beijing duck"] },
  { id: "samosa", name: "Samosa", region: "Asian", emoji: "🔺🥔🌶️", hint: "Crisp triangular pastry stuffed with spiced potato and peas.", aliases: ["samosas"] },

  // --- African ---
  { id: "jollof", name: "Jollof rice", region: "African", emoji: "🍚🍅🌶️🔥", hint: "Smoky, tomatoey party rice that West African countries love to argue over.", aliases: ["jollof"] },
  { id: "bunny-chow", name: "Bunny chow", region: "African", emoji: "🍞🍛", hint: "A hollowed-out loaf of bread filled with curry, from Durban in South Africa." },
  { id: "tagine", name: "Tagine", region: "African", emoji: "🍲🥕🍋🫒", hint: "Moroccan stew slow-cooked in a clay pot with a tall cone-shaped lid.", aliases: ["tajine", "chicken tagine"] },
  { id: "doro-wat", name: "Doro wat", region: "African", emoji: "🍗🌶️🥚🫓", hint: "Fiery Ethiopian chicken stew with hard-boiled eggs, scooped up with spongy injera.", aliases: ["doro wot", "doro wet"] },
  { id: "bobotie", name: "Bobotie", region: "African", emoji: "🥩🥚🍛", hint: "South African spiced mince baked under a golden egg custard." },
  { id: "shakshuka", name: "Shakshuka", region: "African", emoji: "🍳🍅🌶️", hint: "Eggs poached in a bubbling spiced tomato and pepper sauce, from North Africa.", aliases: ["shakshouka", "chakchouka"] },
  { id: "suya", name: "Suya", region: "African", emoji: "🍢🥜🌶️", hint: "Nigerian street-grilled meat skewers coated in a spicy peanut rub." },
  { id: "fufu", name: "Fufu", region: "African", emoji: "🍠🥣", hint: "Pounded, stretchy dough of cassava or yam, torn off by hand and dipped in soup.", aliases: ["foofoo", "foufou"] },

  // --- Latin American ---
  { id: "tacos", name: "Tacos", region: "Latin American", emoji: "🌮🥩🧅🌿", hint: "Small folded corn tortillas with fillings like grilled meat, onion and coriander.", aliases: ["taco"] },
  { id: "burrito", name: "Burrito", region: "Latin American", emoji: "🌯🍚🧀🥑", hint: "A big flour tortilla wrapped tight around rice, beans, meat and cheese." },
  { id: "guacamole", name: "Guacamole", region: "Latin American", emoji: "🥑🍋🧅🌶️", hint: "Mashed avocado dip with lime, onion and chilli.", aliases: ["guac"] },
  { id: "ceviche", name: "Ceviche", region: "Latin American", emoji: "🐟🍋🧅🌶️", hint: "Raw fish \"cooked\" in lime juice - Peru's national dish.", aliases: ["cebiche", "seviche"] },
  { id: "empanadas", name: "Empanadas", region: "Latin American", emoji: "🥧🥩🫒", hint: "Half-moon pastries filled with meat, baked or fried all over Latin America.", aliases: ["empanada"] },
  { id: "feijoada", name: "Feijoada", region: "Latin American", emoji: "🍲🐖🍚", hint: "Brazil's slow-cooked black bean and pork stew, served with rice and orange slices." },
  { id: "arepas", name: "Arepas", region: "Latin American", emoji: "🫓🧀🥑", hint: "Venezuelan and Colombian corn cakes, split open and stuffed.", aliases: ["arepa"] },
  { id: "churros", name: "Churros", region: "Latin American", emoji: "🍩🍫☕", hint: "Ridged sticks of fried dough rolled in cinnamon sugar and dunked in chocolate.", aliases: ["churro"] },

  // --- North American ---
  { id: "cheeseburger", name: "Cheeseburger", region: "North American", emoji: "🍔🧀🥬🍅", hint: "A grilled beef patty with melted cheese, lettuce and tomato in a bun.", aliases: ["burger", "hamburger", "cheese burger"] },
  { id: "hot-dog", name: "Hot dog", region: "North American", emoji: "🌭🧅", hint: "A sausage in a soft long bun - a baseball-stadium favourite.", aliases: ["hotdog", "frankfurter"] },
  { id: "mac-cheese", name: "Mac and cheese", region: "North American", emoji: "🧀🧀🥣🔥", hint: "Elbow pasta baked in a gooey cheese sauce.", aliases: ["macaroni and cheese", "mac n cheese", "macaroni cheese", "mac & cheese"] },
  { id: "pancakes", name: "Pancakes", region: "North American", emoji: "🥞🧈🍯", hint: "A fluffy breakfast stack with butter and maple syrup.", aliases: ["pancake", "hotcakes"] },
  { id: "apple-pie", name: "Apple pie", region: "North American", emoji: "🍎🥧", hint: "Cinnamon-spiced fruit under a golden lattice crust - \"as American as\" it." },
  { id: "fried-chicken", name: "Fried chicken", region: "North American", emoji: "🍗🧂🔥", hint: "Buttermilk-soaked chicken pieces in a crunchy seasoned coating, deep-fried.", aliases: ["southern fried chicken"] },
  { id: "clam-chowder", name: "Clam chowder", region: "North American", emoji: "🐚🥔🥣", hint: "Creamy New England soup with shellfish and potatoes.", aliases: ["chowder", "new england clam chowder"] },
  { id: "poutine", name: "Poutine", region: "North American", emoji: "🍟🧀🍖", hint: "Canadian fries smothered in cheese curds and gravy." },

  // --- European ---
  { id: "fish-chips", name: "Fish and chips", region: "European", emoji: "🐟🍟🍋", hint: "Britain's favourite takeaway: battered white fish with thick-cut fries.", aliases: ["fish n chips", "fish & chips", "fish chips"] },
  { id: "croissant", name: "Croissant", region: "European", emoji: "🥐☕", hint: "A flaky, buttery, crescent-shaped French pastry.", aliases: ["croissants"] },
  { id: "paella", name: "Paella", region: "European", emoji: "🥘🦐🍚🍋", hint: "Saffron rice cooked in a wide shallow pan with seafood or chicken, from Valencia." },
  { id: "fondue", name: "Fondue", region: "European", emoji: "🫕🧀🍞", hint: "A communal Swiss pot of melted cheese for dipping bread.", aliases: ["cheese fondue"] },
  { id: "moussaka", name: "Moussaka", region: "European", emoji: "🍆🥩🧀", hint: "Greek bake of layered aubergine, spiced meat and béchamel.", aliases: ["musaka"] },
  { id: "creme-brulee", name: "Crème brûlée", region: "European", emoji: "🍮🔥🥄", hint: "Rich vanilla custard under a thin layer of sugar caramelised with a torch.", aliases: ["creme brulee", "burnt cream"] },
  { id: "goulash", name: "Goulash", region: "European", emoji: "🥘🌶️🥩", hint: "Hungarian beef stew, deep red with paprika.", aliases: ["gulyas", "gulasch"] },

  // --- Middle Eastern ---
  { id: "falafel", name: "Falafel", region: "Middle Eastern", emoji: "🧆🥙", hint: "Deep-fried balls of ground chickpeas and herbs, tucked into pitta.", aliases: ["felafel", "falafels"] },
  { id: "shawarma", name: "Shawarma", region: "Middle Eastern", emoji: "🥙🍗🔥", hint: "Meat stacked on a slowly turning spit, shaved off and wrapped in flatbread.", aliases: ["shwarma", "chicken shawarma"] },
  { id: "hummus", name: "Hummus", region: "Middle Eastern", emoji: "🧄🍋🥣", hint: "Smooth dip of chickpeas, tahini, lemon and garlic.", aliases: ["houmous", "humus", "hommus"] },
];

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

// Plain Levenshtein edit distance.
function distance(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
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

export function dealRound(count: number = DISHES_PER_ROUND): Dish[] {
  return shuffle(DISHES).slice(0, count);
}

export function resultMessage(score: number, total: number): { title: string; body: string } {
  if (score === total) return { title: "Perfect plate! 🏆", body: "Ten for ten - you know your food." };
  if (score >= Math.ceil(total * 0.7)) return { title: "Master taster! 🧑‍🍳", body: "You can spot a dish from a few emoji. Impressive." };
  if (score >= Math.ceil(total * 0.4)) return { title: "Tasty work! 🍽️", body: "A good feed - a few more rounds and you'll clear the table." };
  return { title: "Hungry for more! 🥄", body: "Some of these are tricky. Have another go!" };
}

// --- Best score ----------------------------------------------------------------
// localStorage only (no sign-in), so it's a personal best for this
// browser/device. Separate key from the other games.

const BEST_KEY = "munchly_dish_best_v1";
const BEST_EVENT = "munchly-dish-best-change";

export function loadBestScore(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= 0 && n <= DISHES_PER_ROUND ? n : null;
  } catch {
    return null;
  }
}

// Saves `score` if it beats the stored best. The first finished round always
// sets a best (even 0, so there's something to beat) but only counts as a
// *new best* worth celebrating if it scored at least one.
export function recordScore(score: number): boolean {
  const best = loadBestScore();
  if (best !== null && score <= best) return false;
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Storage blocked - still celebrate this visit.
  }
  window.dispatchEvent(new Event(BEST_EVENT));
  return score > 0;
}

export function subscribeBestScore(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === BEST_KEY) onChange();
  };
  window.addEventListener(BEST_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BEST_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
