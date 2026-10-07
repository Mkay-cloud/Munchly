import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "Gira la ruota",
    browseRecipes: "Sfoglia le ricette",
    planYourWeek: "Pianifica la settimana",
    shoppingList: "Lista della spesa",
    cookFromFridge: "Cucina con il tuo frigo",
    communityRecipes: "Ricette della community",
    suggestARecipe: "Suggerisci una ricetta",
    games: "Giochi",
    blog: "Blog",
    myFavorites: "I miei preferiti",
    myProfile: "Il mio profilo",
    about: "Chi siamo",
    contact: "Contatti",
    munchlyGroup: "Munchly",
    accountGroup: "Il tuo account",
    infoGroup: "Informazioni",
  },
  hero: {
    headline: "Non sai cosa mangiare? Gira e scopri.",
    subhead:
      "Scegli un umore, gira la ruota e Munchly ti propone un pasto vero con tanto di ricetta. Basta scorrere cento schede mentre la fame aumenta.",
    spinTheWheel: "Gira la ruota →",
    browseRecipes: "Sfoglia le ricette",
    planYourWeek: "Pianifica la settimana",
    suggestARecipe: "Suggerisci una ricetta",
    playFoodGames: "Gioca ai giochi di cucina",
    readTheBlog: "Leggi il blog",
    freeToUse: "Gratis. Nessun account necessario per girare.",
  },
  search: {
    placeholder: "Cerca ricette, articoli del blog, giochi, pagine...",
    hint: "Digita almeno 2 caratteri per cercare in tutto il sito.",
    searching: "Ricerca in corso...",
    noResults: "Nessun risultato per “{query}”.",
    close: "Esc",
    ariaLabel: "Cerca su Munchly",
    groupRecipes: "Ricette",
    groupPosts: "Articoli del blog",
    groupGames: "Giochi",
    groupPages: "Pagine",
  },
  blogSection: {
    title: "Dal blog",
    subtitle: "Ricette, note di cucina e storie culinarie, appena sfornate.",
    readMore: "Leggi il blog →",
  },
  gamesSection: {
    title: "Gioca ai giochi di cucina",
    subtitle:
      "Quattro giochi veloci per quando hai bisogno di una pausa dal decidere cosa cenare. Gratis, senza account.",
    seeAll: "Vedi tutti i giochi →",
  },
  localeSwitcher: {
    label: "Lingua",
  },
  common: {
    backToMunchly: "← Torna a Munchly",
  },
  recipesPage: {
    title: "Tutte le ricette",
    countOne: "{count} ricetta nella libreria finora.",
    countOther: "{count} ricette nella libreria finora.",
    empty: "Ancora nessuna ricetta — torna presto a controllare.",
  },
  recipeDetailPage: {
    ingredients: "Ingredienti",
    instructions: "Istruzioni",
  },
  gamesPage: {
    title: "Giochi",
    subtitle: "Piccoli giochi a tema cibo per quando hai bisogno di una pausa dal decidere cosa mangiare. Nessun account necessario.",
    play: "Gioca",
  },
  aboutPage: {
    title: "Chi è Munchly",
    paragraph1: "Munchly è nato da un problema molto comune: stare davanti al frigo ogni sera, senza fame per “niente in particolare”, e senza voglia di prendere una sola decisione al riguardo. Così, invece dell'ennesimo sito di ricette da scorrere, Munchly è costruito attorno a un solo pulsante: gira la ruota, ottieni una risposta, vai a mangiare.",
    paragraph2: "Da lì si è trasformato anche in un piccolo kit di strumenti per il resto della settimana — sfoglia l'intera libreria di ricette quando vuoi scegliere da solo, pianifica i pasti per la settimana, trasforma quel piano direttamente in una lista della spesa e scopri cosa puoi cucinare con quello che hai già in frigo.",
    paragraph3Before: "Munchly è un progetto indipendente, ancora in crescita. È realizzato da una sola persona, quindi nuove ricette e funzionalità arrivano a piccoli passi anziché tutte insieme. Se c'è qualcosa che vorresti vedere, la ",
    contactLink: "pagina dei contatti",
    paragraph3After: " arriva dritta a una casella di posta vera, non a un modulo che scompare nel nulla.",
  },
  contactPage: {
    title: "Mettiti in contatto",
    subtitle: "Hai trovato un bug, hai una ricetta da suggerire, o vuoi solo salutare? Arriva a una persona vera.",
    emailLabel: "Email",
    note: "Munchly è gestito da una sola persona, quindi le risposte non sono immediate — ma ogni messaggio viene letto.",
  },
};

export default messages;
