// Site-wide dark/light theme, persisted to localStorage and applied as a
// `data-theme` attribute on <html> (see globals.css's `:root` /
// `[data-theme="dark"]` blocks) so every page - not just one component's
// subtree - inherits the right CSS variables. The matching inline script in
// the root layout (strategy="beforeInteractive") applies this before
// hydration to avoid a flash of the wrong theme.
"use client";

const STORAGE_KEY = "munchly_theme_v1";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    // Storage blocked (private browsing etc.) - no saved override.
    return null;
  }
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage full or blocked - the toggle still works for this visit, it
    // just won't be remembered next time.
  }
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

// Kept in sync by hand with the inline no-flash script in src/app/[locale]/layout.tsx
// (that one can't import this module - it has to run as a standalone
// string before any JS bundle loads). Same storage key: "munchly_theme_v1".
