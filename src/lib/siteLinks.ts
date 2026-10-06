// The site's primary nav links, shared between SiteMenu (the hamburger
// drawer, on every page) and the global search (so "search" can also
// surface a plain page like /plan or /about by name, not just recipes and
// blog posts). Keep this as the one place these links are defined - do not
// duplicate the list elsewhere.
//
// `label` is the English fallback, used server-side (the /api/search route
// matches against it, since that endpoint isn't locale-aware yet - see the
// i18n step-1 notes in src/i18n/). `labelKey` is the nav.* translation key
// client components use via useTranslations() so the drawer shows the
// visitor's language.

export type MenuLink = { href: string; label: string; labelKey: string };

export const APP_LINKS: MenuLink[] = [
  { href: "/", label: "Spin the wheel", labelKey: "nav.spinTheWheel" },
  { href: "/recipes", label: "Browse recipes", labelKey: "nav.browseRecipes" },
  { href: "/plan", label: "Plan your week", labelKey: "nav.planYourWeek" },
  { href: "/shopping-list", label: "Shopping list", labelKey: "nav.shoppingList" },
  { href: "/fridge", label: "Cook from your fridge", labelKey: "nav.cookFromFridge" },
  { href: "/community", label: "Community recipes", labelKey: "nav.communityRecipes" },
  { href: "/suggest", label: "Suggest a recipe", labelKey: "nav.suggestARecipe" },
  { href: "/games", label: "Games", labelKey: "nav.games" },
  { href: "/blog", label: "Blog", labelKey: "nav.blog" },
];

export const ACCOUNT_LINKS: MenuLink[] = [
  { href: "/favorites", label: "My favorites", labelKey: "nav.myFavorites" },
  { href: "/profile", label: "My profile", labelKey: "nav.myProfile" },
];

export const INFO_LINKS: MenuLink[] = [
  { href: "/about", label: "About", labelKey: "nav.about" },
  { href: "/contact", label: "Contact", labelKey: "nav.contact" },
];
