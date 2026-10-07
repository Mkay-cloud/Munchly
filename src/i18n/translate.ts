import type { Messages } from "./messages/types";

// The shared dotted-path lookup + "{var}" interpolation logic behind both
// useTranslations() (client components, via LocaleProvider's context) and
// getTranslations() (server components, which can't use context/hooks at
// all) - one implementation, two different ways of supplying the messages
// object it closes over.
export function createTranslator(messages: Messages) {
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
