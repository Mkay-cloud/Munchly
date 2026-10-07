import type { Messages } from "./types";

const messages: Messages = {
  nav: {
    spinTheWheel: "Faire tourner la roue",
    browseRecipes: "Parcourir les recettes",
    planYourWeek: "Planifier sa semaine",
    shoppingList: "Liste de courses",
    cookFromFridge: "Cuisiner avec son frigo",
    communityRecipes: "Recettes de la communauté",
    suggestARecipe: "Proposer une recette",
    games: "Jeux",
    blog: "Blog",
    myFavorites: "Mes favoris",
    myProfile: "Mon profil",
    about: "À propos",
    contact: "Contact",
    munchlyGroup: "Munchly",
    accountGroup: "Votre compte",
    infoGroup: "Infos",
  },
  hero: {
    headline: "Vous ne savez pas quoi manger ? Faites tourner la roue.",
    subhead:
      "Choisissez une envie, lancez la roue, et Munchly vous propose un vrai repas avec sa recette. Plus besoin de parcourir cent onglets en ayant de plus en plus faim.",
    spinTheWheel: "Faire tourner la roue →",
    browseRecipes: "Parcourir les recettes",
    planYourWeek: "Planifier sa semaine",
    suggestARecipe: "Proposer une recette",
    playFoodGames: "Jouer aux jeux culinaires",
    readTheBlog: "Lire le blog",
    freeToUse: "Gratuit. Aucun compte requis pour tourner la roue.",
  },
  search: {
    placeholder: "Rechercher des recettes, articles, jeux, pages...",
    hint: "Tapez au moins 2 caractères pour rechercher sur tout le site.",
    searching: "Recherche...",
    noResults: "Aucun résultat pour « {query} ».",
    close: "Échap",
    ariaLabel: "Rechercher sur Munchly",
    groupRecipes: "Recettes",
    groupPosts: "Articles de blog",
    groupGames: "Jeux",
    groupPages: "Pages",
  },
  blogSection: {
    title: "Depuis le blog",
    subtitle: "Recettes, notes de cuisine et histoires culinaires, tout juste sorties du feu.",
    readMore: "Lire le blog →",
  },
  gamesSection: {
    title: "Jouer aux jeux culinaires",
    subtitle:
      "Quatre jeux rapides pour une pause quand vous hésitez sur le dîner. Gratuit, sans compte.",
    seeAll: "Voir tous les jeux →",
  },
  localeSwitcher: {
    label: "Langue",
  },
  common: {
    backToMunchly: "← Retour à Munchly",
  },
  recipesPage: {
    title: "Toutes les recettes",
    countOne: "{count} recette dans la bibliothèque pour l'instant.",
    countOther: "{count} recettes dans la bibliothèque pour l'instant.",
    empty: "Pas encore de recettes — revenez bientôt.",
  },
  recipeDetailPage: {
    ingredients: "Ingrédients",
    instructions: "Instructions",
  },
  gamesPage: {
    title: "Jeux",
    subtitle: "De petits jeux autour de la nourriture pour faire une pause quand vous hésitez sur le dîner. Aucun compte requis.",
    play: "Jouer",
  },
  aboutPage: {
    title: "À propos de Munchly",
    paragraph1: "Munchly est né d'un problème tout à fait banal : se tenir devant le frigo chaque soir, sans faim pour « rien de particulier », et sans vouloir prendre la moindre décision à ce sujet. Alors plutôt qu'un énième site de recettes à faire défiler, Munchly repose sur un seul bouton : faites tourner la roue, obtenez une réponse, allez manger.",
    paragraph2: "Depuis, c'est devenu une petite boîte à outils pour le reste de la semaine aussi — parcourez toute la bibliothèque de recettes quand vous voulez choisir vous-même, planifiez vos repas pour la semaine, transformez ce plan directement en liste de courses, et découvrez ce que vous pouvez cuisiner avec ce qu'il y a déjà dans votre frigo.",
    paragraph3Before: "Munchly est un projet indépendant, encore en pleine croissance. Il est développé par une seule personne, donc les nouvelles recettes et fonctionnalités arrivent par petites étapes plutôt que d'un coup. S'il y a quelque chose que vous aimeriez voir ensuite, la ",
    contactLink: "page de contact",
    paragraph3After: " va directement dans une vraie boîte mail, pas dans un formulaire qui disparaît dans le vide.",
  },
  contactPage: {
    title: "Contactez-nous",
    subtitle: "Un bug trouvé, une recette à suggérer, ou juste envie de dire bonjour ? Ça arrive à une vraie personne.",
    emailLabel: "E-mail",
    note: "Munchly est géré par une seule personne, donc les réponses ne sont pas instantanées — mais chaque message est lu.",
  },
};

export default messages;
