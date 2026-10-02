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

  { id: "naan", topic: "World cuisines", difficulty: "Easy", question: "Naan, the soft oven-baked flatbread, is most associated with the cuisine of which country?", answer: "India", wrong: ["Greece", "Mexico", "Japan"] },
  { id: "tacos", topic: "World cuisines", difficulty: "Easy", question: "Tacos come from which country's cuisine?", answer: "Mexico", wrong: ["Spain", "Peru", "Argentina"] },
  { id: "baguette", topic: "World cuisines", difficulty: "Easy", question: "The long, crusty baguette is an everyday bread in which country?", answer: "France", wrong: ["Italy", "Belgium", "Switzerland"] },
  { id: "pad-thai", topic: "World cuisines", difficulty: "Medium", question: "Pad thai is stir-fried with which kind of noodles?", answer: "Rice noodles", wrong: ["Egg noodles", "Udon noodles", "Soba noodles"] },
  { id: "tagine", topic: "World cuisines", difficulty: "Medium", question: "Tagine is both a slow-cooked stew and the cone-lidded clay pot it's made in. Which country is it most associated with?", answer: "Morocco", wrong: ["Egypt", "Turkey", "Lebanon"] },
  { id: "feijoada", topic: "World cuisines", difficulty: "Medium", question: "Feijoada, a black bean and pork stew, is often called the national dish of which country?", answer: "Brazil", wrong: ["Portugal", "Mexico", "Cuba"] },
  { id: "goulash", topic: "World cuisines", difficulty: "Medium", question: "Goulash, a paprika-rich stew, comes from which country?", answer: "Hungary", wrong: ["Austria", "Poland", "Czech Republic"] },
  { id: "bobotie", topic: "World cuisines", difficulty: "Hard", question: "Bobotie, spiced baked mince with an egg custard topping, is a classic from which country?", answer: "South Africa", wrong: ["Nigeria", "Kenya", "Ghana"] },
  { id: "okonomiyaki", topic: "World cuisines", difficulty: "Hard", question: "Which Japanese savoury pancake has a name that roughly means \"grilled as you like it\"?", answer: "Okonomiyaki", wrong: ["Takoyaki", "Yakitori", "Tempura"] },
  { id: "laksa", topic: "World cuisines", difficulty: "Hard", question: "Laksa, a spicy coconut noodle soup, is most associated with which region?", answer: "Malaysia and Singapore", wrong: ["Japan and Korea", "India and Sri Lanka", "Vietnam and Laos"] },
  { id: "khachapuri", topic: "World cuisines", difficulty: "Hard", question: "Khachapuri, a boat-shaped cheese bread often topped with an egg, comes from which country?", answer: "Georgia", wrong: ["Armenia", "Turkey", "Greece"] },
  { id: "ful-medames", topic: "World cuisines", difficulty: "Hard", question: "Ful medames, stewed fava beans eaten for breakfast, is a staple of which country?", answer: "Egypt", wrong: ["Morocco", "Spain", "India"] },
  { id: "cuy", topic: "World cuisines", difficulty: "Hard", question: "In Peru, what is \"cuy\", traditionally eaten on special occasions?", answer: "Guinea pig", wrong: ["Alpaca", "Rabbit", "Duck"] },
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

  { id: "guacamole", topic: "Ingredients", difficulty: "Easy", question: "Guacamole is made mainly from which fruit?", answer: "Avocado", wrong: ["Lime", "Tomato", "Green pepper"] },
  { id: "turmeric", topic: "Ingredients", difficulty: "Easy", question: "Which spice gives most curry powders their bright yellow colour?", answer: "Turmeric", wrong: ["Paprika", "Cumin", "Coriander"] },
  { id: "raisins", topic: "Ingredients", difficulty: "Easy", question: "Raisins are dried…", answer: "Grapes", wrong: ["Plums", "Figs", "Cranberries"] },
  { id: "polenta", topic: "Ingredients", difficulty: "Medium", question: "Italian polenta is made from which ground grain?", answer: "Corn (maize)", wrong: ["Semolina", "Rice", "Barley"] },
  { id: "pesto", topic: "Ingredients", difficulty: "Medium", question: "Which nuts go into a classic pesto alla genovese?", answer: "Pine nuts", wrong: ["Walnuts", "Almonds", "Cashews"] },
  { id: "gruyere", topic: "Ingredients", difficulty: "Medium", question: "Which cheese, along with Emmental, is the classic base of a Swiss fondue?", answer: "Gruyère", wrong: ["Cheddar", "Mozzarella", "Feta"] },
  { id: "citrus", topic: "Ingredients", difficulty: "Medium", question: "Which of these is NOT a citrus fruit?", answer: "Pomegranate", wrong: ["Lime", "Grapefruit", "Kumquat"] },
  { id: "five-spice", topic: "Ingredients", difficulty: "Hard", question: "Star anise, cloves, cinnamon, Sichuan pepper and fennel make up which spice blend?", answer: "Chinese five-spice", wrong: ["Garam masala", "Ras el hanout", "Za'atar"] },
  { id: "mirin", topic: "Ingredients", difficulty: "Hard", question: "Mirin, used all the time in Japanese cooking, is a sweet…", answer: "Rice wine", wrong: ["Soy sauce", "Plum vinegar", "Seaweed broth"] },
  { id: "worcestershire", topic: "Ingredients", difficulty: "Hard", question: "Which small fish is a traditional ingredient in Worcestershire sauce?", answer: "Anchovies", wrong: ["Sardines", "Mackerel", "Herring"] },
  { id: "kombu", topic: "Ingredients", difficulty: "Hard", question: "Kombu, used to make Japanese dashi stock, is a type of…", answer: "Kelp (seaweed)", wrong: ["Mushroom", "Dried fish", "Fermented soybean"] },
  { id: "mace", topic: "Ingredients", difficulty: "Hard", question: "Which spice comes from the same fruit as nutmeg?", answer: "Mace", wrong: ["Allspice", "Cloves", "Cardamom"] },
  // --- Cooking techniques ---
  { id: "al-dente", topic: "Cooking techniques", difficulty: "Easy", question: "Pasta cooked \"al dente\" should be…", answer: "Firm to the bite", wrong: ["Very soft", "Tossed in butter", "Baked in the oven"] },
  { id: "julienne", topic: "Cooking techniques", difficulty: "Easy", question: "To \"julienne\" a carrot means cutting it into…", answer: "Thin matchsticks", wrong: ["Small cubes", "Thin rounds", "A fine mince"] },
  { id: "maillard", topic: "Cooking techniques", difficulty: "Medium", question: "The browning that gives seared steak and toast their rich flavour is called the…", answer: "Maillard reaction", wrong: ["Caramelisation", "Fermentation", "Emulsification"] },
  { id: "sous-vide", topic: "Cooking techniques", difficulty: "Medium", question: "\"Sous vide\" means cooking food…", answer: "Sealed in a bag in a water bath", wrong: ["Under a hot grill", "Over an open flame", "In a pressure cooker"] },
  { id: "roux", topic: "Cooking techniques", difficulty: "Medium", question: "A roux, used to thicken sauces, is made from…", answer: "Flour and fat", wrong: ["Eggs and sugar", "Milk and gelatine", "Cornflour and water"] },
  { id: "emulsion", topic: "Cooking techniques", difficulty: "Medium", question: "Mayonnaise is a classic example of a…", answer: "Emulsion", wrong: ["Reduction", "Brine", "Roux"] },
  { id: "blanching", topic: "Cooking techniques", difficulty: "Medium", question: "Blanching vegetables means…", answer: "Briefly boiling, then chilling in ice water", wrong: ["Frying quickly in a little hot oil", "Slow-roasting in the oven until soft", "Soaking overnight in salted vinegar"] },
  { id: "altitude", topic: "Cooking techniques", difficulty: "Hard", question: "High up a mountain, water boils at a ___ temperature than at sea level.", answer: "Lower", wrong: ["Higher", "Exactly the same", "Wildly random"] },
  { id: "choux", topic: "Cooking techniques", difficulty: "Hard", question: "Éclairs and profiteroles are made from which pastry?", answer: "Choux pastry", wrong: ["Puff pastry", "Shortcrust pastry", "Filo pastry"] },

  { id: "saute", topic: "Cooking techniques", difficulty: "Easy", question: "To \"sauté\" food means to cook it…", answer: "Quickly in a little hot fat", wrong: ["Slowly in lots of liquid", "Covered in the oven", "Over steam"] },
  { id: "whisk", topic: "Cooking techniques", difficulty: "Easy", question: "Which tool is best for beating air into egg whites?", answer: "A whisk", wrong: ["A ladle", "A rolling pin", "A slotted spoon"] },
  { id: "dice", topic: "Cooking techniques", difficulty: "Easy", question: "\"Dicing\" a vegetable means cutting it into…", answer: "Small cubes", wrong: ["Long strips", "Thin rounds", "Wedges"] },
  { id: "simmer", topic: "Cooking techniques", difficulty: "Easy", question: "What does it mean to \"simmer\" a sauce?", answer: "Cook it just below a full boil", wrong: ["Boil it as hard as possible", "Fry it in deep oil", "Cook it under a grill"] },
  { id: "marinate", topic: "Cooking techniques", difficulty: "Easy", question: "When you \"marinate\" meat, you…", answer: "Soak it in a flavourful liquid before cooking", wrong: ["Cook it slowly in a sealed vacuum bag", "Coat it in flour, egg and breadcrumbs", "Freeze it overnight to tenderise it"] },
  { id: "fold", topic: "Cooking techniques", difficulty: "Easy", question: "When a recipe says to \"fold\" in whipped egg whites, you mix them in…", answer: "Gently, to keep the air in", wrong: ["Fast, with an electric mixer", "Until thick and dense", "With the blade of a knife"] },
  { id: "zest", topic: "Cooking techniques", difficulty: "Easy", question: "\"Zesting\" a lemon means…", answer: "Grating off the thin coloured outer peel", wrong: ["Squeezing out all the juice", "Removing the seeds", "Cutting it into wedges"] },
  { id: "dry-heat", topic: "Cooking techniques", difficulty: "Medium", question: "Which of these is a dry-heat cooking method?", answer: "Roasting", wrong: ["Poaching", "Steaming", "Braising"] },
  { id: "deglaze", topic: "Cooking techniques", difficulty: "Medium", question: "\"Deglazing\" a pan means…", answer: "Adding liquid to lift the browned bits", wrong: ["Scrubbing it clean with coarse salt", "Coating it in a thin layer of oil", "Heating it empty until it starts to smoke"] },
  { id: "knead", topic: "Cooking techniques", difficulty: "Medium", question: "Why is bread dough kneaded?", answer: "To develop the gluten", wrong: ["To kill the yeast", "To squeeze out the air", "To melt the butter"] },
  { id: "braise", topic: "Cooking techniques", difficulty: "Medium", question: "Braising means cooking meat…", answer: "Browned, then slowly in a little liquid, covered", wrong: ["Very quickly over the highest possible heat", "Dipped in batter and fried in deep oil", "Raw, cured with salt and left to dry"] },
  { id: "mise-en-place", topic: "Cooking techniques", difficulty: "Medium", question: "In a professional kitchen, \"mise en place\" means…", answer: "Having everything prepped and ready before you cook", wrong: ["A classic French butter sauce for fish", "The art of arranging food neatly on the plate", "Slow-cooking food at a very low temperature"] },
  { id: "bechamel", topic: "Cooking techniques", difficulty: "Hard", question: "Which French \"mother sauce\" is made by thickening milk with a white roux?", answer: "Béchamel", wrong: ["Velouté", "Espagnole", "Hollandaise"] },
  { id: "temper-choc", topic: "Cooking techniques", difficulty: "Hard", question: "\"Tempering\" chocolate means…", answer: "Heating and cooling it so it sets glossy and snappy", wrong: ["Melting it into warm cream to make a ganache", "Adding a pinch of salt to bring out the flavour", "Freezing it solid, then grating it into curls"] },
  { id: "smoke-point", topic: "Cooking techniques", difficulty: "Hard", question: "A cooking oil's \"smoke point\" is…", answer: "The temperature at which it starts to break down and smoke", wrong: ["The temperature at which it turns solid and cloudy", "How long it keeps once the bottle is opened", "How smoky a flavour it gives to the food"] },
  { id: "chiffonade", topic: "Cooking techniques", difficulty: "Hard", question: "\"Chiffonade\" is a way of cutting…", answer: "Leafy herbs into thin ribbons", wrong: ["Onions into rings", "Potatoes into wedges", "Meat into cubes"] },
  // --- Food history ---
  { id: "sandwich", topic: "Food history", difficulty: "Easy", question: "The sandwich is named after an English…", answer: "Earl", wrong: ["King", "Chef", "Village"] },
  { id: "honey", topic: "Food history", difficulty: "Easy", question: "Which food has been found still edible in ancient Egyptian tombs?", answer: "Honey", wrong: ["Olive oil", "Bread", "Dates"] },
  { id: "coffee", topic: "Food history", difficulty: "Medium", question: "Which country is the world's largest producer of coffee?", answer: "Brazil", wrong: ["Colombia", "Vietnam", "Ethiopia"] },
  { id: "cacao", topic: "Food history", difficulty: "Medium", question: "The Aztecs used which beans as a form of money?", answer: "Cacao beans", wrong: ["Coffee beans", "Vanilla beans", "Kidney beans"] },
  { id: "carrots", topic: "Food history", difficulty: "Hard", question: "Orange carrots were popularised by growers in which country?", answer: "The Netherlands", wrong: ["France", "England", "Spain"] },
  { id: "ketchup", topic: "Food history", difficulty: "Hard", question: "Ketchup's ancestor, \"kê-tsiap\" from southern China, was a sauce made from…", answer: "Fermented fish", wrong: ["Tomatoes", "Mushrooms", "Plums"] },
  { id: "fortune-cookie", topic: "Food history", difficulty: "Hard", question: "Fortune cookies, served in many US Chinese restaurants, are generally traced back to bakers from…", answer: "Japan", wrong: ["China", "Hong Kong", "Singapore"] },
  { id: "hamburger", topic: "Food history", difficulty: "Easy", question: "The hamburger is named after a city in which country?", answer: "Germany", wrong: ["The USA", "Austria", "The Netherlands"] },
  { id: "popcorn", topic: "Food history", difficulty: "Easy", question: "Which snack was eaten in the Americas thousands of years before cinemas existed?", answer: "Popcorn", wrong: ["Potato chips", "Pretzels", "Nachos"] },
  { id: "tea", topic: "Food history", difficulty: "Easy", question: "Tea was first drunk in which country?", answer: "China", wrong: ["India", "England", "Japan"] },
  { id: "afternoon-tea", topic: "Food history", difficulty: "Easy", question: "The tradition of \"afternoon tea\" with scones and sandwiches comes from which country?", answer: "England", wrong: ["France", "Germany", "Spain"] },
  { id: "limey", topic: "Food history", difficulty: "Easy", question: "British sailors were nicknamed \"limeys\" because they ate citrus to prevent which illness?", answer: "Scurvy", wrong: ["Seasickness", "Malaria", "Gout"] },
  { id: "salary", topic: "Food history", difficulty: "Easy", question: "The word \"salary\" is often said to come from the Latin word for which seasoning?", answer: "Salt", wrong: ["Pepper", "Saffron", "Sugar"] },
  { id: "irish-famine", topic: "Food history", difficulty: "Easy", question: "The failure of which crop caused Ireland's Great Famine in the 1840s?", answer: "Potatoes", wrong: ["Wheat", "Oats", "Cabbage"] },
  { id: "jack-o-lantern", topic: "Food history", difficulty: "Medium", question: "Before pumpkins, what were the first jack-o'-lanterns in Ireland carved from?", answer: "Turnips", wrong: ["Apples", "Melons", "Onions"] },
  { id: "smorgasbord", topic: "Food history", difficulty: "Medium", question: "The smörgåsbord buffet comes from which country?", answer: "Sweden", wrong: ["Norway", "Denmark", "Finland"] },
  { id: "black-pepper", topic: "Food history", difficulty: "Medium", question: "Which spice was once so valuable it was nicknamed \"black gold\" and even used to pay rent?", answer: "Black pepper", wrong: ["Nutmeg", "Cumin", "Vanilla"] },
  { id: "instant-noodles", topic: "Food history", difficulty: "Medium", question: "Instant noodles were invented in 1958 in which country?", answer: "Japan", wrong: ["China", "South Korea", "The USA"] },
  { id: "nutella", topic: "Food history", difficulty: "Medium", question: "Which chocolate-hazelnut spread grew out of an Italian recipe from when cocoa was scarce after World War II?", answer: "Nutella", wrong: ["Biscoff", "Marmite", "Ovaltine"] },
  { id: "ice-cream-cone", topic: "Food history", difficulty: "Medium", question: "The ice-cream cone became famous at which 1904 event?", answer: "The St. Louis World's Fair", wrong: ["The Paris Olympics", "The London Great Exhibition", "The opening of Coney Island"] },
  { id: "chillies-columbus", topic: "Food history", difficulty: "Medium", question: "Chilli peppers reached Europe from the Americas through whose voyages?", answer: "Christopher Columbus", wrong: ["Marco Polo", "Vasco da Gama", "Captain James Cook"] },
  { id: "coca-cola", topic: "Food history", difficulty: "Medium", question: "Which drink was first created by pharmacist John Pemberton in 1886?", answer: "Coca-Cola", wrong: ["Pepsi", "Dr Pepper", "Root beer"] },
  { id: "garum", topic: "Food history", difficulty: "Hard", question: "Garum, a hugely popular seasoning in ancient Rome, was a…", answer: "Fermented fish sauce", wrong: ["Spiced honey wine", "Herb and olive paste", "Salted bread dough"] },
  { id: "caesar-salad", topic: "Food history", difficulty: "Hard", question: "The Caesar salad is named after…", answer: "Caesar Cardini, a restaurateur in Tijuana", wrong: ["Julius Caesar", "A Roman emperor's chef", "A Caesar Street café in Rome"] },
  { id: "peach-melba", topic: "Food history", difficulty: "Hard", question: "Peach Melba, the dessert, was named after a famous…", answer: "Opera singer", wrong: ["Painter", "Queen", "Racehorse"] },
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
