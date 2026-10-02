// Question bank + helpers for the Food Trivia quiz (/games/food-trivia).
// Hardcoded and fully client-side, same as Ingredient Match.

export type Topic = "World cuisines" | "Ingredients" | "Cooking techniques" | "Food history";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type TriviaQuestion = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  // Exactly one of these is right - always written first here for
  // readability; the order is shuffled when a quiz is dealt.
  answer: string;
  wrong: [string, string, string];
};

export type DealtQuestion = TriviaQuestion & {
  // `answer` plus the three wrong options, in random order.
  options: string[];
};

export const QUESTIONS_PER_QUIZ = 10;

export const QUESTIONS: TriviaQuestion[] = [
  // --- World cuisines ---
  { id: "kimchi", topic: "World cuisines", difficulty: "Easy", question: "Kimchi is a classic fermented side dish from which country?", answer: "Korea", wrong: ["Japan", "China", "Thailand"] },
  { id: "pho", topic: "World cuisines", difficulty: "Easy", question: "Pho, a noodle soup with herbs and broth, comes from which country?", answer: "Vietnam", wrong: ["Thailand", "Cambodia", "Laos"] },
  { id: "jollof", topic: "World cuisines", difficulty: "Easy", question: "Jollof rice is a much-loved staple across which region?", answer: "West Africa", wrong: ["East Africa", "North Africa", "Southern Africa"] },
  { id: "tom-yum", topic: "World cuisines", difficulty: "Easy", question: "Tom yum, a hot and sour soup, is from which country?", answer: "Thailand", wrong: ["Malaysia", "Indonesia", "The Philippines"] },
  { id: "margherita", topic: "World cuisines", difficulty: "Easy", question: "Pizza Margherita is most associated with which Italian city?", answer: "Naples", wrong: ["Rome", "Milan", "Florence"] },
  { id: "paella", topic: "World cuisines", difficulty: "Medium", question: "Paella originally comes from which region of Spain?", answer: "Valencia", wrong: ["Andalusia", "Catalonia", "Galicia"] },
  { id: "injera", topic: "World cuisines", difficulty: "Medium", question: "Ethiopian injera, a spongy flatbread, is traditionally made from which grain?", answer: "Teff", wrong: ["Millet", "Sorghum", "Barley"] },
  { id: "mole", topic: "World cuisines", difficulty: "Medium", question: "Which Mexican sauce famously includes chocolate among its ingredients?", answer: "Mole poblano", wrong: ["Salsa verde", "Pico de gallo", "Salsa roja"] },
  { id: "ceviche", topic: "World cuisines", difficulty: "Medium", question: "Ceviche \"cooks\" raw fish using what?", answer: "Citrus juice", wrong: ["Salt", "Smoke", "Hot oil"] },
  { id: "sushi-rice", topic: "World cuisines", difficulty: "Medium", question: "Sushi rice is seasoned mainly with which ingredient?", answer: "Rice vinegar", wrong: ["Soy sauce", "Fish sauce", "Sesame oil"] },
  { id: "halloumi", topic: "World cuisines", difficulty: "Medium", question: "Halloumi, the grilling cheese, comes from which country?", answer: "Cyprus", wrong: ["Greece", "Turkey", "Lebanon"] },
  { id: "croque", topic: "World cuisines", difficulty: "Easy", question: "A croque monsieur is a French toasted sandwich of ham and what?", answer: "Cheese", wrong: ["Egg", "Tomato", "Mushroom"] },

  // --- Ingredients ---
  { id: "hummus", topic: "Ingredients", difficulty: "Easy", question: "What is the main ingredient in traditional hummus?", answer: "Chickpeas", wrong: ["Lentils", "Fava beans", "White beans"] },
  { id: "marzipan", topic: "Ingredients", difficulty: "Easy", question: "Marzipan is made mainly from which nut?", answer: "Almonds", wrong: ["Hazelnuts", "Pistachios", "Cashews"] },
  { id: "tofu", topic: "Ingredients", difficulty: "Easy", question: "Tofu is made from which beans?", answer: "Soybeans", wrong: ["Chickpeas", "Black beans", "Mung beans"] },
  { id: "cavendish", topic: "Ingredients", difficulty: "Easy", question: "Cavendish is the most common variety of which fruit?", answer: "Banana", wrong: ["Apple", "Mango", "Pineapple"] },
  { id: "tomato", topic: "Ingredients", difficulty: "Easy", question: "Botanically speaking, a tomato is a…", answer: "Fruit", wrong: ["Vegetable", "Legume", "Root"] },
  { id: "sake", topic: "Ingredients", difficulty: "Easy", question: "Japanese sake is brewed from which grain?", answer: "Rice", wrong: ["Barley", "Wheat", "Millet"] },
  { id: "saffron", topic: "Ingredients", difficulty: "Medium", question: "Saffron comes from which part of the crocus flower?", answer: "The stigmas", wrong: ["The petals", "The seeds", "The roots"] },
  { id: "capsaicin", topic: "Ingredients", difficulty: "Medium", question: "Which compound gives chilli peppers their heat?", answer: "Capsaicin", wrong: ["Piperine", "Allicin", "Gingerol"] },
  { id: "cinnamon", topic: "Ingredients", difficulty: "Medium", question: "Which spice is made from the dried bark of a tree?", answer: "Cinnamon", wrong: ["Nutmeg", "Cloves", "Cardamom"] },
  { id: "peanut", topic: "Ingredients", difficulty: "Medium", question: "Which of these is actually a legume, not a nut?", answer: "Peanut", wrong: ["Almond", "Walnut", "Cashew"] },
  { id: "wasabi", topic: "Ingredients", difficulty: "Medium", question: "The \"wasabi\" served in many restaurants outside Japan is mostly made from what?", answer: "Horseradish", wrong: ["Green chilli", "Ginger", "Mustard greens"] },
  { id: "parmigiano", topic: "Ingredients", difficulty: "Medium", question: "Parmigiano Reggiano is made from which milk?", answer: "Cow's milk", wrong: ["Sheep's milk", "Goat's milk", "Buffalo milk"] },
  { id: "vanilla", topic: "Ingredients", difficulty: "Hard", question: "Vanilla pods come from what kind of plant?", answer: "An orchid", wrong: ["A palm", "A lily", "A bean plant"] },

  // --- Cooking techniques ---
  { id: "al-dente", topic: "Cooking techniques", difficulty: "Easy", question: "Pasta cooked \"al dente\" should be…", answer: "Firm to the bite", wrong: ["Very soft", "Tossed in butter", "Baked in the oven"] },
  { id: "julienne", topic: "Cooking techniques", difficulty: "Easy", question: "To \"julienne\" a carrot means cutting it into…", answer: "Thin matchsticks", wrong: ["Small cubes", "Thin rounds", "A fine mince"] },
  { id: "maillard", topic: "Cooking techniques", difficulty: "Medium", question: "The browning that gives seared steak and toast their rich flavour is called the…", answer: "Maillard reaction", wrong: ["Caramelisation", "Fermentation", "Emulsification"] },
  { id: "sous-vide", topic: "Cooking techniques", difficulty: "Medium", question: "\"Sous vide\" means cooking food…", answer: "Sealed in a bag in a water bath", wrong: ["Under a hot grill", "Over an open flame", "In a pressure cooker"] },
  { id: "roux", topic: "Cooking techniques", difficulty: "Medium", question: "A roux, used to thicken sauces, is made from…", answer: "Flour and fat", wrong: ["Eggs and sugar", "Milk and gelatine", "Cornflour and water"] },
  { id: "emulsion", topic: "Cooking techniques", difficulty: "Medium", question: "Mayonnaise is a classic example of a…", answer: "Emulsion", wrong: ["Reduction", "Brine", "Roux"] },
  { id: "blanching", topic: "Cooking techniques", difficulty: "Medium", question: "Blanching vegetables means…", answer: "Briefly boiling, then chilling in ice water", wrong: ["Frying in a little oil", "Slow-roasting until soft", "Pickling in vinegar"] },
  { id: "altitude", topic: "Cooking techniques", difficulty: "Hard", question: "High up a mountain, water boils at a ___ temperature than at sea level.", answer: "Lower", wrong: ["Higher", "Exactly the same", "Wildly random"] },
  { id: "choux", topic: "Cooking techniques", difficulty: "Hard", question: "Éclairs and profiteroles are made from which pastry?", answer: "Choux pastry", wrong: ["Puff pastry", "Shortcrust pastry", "Filo pastry"] },

  // --- Food history ---
  { id: "sandwich", topic: "Food history", difficulty: "Easy", question: "The sandwich is named after an English…", answer: "Earl", wrong: ["King", "Chef", "Village"] },
  { id: "honey", topic: "Food history", difficulty: "Easy", question: "Which food has been found still edible in ancient Egyptian tombs?", answer: "Honey", wrong: ["Olive oil", "Bread", "Dates"] },
  { id: "coffee", topic: "Food history", difficulty: "Medium", question: "Which country is the world's largest producer of coffee?", answer: "Brazil", wrong: ["Colombia", "Vietnam", "Ethiopia"] },
  { id: "cacao", topic: "Food history", difficulty: "Medium", question: "The Aztecs used which beans as a form of money?", answer: "Cacao beans", wrong: ["Coffee beans", "Vanilla beans", "Kidney beans"] },
  { id: "carrots", topic: "Food history", difficulty: "Hard", question: "Orange carrots were popularised by growers in which country?", answer: "The Netherlands", wrong: ["France", "England", "Spain"] },
  { id: "ketchup", topic: "Food history", difficulty: "Hard", question: "Ketchup's ancestor, \"kê-tsiap\" from southern China, was a sauce made from…", answer: "Fermented fish", wrong: ["Tomatoes", "Mushrooms", "Plums"] },
  { id: "fortune-cookie", topic: "Food history", difficulty: "Hard", question: "Fortune cookies, served in many US Chinese restaurants, are generally traced back to bakers from…", answer: "Japan", wrong: ["China", "Hong Kong", "Singapore"] },
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

// A fresh quiz: QUESTIONS_PER_QUIZ distinct questions in random order, each
// with its answer options shuffled so the right one isn't always first.
export function dealQuiz(count: number = QUESTIONS_PER_QUIZ): DealtQuestion[] {
  return shuffle(QUESTIONS)
    .slice(0, count)
    .map((q) => ({ ...q, options: shuffle([q.answer, ...q.wrong]) }));
}

// End-screen message, scaled to how well it went.
export function resultMessage(score: number, total: number): { title: string; body: string } {
  if (score === total) return { title: "Perfect score! 🏆", body: "Every single one. You could teach this class." };
  if (score >= Math.ceil(total * 0.7)) return { title: "Kitchen genius! 🧑‍🍳", body: "Seriously impressive food knowledge." };
  if (score >= Math.ceil(total * 0.4)) return { title: "Nicely done! 🍽️", body: "A solid showing - a couple more rounds and you'll ace it." };
  return { title: "Good effort! 🥄", body: "Every chef starts somewhere. Have another go!" };
}

// --- Best score -----------------------------------------------------------
// localStorage only (no sign-in), so it's a personal best for this
// browser/device. Separate key from Ingredient Match's best times.

const BEST_SCORE_KEY = "munchly_trivia_best_v1";
const BEST_SCORE_EVENT = "munchly-trivia-best-change";

export function loadBestScore(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= 0 && n <= QUESTIONS_PER_QUIZ ? n : null;
  } catch {
    return null;
  }
}

// Saves `score` if it beats the stored best. The very first finished quiz
// always sets a best (even 0/10, so there's something to beat), but only
// counts as a *new best* worth celebrating if it scored at least one.
export function recordScore(score: number): boolean {
  const best = loadBestScore();
  if (best !== null && score <= best) return false;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Storage blocked - still celebrate this visit, it just won't stick.
  }
  window.dispatchEvent(new Event(BEST_SCORE_EVENT));
  return score > 0;
}

// For useSyncExternalStore - avoids a hydration mismatch, and stays in sync
// with other tabs.
export function subscribeBestScore(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === BEST_SCORE_KEY) onChange();
  };
  window.addEventListener(BEST_SCORE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BEST_SCORE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
