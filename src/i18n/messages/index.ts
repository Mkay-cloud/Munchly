import type { Locale } from "../locales";
import type { Messages } from "./types";
import en from "./en";
import es from "./es";
import fr from "./fr";
import pt from "./pt";
import it from "./it";
import de from "./de";
import hi from "./hi";
import ar from "./ar";

const MESSAGES_BY_LOCALE: Record<Locale, Messages> = { en, es, fr, pt, it, de, hi, ar };

export function getMessages(locale: Locale): Messages {
  return MESSAGES_BY_LOCALE[locale];
}

export type { Messages };
