// The site's primary nav links, shared between SiteMenu (the hamburger
// drawer, on every page) and the global search (so "search" can also
// surface a plain page like /plan or /about by name, not just recipes and
// blog posts). Keep this as the one place these links are defined - do not
// duplicate the list elsewhere.

export type MenuLink = { href: string; label: string };

export const APP_LINKS: MenuLink[] = [
  { href: "/", label: "Spin the wheel" },
  { href: "/recipes", label: "Browse recipes" },
  { href: "/plan", label: "Plan your week" },
  { href: "/shopping-list", label: "Shopping list" },
  { href: "/fridge", label: "Cook from your fridge" },
  { href: "/community", label: "Community recipes" },
  { href: "/suggest", label: "Suggest a recipe" },
  { href: "/games", label: "Games" },
  { href: "/blog", label: "Blog" },
];

export const ACCOUNT_LINKS: MenuLink[] = [
  { href: "/favorites", label: "My favorites" },
  { href: "/profile", label: "My profile" },
];

export const INFO_LINKS: MenuLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
