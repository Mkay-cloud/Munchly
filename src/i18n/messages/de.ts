import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "Rad drehen",
    browseRecipes: "Rezepte durchsuchen",
    planYourWeek: "Woche planen",
    shoppingList: "Einkaufsliste",
    cookFromFridge: "Aus dem Kühlschrank kochen",
    communityRecipes: "Rezepte der Community",
    suggestARecipe: "Rezept vorschlagen",
    games: "Spiele",
    blog: "Blog",
    myFavorites: "Meine Favoriten",
    myProfile: "Mein Profil",
    about: "Über uns",
    contact: "Kontakt",
    munchlyGroup: "Munchly",
    accountGroup: "Dein Konto",
    infoGroup: "Infos",
  },
  hero: {
    headline: "Weißt du nicht, was du essen sollst? Dreh das Rad.",
    subhead:
      "Wähle eine Stimmung, dreh das Rad, und Munchly schlägt dir ein echtes Gericht samt Rezept vor. Kein Scrollen durch hundert Tabs mehr, während der Hunger wächst.",
    spinTheWheel: "Rad drehen →",
    browseRecipes: "Rezepte durchsuchen",
    planYourWeek: "Woche planen",
    suggestARecipe: "Rezept vorschlagen",
    playFoodGames: "Essensspiele spielen",
    readTheBlog: "Blog lesen",
    freeToUse: "Kostenlos. Kein Konto zum Drehen nötig.",
  },
  search: {
    placeholder: "Rezepte, Blogbeiträge, Spiele, Seiten durchsuchen...",
    hint: "Gib mindestens 2 Zeichen ein, um die ganze Website zu durchsuchen.",
    searching: "Suche läuft...",
    noResults: "Keine Treffer für „{query}“.",
    close: "Esc",
    ariaLabel: "Munchly durchsuchen",
    groupRecipes: "Rezepte",
    groupPosts: "Blogbeiträge",
    groupGames: "Spiele",
    groupPages: "Seiten",
  },
  blogSection: {
    title: "Aus dem Blog",
    subtitle: "Rezepte, Küchennotizen und Kochgeschichten, frisch vom Herd.",
    readMore: "Blog lesen →",
  },
  gamesSection: {
    title: "Essensspiele spielen",
    subtitle:
      "Vier schnelle Spiele für eine Pause von der Frage, was es zum Abendessen gibt. Kostenlos, kein Konto nötig.",
    seeAll: "Alle Spiele ansehen →",
  },
  localeSwitcher: {
    label: "Sprache",
  },
  common: {
    backToMunchly: "← Zurück zu Munchly",
  },
  recipesPage: {
    title: "Alle Rezepte",
    countOne: "{count} Rezept bisher in der Bibliothek.",
    countOther: "{count} Rezepte bisher in der Bibliothek.",
    empty: "Noch keine Rezepte — schau bald wieder vorbei.",
  },
  recipeDetailPage: {
    ingredients: "Zutaten",
    instructions: "Zubereitung",
  },
  gamesPage: {
    title: "Spiele",
    subtitle: "Kleine Food-Spiele für eine Pause, wenn du nicht weißt, was es zum Abendessen geben soll. Kein Konto nötig.",
    play: "Spielen",
  },
  aboutPage: {
    title: "Über Munchly",
    paragraph1: "Munchly entstand aus einem ganz gewöhnlichen Problem: jeden Abend vor dem Kühlschrank stehen, auf „nichts Bestimmtes“ Appetit haben und keine einzige Entscheidung darüber treffen wollen. Statt einer weiteren Rezeptseite zum endlosen Scrollen basiert Munchly deshalb auf einem einzigen Knopf: Rad drehen, Antwort bekommen, essen gehen.",
    paragraph2: "Daraus ist inzwischen auch ein kleines Werkzeugset für den Rest der Woche geworden — durchstöbere die ganze Rezeptbibliothek, wenn du selbst auswählen möchtest, plane deine Mahlzeiten für die Woche, verwandle diesen Plan direkt in eine Einkaufsliste und sieh, was sich aus dem kochen lässt, was schon in deinem Kühlschrank steckt.",
    paragraph3Before: "Munchly ist ein unabhängiges, noch wachsendes Projekt. Es wird von einer einzigen Person entwickelt, daher kommen neue Rezepte und Funktionen in kleinen Schritten statt auf einmal. Wenn es etwas gibt, das du dir als Nächstes wünschst, führt die ",
    contactLink: "Kontaktseite",
    paragraph3After: " direkt in ein echtes Postfach, nicht in ein Formular, das im Nichts verschwindet.",
  },
  contactPage: {
    title: "Kontakt aufnehmen",
    subtitle: "Einen Fehler gefunden, ein Rezept vorzuschlagen oder einfach nur Hallo sagen? Es geht an eine echte Person.",
    emailLabel: "E-Mail",
    note: "Munchly wird von einer einzigen Person betrieben, daher kommen Antworten nicht sofort — aber jede Nachricht wird gelesen.",
  },
};

export default messages;
