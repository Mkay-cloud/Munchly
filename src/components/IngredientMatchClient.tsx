"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Confetti from "@/components/Confetti";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  buildDeck,
  formatBestTime,
  formatElapsed,
  loadBestTime,
  PAIR_COUNT,
  recordTime,
  subscribeBestTime,
  type MatchCard,
} from "@/lib/ingredientMatch";
import {
  isSoundEnabled,
  playFlipSound,
  playMatchSound,
  playMismatchSound,
  playWinSound,
  setSoundEnabled,
  subscribeSoundSetting,
} from "@/lib/sound";

// How long a non-matching pair stays face-up before flipping back.
const MISMATCH_DELAY_MS = 900;

// Wrapped so the React Compiler lint doesn't flag Date.now() inside the
// click handler (it's only ever called from event handlers / timers, never
// during render).
const timestamp = () => Date.now();

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 999,
        background: "var(--chip)",
        color: "var(--ink)",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </span>
  );
}

export default function IngredientMatchClient() {
  // Lazy initializer - the server and the browser each shuffle their own
  // deck, but that's fine for hydration: a face-down card renders nothing
  // that depends on which ingredient it is (see `seen` below), so the
  // initial HTML is 16 identical card backs either way.
  const [deck, setDeck] = useState<MatchCard[]>(() => buildDeck());
  // Indices of the (at most two) unmatched cards currently face-up.
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  // Cards that have been turned over at least once this game. Only these
  // get their ingredient rendered into the DOM, so the board can't be read
  // from the page source / dev tools, while a card flipping back still
  // shows its face for the duration of the animation.
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  // Whether this game's time beat the stored best (for the win panel).
  const [newBest, setNewBest] = useState(false);
  // Bumped on each win so a fresh <Confetti> mounts; null = not showing.
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winPanelRef = useRef<HTMLDivElement>(null);

  // Both read from localStorage, which the server can't see - the server
  // snapshot (sound on, no best yet) keeps the first client render matching
  // the HTML, then React swaps in the stored value.
  const bestMs = useSyncExternalStore(subscribeBestTime, loadBestTime, () => null);
  // Same site-wide setting as the spin wheel's mute button on the home page.
  const soundOn = useSyncExternalStore(subscribeSoundSetting, isSoundEnabled, () => true);

  const won = finishedAt !== null;

  // Ticks the visible clock once a second while a game is in progress.
  useEffect(() => {
    if (startedAt === null || won) return;
    const id = setInterval(() => setNow(timestamp()), 1000);
    return () => clearInterval(id);
  }, [startedAt, won]);

  useEffect(() => {
    return () => {
      if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    };
  }, []);

  // The last pair is usually found down at the bottom of the board, below
  // the fold on phones - bring the "You won!" panel into view.
  useEffect(() => {
    if (!won) return;
    const panel = winPanelRef.current;
    if (!panel) return;
    // Clear of the sticky header (~67px) with a little breathing room.
    const topGap = 84;
    const rect = panel.getBoundingClientRect();
    if (rect.top >= topGap && rect.bottom <= window.innerHeight) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: rect.top - topGap, behavior: reduce ? "auto" : "smooth" });
  }, [won]);

  const elapsedMs = startedAt === null ? 0 : (finishedAt ?? now) - startedAt;

  const flip = (index: number) => {
    if (locked || won) return;
    const card = deck[index];
    if (matched.has(card.pairKey) || flipped.includes(index)) return;

    const t = timestamp();
    if (startedAt === null) {
      setStartedAt(t);
      setNow(t);
    }
    setSeen((prev) => new Set(prev).add(index));
    playFlipSound();

    if (flipped.length === 0) {
      setFlipped([index]);
      return;
    }

    // Second card of the turn - that's one move, match or not.
    const first = flipped[0];
    setMoves((m) => m + 1);

    if (deck[first].pairKey === card.pairKey) {
      const nextMatched = new Set(matched).add(card.pairKey);
      setMatched(nextMatched);
      setFlipped([]);
      if (nextMatched.size === PAIR_COUNT) {
        // startedAt is always set by now (this is at least the 2nd flip).
        setFinishedAt(t);
        setNewBest(recordTime(t - (startedAt ?? t)));
        setConfettiKey(t);
        playWinSound();
      } else {
        playMatchSound();
      }
      return;
    }

    playMismatchSound();
    setFlipped([first, index]);
    setLocked(true);
    mismatchTimer.current = setTimeout(() => {
      setFlipped([]);
      setLocked(false);
      mismatchTimer.current = null;
    }, MISMATCH_DELAY_MS);
  };

  const newGame = () => {
    if (mismatchTimer.current) {
      clearTimeout(mismatchTimer.current);
      mismatchTimer.current = null;
    }
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setSeen(new Set());
    setLocked(false);
    setMoves(0);
    setStartedAt(null);
    setFinishedAt(null);
    setNow(0);
    setNewBest(false);
    setConfettiKey(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      {confettiKey !== null && <Confetti key={confettiKey} onDone={() => setConfettiKey(null)} />}
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
          <Link href="/games" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to games
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
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
            Ingredient Match
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Flip two cards at a time and find all {PAIR_COUNT} ingredient pairs in as few moves as you can.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <StatPill label="Moves" value={String(moves)} />
            <StatPill label="Time" value={formatElapsed(elapsedMs)} />
            <StatPill label="Pairs" value={`${matched.size}/${PAIR_COUNT}`} />
            <StatPill label="Your best:" value={bestMs === null ? "—" : formatBestTime(bestMs)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundOn)}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
              title={soundOn ? "Sound on" : "Sound off"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1.5px solid var(--border)",
                background: "var(--card)",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              <span aria-hidden>{soundOn ? "🔊" : "🔇"}</span>
            </button>
            <button
              type="button"
              onClick={newGame}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "1.5px solid var(--border)",
                background: "var(--card)",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              New game
            </button>
          </div>
        </div>

        <div aria-live="polite" style={{ display: "contents" }}>
          {won && (
            <div
              ref={winPanelRef}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "20px 22px",
                borderRadius: 20,
                border: "1px solid var(--sage-line)",
                background: "var(--sage-tint)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 28, color: "var(--olive-text)" }}>
                  You won! 🎉
                </span>
                <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
                  All {PAIR_COUNT} pairs in {moves} moves, in {formatBestTime(elapsedMs)}.
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: newBest ? "var(--terra-text)" : "var(--muted)" }}>
                  {newBest
                    ? "🏆 New best time!"
                    : bestMs !== null
                      ? `Your best is ${formatBestTime(bestMs)} - try to beat it!`
                      : null}
                </span>
              </div>
              <button
                type="button"
                onClick={newGame}
                style={{
                  padding: "13px 22px",
                  borderRadius: 999,
                  background: "var(--primary)",
                  color: "#FBF8F2",
                  fontWeight: 600,
                  fontSize: 15,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Play again
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "clamp(8px, 2vw, 14px)",
            width: "100%",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {deck.map((card, i) => {
            const isMatched = matched.has(card.pairKey);
            const faceUp = isMatched || flipped.includes(i);
            return (
              <button
                key={card.id}
                type="button"
                className="mly-match-card"
                onClick={() => flip(i)}
                disabled={isMatched}
                aria-label={faceUp ? `${card.name}${isMatched ? ", matched" : ""}` : `Card ${i + 1}, face down`}
                style={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  padding: 0,
                  border: "none",
                  background: "none",
                  borderRadius: 18,
                  perspective: 800,
                  cursor: faceUp || locked || won ? "default" : "pointer",
                }}
              >
                <span
                  className="mly-flip"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "block",
                    transformStyle: "preserve-3d",
                    transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Back of the card - what you see while it's face-down. */}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 18,
                      background: "var(--primary)",
                      boxShadow: "inset 0 0 0 4px rgba(251, 248, 242, 0.14)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: "46%",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        border: "2px dashed rgba(251, 248, 242, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-fredoka)",
                        fontWeight: 600,
                        fontSize: "clamp(18px, 4vw, 28px)",
                        color: "#FBF8F2",
                      }}
                    >
                      ?
                    </span>
                  </span>

                  {/* Face of the card - the ingredient. */}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: 6,
                      borderRadius: 18,
                      border: isMatched ? "1.5px solid var(--sage-line)" : "1.5px solid var(--border-strong)",
                      background: isMatched ? "var(--sage-tint)" : "var(--card)",
                      color: isMatched ? "var(--olive-text)" : "var(--ink)",
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {seen.has(i) && (
                      <>
                        <span aria-hidden="true" style={{ fontSize: "clamp(26px, 7vw, 40px)", lineHeight: 1 }}>
                          {card.emoji}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "clamp(11px, 2.6vw, 15px)",
                            lineHeight: 1.15,
                            textAlign: "center",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {card.name}
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
