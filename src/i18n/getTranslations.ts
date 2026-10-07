import type { Locale } from "./locales";
import { getMessages } from "./messages";
import { createTranslator } from "./translate";

// For Server Components (async pages, generateMetadata, etc.), which can't
// call hooks or read React context - they get the locale directly from
// their route params instead of from LocaleProvider. Client components
// should use useTranslations() from LocaleProvider.tsx instead, not this.
export function getTranslations(locale: Locale) {
  return createTranslator(getMessages(locale));
}
