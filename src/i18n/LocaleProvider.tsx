"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./locales";
import { isRtl } from "./locales";
import type { Messages } from "./messages/types";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, messages, dir: isRtl(locale) ? "rtl" : "ltr" }),
    [locale, messages]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale/useTranslations must be used within a LocaleProvider");
  }
  return ctx;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

export function useDir(): "ltr" | "rtl" {
  return useLocaleContext().dir;
}

// Reads a dotted path ("nav.spinTheWheel") out of the current locale's
// messages object and returns a `t` function for it. Supports simple
// "{name}" interpolation (e.g. t("search.noResults", { query: "pasta" })) -
// nothing fancier like pluralization, since the site's strings don't need
// it yet.
export function useTranslations() {
  const { messages } = useLocaleContext();

  return function t(key: string, vars?: Record<string, string>): string {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== "string") {
      return key;
    }
    if (!vars) return value;
    return Object.entries(vars).reduce(
      (acc, [name, replacement]) => acc.replaceAll(`{${name}}`, replacement),
      value
    );
  };
}
