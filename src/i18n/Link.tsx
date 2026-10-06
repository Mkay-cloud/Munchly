"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "./LocaleProvider";
import { DEFAULT_LOCALE } from "./locales";

// A drop-in replacement for next/link's <Link>: pass it the same
// *unprefixed* href you always would ("/recipes", "/games/food-trivia"),
// and it prepends the current locale's prefix for you ("/es/recipes"),
// except for the default locale, which is never prefixed. Every internal
// link that should stay on the same language as the current page should
// use this instead of next/link directly.
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const localizedHref =
    locale === DEFAULT_LOCALE || typeof href !== "string" || href.startsWith("http")
      ? href
      : href === "/"
        ? `/${locale}`
        : `/${locale}${href}`;
  return <NextLink href={localizedHref} {...props} />;
}
