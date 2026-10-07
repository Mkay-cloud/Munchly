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
  common: {
    backToMunchly: string;
  };
  recipesPage: {
    title: string;
    countOne: string;
    countOther: string;
    empty: string;
  };
  recipeDetailPage: {
    ingredients: string;
    instructions: string;
  };
  gamesPage: {
    title: string;
    subtitle: string;
    play: string;
  };
  aboutPage: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3Before: string;
    contactLink: string;
    paragraph3After: string;
  };
  contactPage: {
    title: string;
    subtitle: string;
    emailLabel: string;
    note: string;
  };
  auth: {
    signIn: string;
    signedInRefreshing: string;
  };
  fridgePage: {
    title: string;
    subtitle: string;
    placeholder: string;
    add: string;
    removeAria: string;
    clearPantry: string;
    emptyPrompt: string;
    noMatches: string;
    countOne: string;
    countOther: string;
    readyToCook: string;
    ofIngredients: string;
    missingPrefix: string;
  };
  planPage: {
    title: string;
    subtitle: string;
    rePlan: string;
    planMyWeek: string;
    shoppingListLink: string;
    clearWeek: string;
    eatingOut: string;
    noRecipeAvailable: string;
    rerollAria: string;
    rerollTitle: string;
    eatOutQuestion: string;
    cookingAfterAllTitle: string;
    eatingOutTitle: string;
    emptyPrompt: string;
  };
  shoppingListPage: {
    subtitle: string;
    noPlanPrompt: string;
    planWeek: string;
    emptyIngredients: string;
    countOne: string;
    countOther: string;
    editWeekPlan: string;
    uncheckAll: string;
  };
  profilePage: {
    title: string;
    subtitle: string;
    signInMessage: string;
  };
  profileForm: {
    changeAvatarAria: string;
    uploading: string;
    changePhoto: string;
    photoHint: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    displayNameHint: string;
    savedMessage: string;
    saving: string;
    saveProfile: string;
    loading: string;
    errorImageType: string;
    errorImageSize: string;
    errorDisplayNameRequired: string;
  };
  favoritesPage: {
    title: string;
    countOne: string;
    countOther: string;
    emptyPrompt: string;
    signInMessage: string;
  };
};
