"use client";

import LocaleLink from "@/i18n/Link";
import { useState } from "react";
import type { Recipe } from "@/sanity/queries";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { loadWeekPlan, type WeekPlan } from "@/lib/weekPlan";
import { buildShoppingList, loadCheckedIds, saveCheckedIds } from "@/lib/shoppingList";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function ShoppingListClient({ recipes }: { recipes: Recipe[] }) {
  const t = useTranslations();
  // Lazy initializers (not effects) - safe during SSR since loadWeekPlan /
  // loadCheckedIds both guard on `typeof window === "undefined"`.
  const [plan] = useState<WeekPlan | null>(() => loadWeekPlan());
  const [checked, setChecked] = useState<Set<string>>(() => loadCheckedIds());

  const items = buildShoppingList(recipes, plan);

  const toggleChecked = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setChecked(next);
    saveCheckedIds(next);
  };

  const clearChecked = () => {
    const next = new Set<string>();
    setChecked(next);
    saveCheckedIds(next);
  };

  const anyChecked = items.some((i) => checked.has(i.id));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--nav-bg)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <LocaleLink href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {t("common.backToMunchly")}
          </LocaleLink>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
            }}
          >
            {t("nav.shoppingList")}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {t("shoppingListPage.subtitle")}
          </p>
        </div>

        {!plan ? (
          <div
            style={{
              padding: 22,
              borderRadius: 24,
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }}>
              {t("shoppingListPage.noPlanPrompt")}
            </p>
            <LocaleLink
              href="/plan"
              style={{
                alignSelf: "flex-start",
                padding: "12px 20px",
                borderRadius: 999,
                background: "var(--primary)",
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {t("shoppingListPage.planWeek")}
            </LocaleLink>
          </div>
        ) : items.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            {t("shoppingListPage.emptyIngredients")}
          </p>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
                {t(items.length === 1 ? "shoppingListPage.countOne" : "shoppingListPage.countOther", { count: String(items.length) })}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <LocaleLink
                  href="/plan"
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "var(--card)",
                    color: "var(--ink)",
                    fontWeight: 600,
                    fontSize: 13,
                    border: "1.5px solid var(--border-strong)",
                  }}
                >
                  {t("shoppingListPage.editWeekPlan")}
                </LocaleLink>
                {anyChecked && (
                  <button
                    type="button"
                    onClick={clearChecked}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      background: "var(--card)",
                      color: "var(--muted)",
                      fontWeight: 600,
                      fontSize: 13,
                      border: "1.5px solid var(--border-strong)",
                      cursor: "pointer",
                    }}
                  >
                    {t("shoppingListPage.uncheckAll")}
                  </button>
                )}
              </div>
            </div>

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleChecked(item.id)}
                      aria-pressed={isChecked}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 16px",
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: isChecked ? "var(--section)" : "var(--card)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flex: "none",
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          border: "1.5px solid var(--border-strong)",
                          background: isChecked ? "var(--olive)" : "transparent",
                          color: "#FBF8F2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: isChecked ? "var(--faint)" : "var(--ink)",
                          textDecoration: isChecked ? "line-through" : "none",
                        }}
                      >
                        {item.text}
                        {item.count > 1 && (
                          <span style={{ color: "var(--muted)", fontWeight: 600 }}> ×{item.count}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
