import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "Spin the wheel",
    browseRecipes: "Browse recipes",
    planYourWeek: "Plan your week",
    shoppingList: "Shopping list",
    cookFromFridge: "Cook from your fridge",
    communityRecipes: "Community recipes",
    suggestARecipe: "Suggest a recipe",
    games: "Games",
    blog: "Blog",
    myFavorites: "My favorites",
    myProfile: "My profile",
    about: "About",
    contact: "Contact",
    munchlyGroup: "Munchly",
    accountGroup: "Your account",
    infoGroup: "Info",
  },
  hero: {
    headline: "Can't decide what to eat? Spin for it.",
    subhead:
      "Pick a mood, give the wheel a spin, and Munchly lands on a real meal with a recipe to match. No more scrolling through a hundred tabs while you get hungrier.",
    spinTheWheel: "Spin the wheel →",
    browseRecipes: "Browse recipes",
    planYourWeek: "Plan your week",
    suggestARecipe: "Suggest a recipe",
    playFoodGames: "Play food games",
    readTheBlog: "Read the blog",
    freeToUse: "Free to use. No account needed to spin.",
  },
  search: {
    placeholder: "Search recipes, blog posts, games, pages...",
    hint: "Type at least 2 characters to search the whole site.",
    searching: "Searching...",
    noResults: "No matches for “{query}”.",
    close: "Esc",
    ariaLabel: "Search Munchly",
    groupRecipes: "Recipes",
    groupPosts: "Blog posts",
    groupGames: "Games",
    groupPages: "Pages",
  },
  blogSection: {
    title: "From the blog",
    subtitle: "Recipes, kitchen notes and cooking stories, fresh off the stove.",
    readMore: "Read the blog →",
  },
  gamesSection: {
    title: "Play food games",
    subtitle:
      "Four quick games for when you need a break from deciding what's for dinner. Free, and no account needed.",
    seeAll: "See all games →",
  },
  localeSwitcher: {
    label: "Language",
  },
  common: {
    backToMunchly: "← Back to Munchly",
  },
  recipesPage: {
    title: "All recipes",
    countOne: "{count} recipe in the library so far.",
    countOther: "{count} recipes in the library so far.",
    empty: "No recipes yet — check back soon.",
  },
  recipeDetailPage: {
    ingredients: "Ingredients",
    instructions: "Instructions",
  },
  gamesPage: {
    title: "Games",
    subtitle: "Quick little food games for when you need a break from deciding what's for dinner. No account needed.",
    play: "Play",
  },
  aboutPage: {
    title: "About Munchly",
    paragraph1: "Munchly started from one very ordinary problem: standing in front of the fridge every night, not hungry for “nothing in particular,” and not wanting to make a single decision about it. So instead of another recipe site to scroll through, Munchly is built around one button: spin the wheel, get an answer, go eat.",
    paragraph2: "From there it's grown into a small toolkit for the rest of the week too — browse the full recipe library when you want to pick something yourself, plan out your meals for the week ahead, turn that plan straight into a shopping list, and see what you can cook from whatever's already in your fridge.",
    paragraph3Before: "Munchly is an independent, still-growing project. It's built by one person, so new recipes and features show up in small steps rather than all at once. If there's something you'd love to see next, the ",
    contactLink: "contact page",
    paragraph3After: " goes straight to a real inbox, not a form that disappears into the void.",
  },
  contactPage: {
    title: "Get in touch",
    subtitle: "Found a bug, have a recipe to suggest, or just want to say hi? It goes to a real person.",
    emailLabel: "Email",
    note: "Munchly is run by one person, so replies aren't instant — but every message gets read.",
  },
};

export default messages;
