"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Recipe } from "@/sanity/queries";
import AccountNav from "./AccountNav";
import FavoriteButton from "./FavoriteButton";

const MOODS = ["Anything", "Comfort", "Quick", "Spicy", "Sweet"] as const;
type Mood = (typeof MOODS)[number];

const PALETTES: [string, string][][] = [
  [
    ["#F6F0E4", "#641F2B"],
    ["#E9D6BA", "#30231F"],
    ["#A65D48", "#FFF7EE"],
    ["#F1E3CC", "#641F2B"],
  ],
];
const PALETTE = PALETTES[0];

const MOOD_TILES: { match: (r: Recipe) => boolean; title: string; sub: string }[] = [
  { match: (r) => r.moods.includes("Comfort"), title: "Comfort food", sub: "Hearty classics" },
  { match: (r) => r.moods.includes("Quick"), title: "Quick meals", sub: "Ready in 20 min" },
  { match: (r) => r.moods.includes("Spicy"), title: "Spicy", sub: "Bring the heat" },
  { match: (r) => r.moods.includes("Sweet"), title: "Sweet", sub: "Desserts and treats" },
  { match: (r) => r.tags.includes("Light & fresh"), title: "Light & fresh", sub: "Salads and bowls" },
  { match: (r) => r.tags.includes("Cozy soups"), title: "Cozy soups", sub: "One pot, big spoon" },
];

function buildMoodPool(recipes: Recipe[], mood: Mood): Recipe[] {
  if (mood === "Anything") return recipes;
  const matching = recipes.filter((r) => r.moods.includes(mood));
  if (matching.length >= 4) return matching;
  const rest = recipes.filter((r) => !matching.includes(r));
  return [...matching, ...rest].slice(0, Math.max(4, matching.length));
}

export default function HomeClient({ recipes }: { recipes: Recipe[] }) {
  const [themeOverride, setThemeOverride] = useState<"light" | "dark" | null>(null);
  const [sysDark, setSysDark] = useState(false);
  const [mood, setMood] = useState<Mood>("Anything");
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Recipe | null>(null);
  const [tab, setTab] = useState<"Mood" | "Cuisine">("Mood");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSysDark(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dark = themeOverride ? themeOverride === "dark" : sysDark;
  const pool = buildMoodPool(recipes, mood);
  const seg = pool.length ? 360 / pool.length : 360;
  const stops = pool
    .map((_, i) => `${PALETTE[i % PALETTE.length][0]} ${i * seg}deg ${(i + 1) * seg}deg`)
    .join(",");

  const spin = () => {
    if (spinning || pool.length === 0) return;
    const i = Math.floor(Math.random() * pool.length);
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const base = Math.ceil(rot / 360) * 360 + 360 * 5;
    setSpinning(true);
    setResult(null);
    setRot(base - (i + 0.5) * seg + jitter);
    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setResult(pool[i]);
    }, 4200);
  };

  const cuisines = Array.from(
    new Set(recipes.map((r) => r.cuisine).filter((c): c is string => !!c))
  ).sort();

  const cuisineTiles = cuisines.map((cuisine) => {
    const rep = recipes.find((r) => r.cuisine === cuisine)!;
    return { cuisine, rep };
  });

  const moodTilesResolved = MOOD_TILES.map((t) => {
    const rep = recipes.find(t.match);
    return { ...t, rep };
  });

  return (
    <div
      data-theme={dark ? "dark" : "light"}
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", overflowX: "hidden" }}
    >
      {/* Nav */}
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
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--primary-text)" }}>
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#F6F0E4",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                border: "1px solid var(--border)",
              }}
            >
              <Image src="/panda-head.png" alt="" width={40} height={40} style={{ width: 40, height: "auto", display: "block" }} />
            </span>
            <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 700, fontSize: 26, letterSpacing: "-0.01em" }}>
              Munchly
            </span>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Hidden below the sm breakpoint - on phones these two text
                links plus the logo left no room for the dark-mode toggle
                and Sign in button, which got pushed off-screen. */}
            <a
              href="#browse"
              className="hidden sm:inline"
              style={{ padding: "10px 14px", borderRadius: 999, fontWeight: 600, fontSize: 15, color: "var(--ink)" }}
            >
              Recipes
            </a>
            <a
              href="#grows"
              className="hidden sm:inline"
              style={{ padding: "10px 14px", borderRadius: 999, fontWeight: 600, fontSize: 15, color: "var(--ink)" }}
            >
              What&apos;s next
            </a>
            <button
              onClick={() => setThemeOverride(dark ? "light" : "dark")}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
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
            <AccountNav />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "40px 20px 72px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "48px 56px",
        }}
      >
        <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px 7px 10px",
              borderRadius: 999,
              background: "var(--sage-tint)",
              color: "var(--olive-text)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--olive)" }} />
            Make magic.
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: "clamp(42px, 6.4vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            Can&apos;t decide what to eat? <span style={{ color: "var(--primary-text)" }}>Spin for it.</span>
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(17px, 1.6vw, 19px)", lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "30em" }}>
            Pick a mood, give the wheel a spin, and Munchly lands on a real meal with a recipe to match. No
            more scrolling through a hundred tabs while you get hungrier.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <a
              href="#spinner"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 26px",
                borderRadius: 999,
                background: "var(--primary)",
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 17,
                boxShadow: "0 6px 18px rgba(100,31,43,0.22)",
              }}
            >
              Spin the wheel <span style={{ fontSize: 18 }}>→</span>
            </a>
            <a
              href="#browse"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "16px 22px",
                borderRadius: 999,
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 17,
                border: "1.5px solid var(--border-strong)",
                background: "var(--card)",
              }}
            >
              Browse recipes
            </a>
            <Link
              href="/plan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "16px 22px",
                borderRadius: 999,
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 17,
                border: "1.5px solid var(--border-strong)",
                background: "var(--card)",
              }}
            >
              Plan your week
            </Link>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Free to use. No account needed to spin.</p>
        </div>

        <div id="spinner" style={{ flex: "1 1 380px", minWidth: 0, maxWidth: 520, margin: "0 auto", position: "relative", paddingTop: 78 }}>
          <Image
            src="/panda.png"
            alt="Munchly the panda chef"
            width={150}
            height={150}
            className="mly-mascot"
            style={{
              position: "absolute",
              top: 0,
              right: 22,
              width: 150,
              height: "auto",
              zIndex: 1,
              pointerEvents: "none",
              transformOrigin: "50% 100%",
              animation: spinning
                ? "mly-hop 0.45s ease-in-out infinite"
                : result
                ? "mly-cheer 0.9s ease-out, mly-bob 3.2s ease-in-out 0.9s infinite"
                : "mly-bob 3.2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 32,
              padding: "22px 20px 22px",
              boxShadow: "0 20px 50px -20px rgba(48,35,31,0.22)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>
                I&apos;m in the mood for
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map((m) => {
                  const on = m === mood;
                  return (
                    <button
                      key={m}
                      onClick={() => !spinning && (setMood(m), setResult(null))}
                      style={{
                        padding: "9px 16px",
                        borderRadius: 999,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: `1.5px solid ${on ? "var(--primary)" : "var(--border-strong)"}`,
                        background: on ? "var(--primary)" : "var(--card)",
                        color: on ? "#FBF8F2" : "var(--ink)",
                        transition: "all .15s",
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {pool.length === 0 ? (
              <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: "var(--muted)" }}>
                No recipes yet — add some in the Sanity Studio.
              </p>
            ) : (
              <div style={{ position: "relative", width: "min(100%, 360px)", aspectRatio: "1", margin: "4px auto 0" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -6,
                    transform: "translateX(-50%)",
                    zIndex: 3,
                    width: 0,
                    height: 0,
                    borderLeft: "15px solid transparent",
                    borderRight: "15px solid transparent",
                    borderTop: "26px solid var(--primary)",
                    filter: "drop-shadow(0 3px 3px rgba(48,35,31,0.25))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    padding: 10,
                    background: "var(--chip)",
                    boxShadow: "inset 0 0 0 1px var(--border)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: `conic-gradient(${stops})`,
                      transform: `rotate(${rot}deg)`,
                      transition: spinning ? "transform 4.2s cubic-bezier(0.12,0.7,0.14,1)" : "none",
                      boxShadow: "0 0 0 1px rgba(48,35,31,0.06)",
                    }}
                  >
                    {pool.map((r, i) => {
                      const angle = (i + 0.5) * seg - 90;
                      const ink = PALETTE[i % PALETTE.length][1];
                      return (
                        <div
                          key={r._id}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            width: "50%",
                            height: 0,
                            transformOrigin: "0 0",
                            transform: `rotate(${angle}deg)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span
                            style={{
                              paddingRight: 18,
                              fontSize: "clamp(11px, 3.2vw, 13.5px)",
                              fontWeight: 700,
                              color: ink,
                              whiteSpace: "nowrap",
                              lineHeight: 1,
                            }}
                          >
                            {r.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={spin}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "27%",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    border: "5px solid var(--card)",
                    background: "var(--primary)",
                    color: "#FBF8F2",
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 600,
                    fontSize: "clamp(17px, 4.6vw, 21px)",
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(100,31,43,0.35)",
                    zIndex: 4,
                  }}
                >
                  {spinning ? "…" : "Spin"}
                </button>
              </div>
            )}

            {result && !spinning ? (
              <div
                style={{
                  background: "var(--sage-tint)",
                  border: "1px solid var(--sage-line)",
                  borderRadius: 22,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--olive-text)" }}>Tonight you&apos;re having</span>
                  <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 26, lineHeight: 1.1, color: "var(--ink)" }}>
                    {result.title}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--olive-2)" }}>
                    {[result.cuisine, result.timeMinutes ? `${result.timeMinutes} min` : null, result.note]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <FavoriteButton slug={result.slug} title={result.title} variant="outline" />
                  <Link
                    href={`/recipes/${result.slug}`}
                    style={{
                      flex: "1 1 150px",
                      textAlign: "center",
                      padding: "13px 18px",
                      borderRadius: 999,
                      background: "var(--olive)",
                      color: "#FBF8F2",
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    See the recipe →
                  </Link>
                  <button
                    onClick={spin}
                    style={{
                      flex: "1 1 120px",
                      padding: "13px 18px",
                      borderRadius: 999,
                      background: "var(--card)",
                      border: "1.5px solid var(--sage-line)",
                      color: "var(--olive-text)",
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    Spin again
                  </button>
                </div>
              </div>
            ) : pool.length > 0 ? (
              <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: "var(--muted)" }}>
                {spinning ? "Munchly is thinking…" : "Tap Spin. We'll pick, you eat."}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Browse */}
      <section
        id="browse"
        style={{ background: "var(--section)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 20px", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-fredoka)",
                  fontWeight: 600,
                  fontSize: "clamp(32px, 4.4vw, 46px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.015em",
                  color: "var(--ink)",
                }}
              >
                Browse by mood or cuisine
              </h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)" }}>
                Already know the feeling, just not the dish? Start here. We&apos;re adding shelves to the library
                every week.
              </p>
            </div>
            <div style={{ display: "flex", padding: 5, borderRadius: 999, background: "var(--card)", border: "1px solid var(--border-strong)", gap: 4 }}>
              {(["Mood", "Cuisine"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 999,
                    border: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: t === tab ? "var(--primary)" : "transparent",
                    color: t === tab ? "#FBF8F2" : "var(--ink)",
                  }}
                >
                  {t === "Mood" ? "By mood" : "By cuisine"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
            {tab === "Mood"
              ? moodTilesResolved.map((t) => (
                  <BrowseCard key={t.title} title={t.title} sub={t.sub} rep={t.rep} />
                ))
              : cuisineTiles.map((t) => (
                  <BrowseCard key={t.cuisine} title={t.cuisine} sub={`${t.rep.title} and more`} rep={t.rep} />
                ))}
          </div>

          <Link
            href="/recipes"
            style={{
              alignSelf: "flex-start",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "none",
              borderBottom: "1px solid var(--primary)",
              paddingBottom: 2,
            }}
          >
            See all {recipes.length} recipes →
          </Link>
        </div>
      </section>

      {/* Grows with you */}
      <section id="grows" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 20px", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 620 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: "clamp(32px, 4.4vw, 46px)",
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
            }}
          >
            Munchly grows with you
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)" }}>
            The wheel, your week plan, your shopping list, and cooking from what&apos;s in the kitchen - all
            live today, all free, no account required beyond saving favorites.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 16 }}>
          {[
            { tag: "Live", tagBg: "var(--terra-tint)", tagColor: "var(--terra-text)", title: "Save favorites", body: "Sign in free and tap the heart on any recipe to keep it in your list.", href: "/favorites", image: "/mascots/favorites.png", delay: "0s" },
            { tag: "Live", tagBg: "var(--terra-tint)", tagColor: "var(--terra-text)", title: "Plan your week", body: "Spin once for the whole week. Skip the days you're eating out.", href: "/plan", image: "/mascots/plan.png", delay: "0.3s" },
            { tag: "Live", tagBg: "var(--terra-tint)", tagColor: "var(--terra-text)", title: "Build a shopping list", body: "Your planned meals turn into one combined list you can check off.", href: "/shopping-list", image: "/mascots/shopping-list.png", delay: "0.6s" },
            { tag: "Live", tagBg: "var(--terra-tint)", tagColor: "var(--terra-text)", title: "Cook from your fridge", body: "Tell us what's in the kitchen and we'll find what you can make with it.", href: "/fridge", image: "/mascots/fridge.png", delay: "0.9s" },
          ].map((f) => {
            const cardStyle = {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 28,
              padding: 22,
              display: "flex",
              flexDirection: "column" as const,
              gap: 18,
              color: "inherit",
            };
            const content = (
              <>
                <div
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--line-soft)",
                    borderRadius: 18,
                    padding: 14,
                    minHeight: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <span
                    className="mly-mascot"
                    style={{
                      display: "inline-block",
                      width: 110,
                      height: 110,
                      position: "relative",
                      animation: `mly-bob 3.2s ease-in-out ${f.delay} infinite`,
                    }}
                  >
                    <Image src={f.image} alt="" fill sizes="110px" style={{ objectFit: "contain" }} />
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 12,
                      fontWeight: 700,
                      color: f.tagColor,
                      background: f.tagBg,
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {f.tag}
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 22, color: "var(--ink)" }}>
                    {f.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--muted)" }}>{f.body}</p>
                </div>
              </>
            );
            return f.href ? (
              <Link key={f.title} href={f.href} style={cardStyle}>
                {content}
              </Link>
            ) : (
              <div key={f.title} style={cardStyle}>
                {content}
              </div>
            );
          })}
        </div>

        <div
          id="favorites-cta"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "22px 24px",
            borderRadius: 26,
            background: "var(--sage-tint)",
            border: "1px solid var(--sage-line)",
          }}
        >
          <p style={{ margin: 0, fontSize: 16, color: "var(--olive-text)", fontWeight: 500, maxWidth: "34em" }}>
            Sign in free and tap the heart on any recipe to keep it in your favorites.
          </p>
          <AccountNav />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--footer-bg)", color: "#EADFCF" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 20px 32px", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "#F6F0E4",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <Image src="/panda-head.png" alt="" width={40} height={40} style={{ width: 40, height: "auto", display: "block" }} />
                </span>
                <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 700, fontSize: 26, color: "#F6F0E4" }}>Munchly</span>
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "#CFC0AE" }}>
                Make magic. A small, independent app for people who&apos;d rather eat than decide.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D4AF7C" }}>App</span>
                <a href="#spinner" style={{ color: "#EADFCF", fontSize: 15 }}>Spin the wheel</a>
                <a href="#browse" style={{ color: "#EADFCF", fontSize: 15 }}>Recipes</a>
                <Link href="/plan" style={{ color: "#EADFCF", fontSize: 15 }}>Plan your week</Link>
                <Link href="/shopping-list" style={{ color: "#EADFCF", fontSize: 15 }}>Shopping list</Link>
                <Link href="/fridge" style={{ color: "#EADFCF", fontSize: 15 }}>Cook from your fridge</Link>
                <a href="#grows" style={{ color: "#EADFCF", fontSize: 15 }}>What&apos;s next</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#D4AF7C" }}>Munchly</span>
                <a href="#" style={{ color: "#EADFCF", fontSize: 15 }}>About</a>
                <a href="#" style={{ color: "#EADFCF", fontSize: 15 }}>Suggest a recipe</a>
                <a href="#" style={{ color: "#EADFCF", fontSize: 15 }}>Contact</a>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 12,
              paddingTop: 20,
              borderTop: "1px solid #4A3A34",
              fontSize: 14,
              color: "#B3A393",
            }}
          >
            <span>© 2026 Munchly</span>
            <div style={{ display: "flex", gap: 18 }}>
              <a href="#" style={{ color: "#B3A393" }}>Privacy</a>
              <a href="#" style={{ color: "#B3A393" }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrowseCard({ title, sub, rep }: { title: string; sub: string; rep?: Recipe }) {
  const live = !!rep;
  const content = (
    <>
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          background: rep?.imageUrl ? undefined : "repeating-linear-gradient(135deg, var(--chip) 0 12px, var(--line-soft) 12px 24px)",
        }}
      >
        {rep?.imageUrl && (
          <Image src={rep.imageUrl} alt={rep.title} fill sizes="240px" style={{ objectFit: "cover" }} />
        )}
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "5px 11px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: live ? "var(--olive)" : "var(--card)",
            color: live ? "#FBF8F2" : "var(--muted)",
          }}
        >
          {live ? "Live" : "Soon"}
        </span>
      </div>
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 21, lineHeight: 1.15 }}>{title}</span>
        <span style={{ fontSize: 15, color: "var(--muted)" }}>{sub}</span>
      </div>
    </>
  );

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 26,
    overflow: "hidden",
    color: "var(--ink)",
  };

  return live ? (
    <Link href={`/recipes/${rep!.slug}`} style={cardStyle}>
      {content}
    </Link>
  ) : (
    <div style={cardStyle}>{content}</div>
  );
}
