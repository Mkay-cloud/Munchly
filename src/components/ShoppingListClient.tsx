"use client";

import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/sanity/queries";
import ThemeToggle from "@/components/ThemeToggle";
import { loadWeekPlan, type WeekPlan } from "@/lib/weekPlan";
import { buildShoppingList, loadCheckedIds, saveCheckedIds } from "@/lib/shoppingList";

export default function ShoppingListClient({ recipes }: { recipes: Recipe[] }) {
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
            Shopping list
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Pulled straight from your planned week. Saved only in this browser - no account needed.
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
              You don&apos;t have a week planned yet. Plan your week first and your shopping list will build
              itself from it.
            </p>
            <Link
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
              Plan your week →
            </Link>
          </div>
        ) : items.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Your planned week doesn&apos;t have any ingredients yet - either every day is set to &quot;eating
            out&quot;, or the planned recipes don&apos;t list ingredients.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
                {items.length} item{items.length === 1 ? "" : "s"} from this week&apos;s plan
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <Link
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
                  Edit week plan
                </Link>
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
                    Uncheck all
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
