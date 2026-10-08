"use client";

import { useEffect, useState } from "react";
import { applyTheme, getCurrentTheme, getStoredTheme, getSystemTheme, setStoredTheme, type Theme } from "@/lib/theme";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function ThemeToggle() {
  // Lazy initializer (not an effect) - same pattern as the sound toggle on
  // the home page. The inline no-flash script in the root layout has
  // already set data-theme on <html> before this component mounts, so this
  // just reads it back rather than recomputing it.
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme());
  const t = useTranslations();

  useEffect(() => {
    // Only follow the system preference live when the visitor hasn't made
    // an explicit choice yet - once they've toggled, that choice sticks
    // even if their OS theme changes later.
    if (getStoredTheme()) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = getSystemTheme();
      setTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    setStoredTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? t("themeToggle.switchToLight") : t("themeToggle.switchToDark")}
      title={theme === "dark" ? t("themeToggle.switchToLight") : t("themeToggle.switchToDark")}
      style={{
        width: 42,
        height: 42,
        flex: "none",
        borderRadius: "50%",
        border: "1.5px solid var(--border-strong)",
        background: "var(--card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "2px solid var(--ink)",
          background: "linear-gradient(90deg, var(--ink) 50%, transparent 50%)",
        }}
      />
    </button>
  );
}
