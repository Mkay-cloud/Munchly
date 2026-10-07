// The full set of locales Munchly supports, and the few bits of metadata
// every part of the i18n layer needs: a human label (for the switcher), the
// text direction (Arabic is RTL - everything else here is LTR), and which
// one is the default. The default locale is NOT prefixed in the URL (so
// "/recipes" keeps working exactly as it always has for English visitors);
// every other locale is prefixed ("/es/recipes").
//
// This is a small hand-rolled i18n layer rather than a library like
// next-intl - see the comment in middleware.ts for why.

export type Locale = "en" | "es" | "fr" | "pt" | "it" | "de" | "hi" | "ar";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: Locale[] = ["en", "es", "fr", "pt", "it", "de", "hi", "ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  it: "Italiano",
  de: "Deutsch",
  hi: "हिन्दी",
  ar: "العربية",
};

export const RTL_LOCALES: Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}
