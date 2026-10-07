// The shape every locale's message file must match. Keep this in sync with
// en.ts (the source of truth) whenever a new string is added - TypeScript
// will then flag any other locale file that's missing it.

export type Messages = {
  nav: {
    spinTheWheel: string;
    browseRecipes: string;
    planYourWeek: string;
    shoppingList: string;
    cookFromFridge: string;
    communityRecipes: string;
    suggestARecipe: string;
    games: string;
    blog: string;
    myFavorites: string;
    myProfile: string;
    about: string;
    contact: string;
    munchlyGroup: string;
    accountGroup: string;
    infoGroup: string;
  };
  hero: {
    headline: string;
    subhead: string;
    spinTheWheel: string;
    browseRecipes: string;
    planYourWeek: string;
    suggestARecipe: string;
    playFoodGames: string;
    readTheBlog: string;
    freeToUse: string;
  };
  search: {
    placeholder: string;
    hint: string;
    searching: string;
    noResults: string;
    close: string;
    ariaLabel: string;
    groupRecipes: string;
    groupPosts: string;
    groupGames: string;
    groupPages: string;
  };
  blogSection: {
    title: string;
    subtitle: string;
    readMore: string;
  };
  gamesSection: {
    title: string;
    subtitle: string;
    seeAll: string;
  };
  localeSwitcher: {
    label: string;
  };
};
