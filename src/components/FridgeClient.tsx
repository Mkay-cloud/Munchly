"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/sanity/queries";
import ThemeToggle from "@/components/ThemeToggle";
import { loadPantry, savePantry, addPantryItem, removePantryItem, matchFridgeRecipes } from "@/lib/fridge";

export default function FridgeClient({ recipes }: { recipes: Recipe[] }) {
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
          <Link href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to Munchly
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/suggest" className="hidden sm:inline" style={{ fontWeight: 600, fontSize: 15, color: "var(--primary)" }}>
              Suggest a recipe
            </Link>
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
            Cook from your fridge
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Tell us what&apos;s in the kitchen and we&apos;ll find what you can make with it. Saved only in
            this browser - no account needed.
          </p>
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. chicken, garlic, rice"
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
            Add
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
                    aria-label={`Remove ${item} from pantry`}
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
              Clear pantry
            </button>
          </div>
        )}

        {pantry.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Add a few ingredients above and we&apos;ll show recipes ranked by how much of what they need you
            already have.
          </p>
        ) : matches.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            No recipes overlap with what&apos;s in your list yet - try adding a few more ingredients.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
              {matches.length} recipe{matches.length === 1 ? "" : "s"} ranked by what you have
            </p>
            {matches.map(({ recipe, matched, total, missing }) => (
              <Link
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
                      {matched === total ? "Ready to cook" : `${matched} of ${total} ingredients`}
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
                      Missing: {missing.join(", ")}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
