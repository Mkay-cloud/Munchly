"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/i18n/locales";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";

// Strips a leading locale segment off a pathname, if there is one, so we
// always start from the "bare" (unprefixed) path when building a link for
// a different locale - e.g. "/es/recipes" -> "/recipes", "/recipes" ->
// "/recipes".
function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1] || "";
  if (isLocale(maybeLocale)) {
    const rest = "/" + segments.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/";
  }
  return pathname;
}

function hrefFor(locale: Locale, barePath: string): string {
  if (locale === DEFAULT_LOCALE) return barePath;
  return barePath === "/" ? `/${locale}` : `/${locale}${barePath}`;
}

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Explicitly stamps the chosen locale into the NEXT_LOCALE cookie before
// navigating. Without this, switching to English (which deliberately has
// no URL prefix) is ambiguous to the proxy: it falls back to whatever
// locale the cookie still says from a previous visit, which can redirect
// the browser straight back to the locale the user just tried to leave.
// Setting the cookie here makes the click itself the source of truth.
function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}`;
}

// A language dropdown, rendered inside SiteMenu (so it shows up next to
// search/the hamburger menu on every page). Builds a plain next/link for
// each locale rather than using our own <Link> wrapper, since it's
// deliberately constructing the *other* locale's URL, not the current
// one.
export default function LocaleSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const barePath = stripLocale(pathname || "/");

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("localeSwitcher.label")}
        title={t("localeSwitcher.label")}
        aria-expanded={open}
        style={{
          height: 42,
          padding: "0 14px",
          flex: "none",
          borderRadius: 999,
          border: "1.5px solid var(--border-strong)",
          background: "var(--card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--ink)",
        }}
      >
        {LOCALE_LABELS[currentLocale]}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 30,
            minWidth: 160,
            borderRadius: 16,
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 16px 32px rgba(0,0,0,0.18)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: 6,
          }}
        >
          {LOCALES.map((locale) => (
            <NextLink
              key={locale}
              href={hrefFor(locale, barePath)}
              onClick={() => {
                setLocaleCookie(locale);
                setOpen(false);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: locale === currentLocale ? 700 : 600,
                color: locale === currentLocale ? "var(--primary-text)" : "var(--ink)",
                background: locale === currentLocale ? "var(--chip)" : "transparent",
              }}
            >
              {LOCALE_LABELS[locale]}
            </NextLink>
          ))}
        </div>
      )}
    </div>
  );
}
