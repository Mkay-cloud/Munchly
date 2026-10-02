import Link from "next/link";
import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Games — Munchly",
  description: "Quick little food games to play while you decide what to eat.",
  alternates: {
    canonical: "/games",
  },
};

type GameEntry = { href: string; title: string; blurb: string; emoji: string; meta: string };

const GAMES: GameEntry[] = [
  {
    href: "/games/ingredient-match",
    title: "Ingredient Match",
    blurb: "Flip the cards and find every matching pair of ingredients.",
    emoji: "🧄",
    meta: "Memory · 3 levels",
  },
  {
    href: "/games/food-trivia",
    title: "Food Trivia",
    blurb: "Ten quick questions on cuisines, ingredients, techniques and food history.",
    emoji: "🧠",
    meta: "Quiz · 10 questions",
  },
  {
    href: "/games/ingredient-merge",
    title: "Ingredient Merge",
    blurb: "Merge matching ingredients up the recipe chain and serve every order.",
    emoji: "🍝",
    meta: "Puzzle · 3 recipes",
  },
  {
    href: "/games/guess-the-dish",
    title: "Guess the Dish",
    blurb: "Name the dish from a handful of emoji - dishes from all over the world.",
    emoji: "🌮",
    meta: "Guessing · 10 dishes",
  },
];

export default function GamesPage() {
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
            Games
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Quick little food games for when you need a break from deciding what&apos;s for dinner. No
            account needed.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
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
                aria-hidden="true"
                style={{
                  flex: "none",
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                }}
              >
                {g.emoji}
              </span>
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{g.title}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted)",
                      background: "var(--chip)",
                      padding: "3px 9px",
                      borderRadius: 999,
                    }}
                  >
                    {g.meta}
                  </span>
                </span>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>{g.blurb}</span>
              </span>
              <span
                style={{
                  flex: "none",
                  padding: "9px 16px",
                  borderRadius: 999,
                  background: "var(--olive)",
                  color: "#FBF8F2",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Play
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
