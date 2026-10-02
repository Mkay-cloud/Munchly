"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Recipe } from "@/sanity/queries";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  PLAN_MOODS,
  type PlanMood,
  type WeekPlan,
  generateWeekPlan,
  loadWeekPlan,
  saveWeekPlan,
  clearWeekPlan,
  rerollDay,
  toggleSkipDay,
} from "@/lib/weekPlan";

export default function PlanClient({ recipes }: { recipes: Recipe[] }) {
  const [mood, setMood] = useState<PlanMood>("Anything");
  // Lazy initializer, not an effect: this runs once on mount, after
  // hydration, when `window` is real. During SSR `typeof window` is
  // "undefined" so loadWeekPlan() safely returns null instead of throwing.
  const [plan, setPlan] = useState<WeekPlan | null>(() => loadWeekPlan());

  const bySlug = new Map(recipes.map((r) => [r.slug, r]));

  const handleGenerate = () => {
    const next = generateWeekPlan(recipes, mood);
    setPlan(next);
    saveWeekPlan(next);
  };

  const handleReroll = (dayIndex: number) => {
    if (!plan) return;
    const next = rerollDay(plan, dayIndex, recipes, mood);
    setPlan(next);
    saveWeekPlan(next);
  };

  const handleToggleSkip = (dayIndex: number) => {
    if (!plan) return;
    const next = toggleSkipDay(plan, dayIndex, recipes, mood);
    setPlan(next);
    saveWeekPlan(next);
  };

  const handleClear = () => {
    setPlan(null);
    clearWeekPlan();
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
            Plan your week
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Spin once for all seven days instead of deciding one meal at a time. Saved only in this
            browser - no account needed.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {PLAN_MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                border: m === mood ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
                background: m === mood ? "var(--primary)" : "var(--card)",
                color: m === mood ? "#FBF8F2" : "var(--ink)",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              padding: "14px 24px",
              borderRadius: 999,
              background: "var(--primary)",
              color: "#FBF8F2",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
            }}
          >
            {plan ? "Re-plan my week →" : "Plan my week →"}
          </button>
          {plan && (
            <Link
              href="/shopping-list"
              style={{
                padding: "14px 18px",
                borderRadius: 999,
                background: "var(--card)",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 15,
                border: "1.5px solid var(--border-strong)",
              }}
            >
              Shopping list →
            </Link>
          )}
          {plan && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "14px 18px",
                borderRadius: 999,
                background: "var(--card)",
                color: "var(--muted)",
                fontWeight: 600,
                fontSize: 15,
                border: "1.5px solid var(--border-strong)",
                cursor: "pointer",
              }}
            >
              Clear week
            </button>
          )}
        </div>

        {plan && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {plan.days.map((d, i) => {
              const recipe = d.slug ? bySlug.get(d.slug) : undefined;
              return (
                <div
                  key={d.day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 14,
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: 48,
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--muted)",
                    }}
                  >
                    {d.day}
                  </span>

                  {d.skip ? (
                    <span style={{ flex: 1, fontSize: 15, color: "var(--faint)", fontStyle: "italic" }}>
                      Eating out
                    </span>
                  ) : recipe ? (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0, color: "var(--ink)" }}
                    >
                      <span
                        style={{
                          flex: "none",
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          overflow: "hidden",
                          position: "relative",
                          background: "var(--section)",
                        }}
                      >
                        {recipe.imageUrl && (
                          <Image src={recipe.imageUrl} alt="" fill sizes="52px" style={{ objectFit: "cover" }} />
                        )}
                      </span>
                      <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {recipe.title}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>
                          {[recipe.cuisine, recipe.timeMinutes ? `${recipe.timeMinutes} min` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <span style={{ flex: 1, fontSize: 15, color: "var(--faint)" }}>No recipe available</span>
                  )}

                  <div style={{ flex: "none", display: "flex", gap: 6 }}>
                    {!d.skip && (
                      <button
                        type="button"
                        onClick={() => handleReroll(i)}
                        aria-label={`Pick a different recipe for ${d.day}`}
                        title="Reroll this day"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          border: "1.5px solid var(--border-strong)",
                          background: "var(--bg)",
                          cursor: "pointer",
                          fontSize: 15,
                        }}
                      >
                        🔀
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleSkip(i)}
                      aria-pressed={d.skip}
                      title={d.skip ? "I'm cooking this day after all" : "I'm eating out this day"}
                      style={{
                        padding: "0 14px",
                        height: 38,
                        borderRadius: 999,
                        border: "1.5px solid var(--border-strong)",
                        background: d.skip ? "var(--olive)" : "var(--bg)",
                        color: d.skip ? "#FBF8F2" : "var(--muted)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.skip ? "Eating out" : "Eat out?"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!plan && (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Pick a mood above (or leave it on &quot;Anything&quot;) and plan your week to get started.
          </p>
        )}
      </main>
    </div>
  );
}
