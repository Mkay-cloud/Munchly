"use client";

import Image from "next/image";
import LocaleLink from "@/i18n/Link";
import { useState } from "react";
import type { Recipe } from "@/sanity/queries";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { loadPantry, savePantry, addPantryItem, removePantryItem, matchFridgeRecipes } from "@/lib/fridge";
import { useTranslations } from "@/i18n/LocaleProvider";

export default function FridgeClient({ recipes }: { recipes: Recipe[] }) {
  const t = useTranslations();
  // Lazy initializer, not an effect - loadPantry() guards on
  // `typeof window === "undefined"` so this is safe during SSR.
  const [pantry, setPantry] = useState<string[]>(() => loadPantry());
  const [draft, setDraft] = useState("");

  const matches = matchFridgeRecipes(recipes, pantry);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const next = addPantryItem(pantry, draft);
    setPantry(next);
    savePantry(next);
    setDraft("");
  };

  const handleRemove = (item: string) => {
    const next = removePantryItem(pantry, item);
    setPantry(next);
    savePantry(next);
  };

  const handleClear = () => {
    setPantry([]);
    savePantry([]);
  };

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
            {t("fridgePage.title")}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {t("fridgePage.subtitle")}
          </p>
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("fridgePage.placeholder")}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 999,
              border: "1.5px solid var(--border-strong)",
              fontSize: 15,
              background: "var(--card)",
              color: "var(--ink)",
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              background: "var(--primary)",
              color: "#FBF8F2",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: draft.trim() ? "pointer" : "default",
              opacity: draft.trim() ? 1 : 0.6,
            }}
          >
            {t("fridgePage.add")}
          </button>
        </form>

        {pantry.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pantry.map((item) => (
                <span
                  key={item}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px 7px 14px",
                    borderRadius: 999,
                    background: "var(--chip)",
                    color: "var(--ink)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    aria-label={t("fridgePage.removeAria", { item })}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "none",
                      background: "var(--bg)",
                      color: "var(--muted)",
                      fontSize: 13,
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleClear}
              style={{
                alignSelf: "flex-start",
                border: "none",
                background: "none",
                color: "var(--muted)",
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {t("fridgePage.clearPantry")}
            </button>
          </div>
        )}

        {pantry.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            {t("fridgePage.emptyPrompt")}
          </p>
        ) : matches.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            {t("fridgePage.noMatches")}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
              {t(matches.length === 1 ? "fridgePage.countOne" : "fridgePage.countOther", { count: String(matches.length) })}
            </p>
            {matches.map(({ recipe, matched, total, missing }) => (
              <LocaleLink
                key={recipe.slug}
                href={`/recipes/${recipe.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 14,
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--ink)",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    overflow: "hidden",
                    position: "relative",
                    background: "var(--section)",
                  }}
                >
                  {recipe.imageUrl && (
                    <Image src={recipe.imageUrl} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
                  )}
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{recipe.title}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: matched === total ? "var(--terra-text)" : "var(--muted)",
                        background: matched === total ? "var(--terra-tint)" : "var(--chip)",
                        padding: "3px 9px",
                        borderRadius: 999,
                      }}
                    >
                      {matched === total ? t("fridgePage.readyToCook") : t("fridgePage.ofIngredients", { matched: String(matched), total: String(total) })}
                    </span>
                  </span>
                  {missing.length > 0 && (
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("fridgePage.missingPrefix")}{missing.join(", ")}
                    </span>
                  )}
                </span>
              </LocaleLink>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
