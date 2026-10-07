import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/locales";

const SITE_URL = "https://munchly.online";

// Every locale has its own copy of these paths at the same URL shape as
// English (the default locale isn't prefixed - see i18n/locales.ts) - block
// the locale-prefixed versions too, not just the unprefixed English ones.
const PRIVATE_PATHS = ["/favorites", "/profile", "/studio"];

function disallowList(): string[] {
  return LOCALES.flatMap((locale) => {
    const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
    return PRIVATE_PATHS.map((p) => `${prefix}${p}`);
  });
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowList(),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
