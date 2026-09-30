"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Dish = [string, string, string, string, string];

const DISHES: Record<string, Dish[]> = {
  Anything: [
    ["Tikka masala", "Chicken tikka masala", "Indian", "40 min", "creamy, mild heat"],
    ["Pad thai", "Pad thai", "Thai", "25 min", "sweet, sour, nutty"],
    ["Shakshuka", "Shakshuka", "Middle Eastern", "30 min", "one pan"],
    ["Margherita", "Margherita pizza", "Italian", "35 min", "crowd pleaser"],
    ["Bibimbap", "Bibimbap", "Korean", "35 min", "build your bowl"],
    ["Fish tacos", "Fish tacos", "Mexican", "25 min", "bright and crunchy"],
    ["Risotto", "Mushroom risotto", "Italian", "40 min", "slow and cozy"],
    ["Ramen", "Miso ramen", "Japanese", "30 min", "big bowl energy"],
  ],
  Comfort: [
    ["Mac & cheese", "Baked mac & cheese", "American", "45 min", "golden top"],
    ["Lasagna", "Beef lasagna", "Italian", "1 hr 20", "worth the wait"],
    ["Butter chicken", "Butter chicken", "Indian", "40 min", "rich and mild"],
    ["Shepherd's pie", "Shepherd's pie", "British", "1 hr", "mash on top"],
    ["Noodle soup", "Chicken noodle soup", "American", "40 min", "sick-day classic"],
    ["Dal makhani", "Dal makhani", "Indian", "50 min", "buttery lentils"],
    ["Pot pie", "Chicken pot pie", "American", "1 hr", "flaky lid"],
    ["Katsu curry", "Katsu curry", "Japanese", "45 min", "crispy and saucy"],
  ],
  Quick: [
    ["Fried rice", "Egg fried rice", "Chinese", "15 min", "use up leftovers"],
    ["Pesto pasta", "Pesto pasta", "Italian", "15 min", "five ingredients"],
    ["Quesadillas", "Cheese quesadillas", "Mexican", "10 min", "melty"],
    ["Stir-fry", "Veggie stir-fry", "Chinese", "20 min", "clear the crisper"],
    ["Greek salad", "Greek salad", "Greek", "10 min", "no cooking"],
    ["Tuna melt", "Tuna melt", "American", "12 min", "lunch hero"],
    ["Chana masala", "Chana masala", "Indian", "20 min", "pantry staples"],
    ["Udon", "Garlic butter udon", "Japanese", "15 min", "slurpy"],
  ],
  Spicy: [
    ["Mapo tofu", "Mapo tofu", "Sichuan", "25 min", "numbing heat"],
    ["Vindaloo", "Pork vindaloo", "Indian", "1 hr", "properly hot"],
    ["Jerk chicken", "Jerk chicken", "Jamaican", "50 min", "smoky scotch bonnet"],
    ["Kimchi stew", "Kimchi jjigae", "Korean", "30 min", "tangy and warm"],
    ["Arrabbiata", "Penne arrabbiata", "Italian", "20 min", "chili and garlic"],
    ["Birria tacos", "Birria tacos", "Mexican", "3 hr", "dunk in consommé"],
    ["Tom yum", "Tom yum soup", "Thai", "25 min", "hot and sour"],
    ["Harissa lamb", "Harissa lamb", "North African", "45 min", "smoky red paste"],
  ],
  Sweet: [
    ["Pancakes", "Fluffy pancakes", "American", "20 min", "breakfast for dinner"],
    ["Tiramisu", "Tiramisu", "Italian", "30 min + chill", "coffee and cream"],
    ["Churros", "Churros", "Spanish", "35 min", "cinnamon sugar"],
    ["Sticky rice", "Mango sticky rice", "Thai", "40 min", "coconut-y"],
    ["Banana bread", "Banana bread", "American", "1 hr", "use the brown ones"],
    ["Crêpes", "Crêpes", "French", "25 min", "sweet or savory"],
    ["Gulab jamun", "Gulab jamun", "Indian", "45 min", "syrupy"],
    ["Brownies", "Fudgy brownies", "American", "40 min", "crackly top"],
  ],
};

const PALETTES: Record<string, [string, string][]> = {
  Warm: [
    ["#F6F0E4", "#641F2B"],
    ["#E9D6BA", "#30231F"],
    ["#A65D48", "#FFF7EE"],
    ["#F1E3CC", "#641F2B"],
  ],
  Burgundy: [
    ["#F6F0E4", "#641F2B"],
    ["#641F2B", "#F6F0E4"],
  ],
  Sage: [
    ["#F6F0E4", "#3E4634"],
    ["#C9D0BD", "#30231F"],
    ["#8D9880", "#FFFDF6"],
    ["#E9E1CF", "#3E4634"],
  ],
};

const DARK_TINT: Record<string, string> = {
  "#F1E3CC": "#3A2D22",
  "#EAD8BC": "#33281E",
  "#E6EADF": "#2A3025",
  "#DCE2D3": "#252B21",
  "#F3DDD3": "#3A2621",
  "#ECD0C3": "#33221D",
  "#F6E9D6": "#3B3024",
  "#EFDDC3": "#342A1F",
};

type MoodCard = [string, string, string, string, string, boolean];

const MOOD_CARDS: MoodCard[] = [
  ["Comfort food", "Hearty classics", "mac & cheese", "#F1E3CC", "#EAD8BC", true],
  ["Quick meals", "Ready in 20 min", "pesto pasta", "#E6EADF", "#DCE2D3", true],
  ["Spicy", "Bring the heat", "chili noodles", "#F3DDD3", "#ECD0C3", true],
  ["Sweet", "Desserts and treats", "tiramisu", "#F6E9D6", "#EFDDC3", true],
  ["Light & fresh", "Salads and bowls", "grain bowl", "#E6EADF", "#DCE2D3", false],
  ["Cozy soups", "One pot, big spoon", "tomato soup", "#F3DDD3", "#ECD0C3", false],
];

const CUISINE_CARDS: MoodCard[] = [
  ["Indian", "Curries, dals, breads", "butter chicken", "#F3DDD3", "#ECD0C3", true],
  ["Italian", "Pasta night and beyond", "lasagna", "#F1E3CC", "#EAD8BC", true],
  ["Mexican", "Tacos, bowls, salsas", "birria tacos", "#F6E9D6", "#EFDDC3", true],
  ["Japanese", "Ramen, donburi, katsu", "miso ramen", "#E6EADF", "#DCE2D3", false],
  ["Thai", "Sweet, sour, spicy", "pad thai", "#F3DDD3", "#ECD0C3", false],
  ["Middle Eastern", "Mezze and grills", "shakshuka", "#F1E3CC", "#EAD8BC", false],
];

const FEATURE_CARDS = [
  { tag: "Next up", tagBg: "var(--terra-tint)", tagColor: "var(--terra-text)", title: "Save favorites", body: "Keep the meals you loved. The wheel starts leaning your way." },
  { tag: "Coming soon", tagBg: "var(--chip)", tagColor: "var(--muted)", title: "Plan your week", body: "Spin once for the whole week. Skip the days you're eating out." },
  { tag: "Coming soon", tagBg: "var(--chip)", tagColor: "var(--muted)", title: "Build a shopping list", body: "Your planned meals turn into one list, grouped by aisle." },
  { tag: "Coming soon", tagBg: "var(--chip)", tagColor: "var(--muted)", title: "Cook from your fridge", body: "Tell us what's in the kitchen and we'll find what you can make with it." },
];

export default function Home() {
  const [themeOverride, setThemeOverride] = useState<"light" | "dark" | null>(null);
  const [sysDark, setSysDark] = useState(false);
  const [mood, setMood] = useState("Anything");
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Dish | null>(null);
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
  const list = DISHES[mood];
  const seg = 360 / list.length;
  const pal = PALETTES.Warm;
  const stops = list
    .map((_, i) => `${pal[i % pal.length][0]} ${i * seg}deg ${(i + 1) * seg}deg`)
    .join(",");

  const spin = () => {
    if (spinning) return;
    const i = Math.floor(Math.random() * list.length);
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const base = Math.ceil(rot / 360) * 360 + 360 * 5;
    setSpinning(true);
    setResult(null);
    setRot(base - (i + 0.5) * seg + jitter);
    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setResult(list[i]);
    }, 4200);
  };

  const cards = (tab === "Mood" ? MOOD_CARDS : CUISINE_CARDS).map(
    ([title, sub, photo, tint, tint2, live]) => ({
      title,
      sub,
      photo,
      tint: dark ? DARK_TINT[tint] ?? tint : tint,
      tint2: dark ? DARK_TINT[tint2] ?? tint2 : tint2,
      live,
    })
  );

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
            <a href="#browse" style={{ padding: "10px 14px", borderRadius: 999, fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
              Recipes
            </a>
            <a href="#grows" style={{ padding: "10px 14px", borderRadius: 999, fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
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
            <a
              href="#"
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 15,
                color: "var(--primary-text)",
                border: "1.5px solid var(--border-strong)",
                background: "var(--card)",
              }}
            >
              Sign in
            </a>
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
                {Object.keys(DISHES).map((m) => {
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
                  {list.map((d, i) => {
                    const angle = (i + 0.5) * seg - 90;
                    const ink = pal[i % pal.length][1];
                    return (
                      <div
                        key={d[0]}
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
                          {d[0]}
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
                    {result[1]}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--olive-2)" }}>
                    {result[2]} · {result[3]} · {result[4]}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <a
                    href="#"
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
                  </a>
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
            ) : (
              <p style={{ margin: 0, textAlign: "center", fontSize: 15, color: "var(--muted)" }}>
                {spinning ? "Munchly is thinking…" : "Tap Spin. We'll pick, you eat."}
              </p>
            )}
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
            {cards.map((c) => (
              <a
                key={c.title}
                href="#"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 26,
                  overflow: "hidden",
                  color: "var(--ink)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "4/3",
                    background: `repeating-linear-gradient(135deg, ${c.tint} 0 12px, ${c.tint2} 12px 24px)`,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "ui-monospace, Menlo, monospace",
                      fontSize: 11,
                      color: "var(--muted)",
                      background: "rgba(255,253,249,0.85)",
                      padding: "4px 8px",
                      borderRadius: 8,
                    }}
                  >
                    photo: {c.photo}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "5px 11px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: c.live ? "var(--olive)" : "var(--card)",
                      color: c.live ? "#FBF8F2" : "var(--muted)",
                    }}
                  >
                    {c.live ? "Live" : "Soon"}
                  </span>
                </div>
                <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 21, lineHeight: 1.15 }}>
                    {c.title}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--muted)" }}>{c.sub}</span>
                </div>
              </a>
            ))}
          </div>
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
            The wheel is live today. Next, Munchly learns what you like and helps with the rest of the week.
            We&apos;ll roll these out one at a time.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 16 }}>
          {FEATURE_CARDS.map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 28,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
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
                  color: "var(--faint)",
                  fontSize: 13,
                }}
              >
                preview
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
            </div>
          ))}
        </div>

        <div
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
            Make a free account now and your saved spins will be waiting when favorites go live.
          </p>
          <a
            href="#"
            style={{ padding: "13px 22px", borderRadius: 999, background: "var(--olive)", color: "#FBF8F2", fontWeight: 600, fontSize: 15 }}
          >
            Create an account
          </a>
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
