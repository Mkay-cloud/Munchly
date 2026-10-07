import type { Locale } from "@/i18n/locales";

// Locale codes we route on (src/i18n/locales.ts) aren't always DeepL's own
// target-language codes - map the ones that differ (Portuguese needs a
// region, English is never a translation target here at all).
const DEEPL_TARGET: Partial<Record<Locale, string>> = {
  es: "ES",
  fr: "FR",
  pt: "PT-BR",
  it: "IT",
  de: "DE",
  hi: "HI",
  ar: "AR",
};

// DeepL caps each /translate request at 50 texts - chunk larger batches
// (a long blog post's body can easily have more than 50 spans) into
// several requests and stitch the results back together in order.
const MAX_BATCH = 50;

function endpointFor(key: string): string {
  // Free-tier keys are suffixed ":fx" and use a different host.
  return key.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate";
}

async function translateChunk(texts: string[], targetLang: string, key: string): Promise<string[] | null> {
  try {
    const res = await fetch(endpointFor(key), {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: "EN",
        target_lang: targetLang,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`DeepL translate failed: ${res.status} ${await res.text().catch(() => "")}`);
      return null;
    }
    const data = (await res.json()) as { translations?: { text: string }[] };
    const translations = data.translations;
    if (!translations || translations.length !== texts.length) return null;
    return translations.map((t) => t.text);
  } catch (err) {
    console.error("DeepL translate request threw:", err);
    return null;
  }
}

// Translates an ordered list of strings into `locale`. Returns null (never
// throws) when translation isn't possible right now - no API key
// configured, the locale isn't one DeepL is wired up for, or the request
// failed - so every caller has one clear rule: null means "show the
// original English instead", not "crash the page". Empty strings in
// `texts` are passed straight through untranslated (DeepL would otherwise
// error on them) but still occupy their slot in the result.
export async function translateTexts(texts: string[], locale: Locale): Promise<string[] | null> {
  const target = DEEPL_TARGET[locale];
  const key = process.env.DEEPL_API_KEY;
  if (!target || !key || texts.length === 0) return null;

  const indices: number[] = [];
  const nonEmpty: string[] = [];
  texts.forEach((t, i) => {
    if (t.trim().length > 0) {
      indices.push(i);
      nonEmpty.push(t);
    }
  });
  if (nonEmpty.length === 0) return [...texts];

  const out = [...texts];
  for (let start = 0; start < nonEmpty.length; start += MAX_BATCH) {
    const chunk = nonEmpty.slice(start, start + MAX_BATCH);
    const translated = await translateChunk(chunk, target, key);
    if (!translated) return null;
    translated.forEach((text, j) => {
      out[indices[start + j]] = text;
    });
  }
  return out;
}
