"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Confetti from "@/components/Confetti";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  buildDeck,
  formatBestTime,
  formatElapsed,
  LEVEL_ORDER,
  LEVELS,
  loadBestTime,
  recordTime,
  subscribeBestTime,
  type Level,
  type MatchCard,
} from "@/lib/ingredientMatch";
import {
  isSoundEnabled,
  playFlipSound,
  playMatchSound,
  playMismatchSound,
  playTimeUpSound,
  playWinSound,
  setSoundEnabled,
  subscribeSoundSetting,
} from "@/lib/sound";

// How long a non-matching pair stays face-up before flipping back.
const MISMATCH_DELAY_MS = 900;

// The countdown pill turns urgent for the last stretch of a timed level.
const URGENT_MS = 10_000;

// Wrapped so the React Compiler lint doesn't flag Date.now() inside the
// click handler (it's only ever called from event handlers / timers, never
// during render).
const timestamp = () => Date.now();

function StatPill({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 999,
        background: urgent ? "var(--terra-tint)" : "var(--chip)",
        color: urgent ? "var(--terra-text)" : "var(--ink)",
        fontSize: 14,
        fontWeight: 600,
        transition: "background .2s, color .2s",
      }}
    >
      <span style={{ color: urgent ? "var(--terra-text)" : "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </span>
  );
}

// The panel shown when a game ends - a win or (on timed levels) a loss.
function EndPanel({
  panelRef,
  tone,
  title,
  lines,
  buttonLabel,
  onButton,
}: {
  panelRef: React.Ref<HTMLDivElement>;
  tone: "win" | "loss";
  title: string;
  lines: React.ReactNode;
  buttonLabel: string;
  onButton: () => void;
}) {
  const win = tone === "win";
  return (
    <div
      ref={panelRef}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "20px 22px",
        borderRadius: 20,
        border: `1px solid ${win ? "var(--sage-line)" : "var(--border-strong)"}`,
        background: win ? "var(--sage-tint)" : "var(--terra-tint)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-fredoka)",
            fontWeight: 600,
            fontSize: 28,
            color: win ? "var(--olive-text)" : "var(--terra-ink)",
          }}
        >
          {title}
        </span>
        {lines}
      </div>
      <button
        type="button"
        onClick={onButton}
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
        {buttonLabel}
      </button>
    </div>
  );
}

export default function IngredientMatchClient() {
  // Always starts on Easy; picking a level deals a fresh board.
  const [level, setLevel] = useState<Level>("easy");
  const config = LEVELS[level];
  const timeLimitMs = config.timeLimitMs;

  // Lazy initializer - the server and the browser each shuffle their own
  // deck, but that's fine for hydration: a face-down card renders nothing
  // that depends on which ingredient it is (see `seen` below), so the
  // initial HTML is identical card backs either way.
  const [deck, setDeck] = useState<MatchCard[]>(() => buildDeck("easy"));
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
  // Set when a timed level's countdown runs out first.
  const [lostAt, setLostAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  // Whether this game's time beat the stored best (for the win panel).
  const [newBest, setNewBest] = useState(false);
  // Bumped on each win so a fresh <Confetti> mounts; null = not showing.
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endPanelRef = useRef<HTMLDivElement>(null);

  // Both read from localStorage, which the server can't see - the server
  // snapshot (sound on, no best yet) keeps the first client render matching
  // the HTML, then React swaps in the stored value.
  const getBest = useCallback(() => loadBestTime(level), [level]);
  const bestMs = useSyncExternalStore(subscribeBestTime, getBest, () => null);
  // Same site-wide setting as the spin wheel's mute button on the home page.
  const soundOn = useSyncExternalStore(subscribeSoundSetting, isSoundEnabled, () => true);

  const won = finishedAt !== null;
  const lost = lostAt !== null;
  const ended = won || lost;

  // Ticks the visible clock while a game is in progress (4x a second, so a
  // countdown never visibly skips a number).
  useEffect(() => {
    if (startedAt === null || ended) return;
    const id = setInterval(() => setNow(timestamp()), 250);
    return () => clearInterval(id);
  }, [startedAt, ended]);

  // Timed levels: end the game the moment the countdown hits zero.
  useEffect(() => {
    if (timeLimitMs === null || startedAt === null || ended) return;
    const remaining = startedAt + timeLimitMs - timestamp();
    const id = setTimeout(() => {
      if (mismatchTimer.current) {
        clearTimeout(mismatchTimer.current);
        mismatchTimer.current = null;
      }
      const t = timestamp();
      setNow(t);
      setLostAt(t);
      setFlipped([]);
      setLocked(false);
      playTimeUpSound();
    }, Math.max(0, remaining));
    return () => clearTimeout(id);
  }, [timeLimitMs, startedAt, ended]);

  useEffect(() => {
    return () => {
      if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    };
  }, []);

  // The last pair is usually found down at the bottom of the board, below
  // the fold on phones - bring the win / time's-up panel into view.
  useEffect(() => {
    if (!ended) return;
    const panel = endPanelRef.current;
    if (!panel) return;
    // Clear of the sticky header (~67px) with a little breathing room.
    const topGap = 84;
    const rect = panel.getBoundingClientRect();
    if (rect.top >= topGap && rect.bottom <= window.innerHeight) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: rect.top - topGap, behavior: reduce ? "auto" : "smooth" });
  }, [ended]);

  const elapsedMs = startedAt === null ? 0 : (finishedAt ?? lostAt ?? now) - startedAt;
  const remainingMs = timeLimitMs === null ? null : Math.max(0, timeLimitMs - elapsedMs);

  const flip = (index: number) => {
    if (locked || ended) return;
    const card = deck[index];
    if (matched.has(card.pairKey) || flipped.includes(index)) return;

    const t = timestamp();
    // A click that lands in the gap between the countdown hitting zero and
    // its timeout callback running doesn't count.
    if (timeLimitMs !== null && startedAt !== null && t - startedAt >= timeLimitMs) return;
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
      if (nextMatched.size === config.pairs) {
        // startedAt is always set by now (this is at least the 2nd flip).
        setFinishedAt(t);
        setNewBest(recordTime(level, t - (startedAt ?? t)));
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

  const newGame = (nextLevel: Level = level) => {
    if (mismatchTimer.current) {
      clearTimeout(mismatchTimer.current);
      mismatchTimer.current = null;
    }
    setLevel(nextLevel);
    setDeck(buildDeck(nextLevel));
    setFlipped([]);
    setMatched(new Set());
    setSeen(new Set());
    setLocked(false);
    setMoves(0);
    setStartedAt(null);
    setFinishedAt(null);
    setLostAt(null);
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
            Flip two cards at a time and find all {config.pairs} ingredient pairs in as few moves as you can.
            {timeLimitMs !== null && <> You&apos;ve got {Math.round(timeLimitMs / 1000)} seconds - the clock starts on your first flip.</>}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span id="match-level-label" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>
            Level
          </span>
          <div role="group" aria-labelledby="match-level-label" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LEVEL_ORDER.map((l) => {
              const on = l === level;
              const c = LEVELS[l];
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={on}
                  onClick={() => !on && newGame(l)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: on ? "default" : "pointer",
                    border: `1.5px solid ${on ? "var(--primary)" : "var(--border-strong)"}`,
                    background: on ? "var(--primary)" : "var(--card)",
                    color: on ? "#FBF8F2" : "var(--ink)",
                    transition: "all .15s",
                  }}
                >
                  {c.label}
                  <span style={{ fontWeight: 500, opacity: 0.75 }}>
                    {" "}
                    · {c.pairs} pairs{c.timeLimitMs !== null ? `, ${Math.round(c.timeLimitMs / 1000)}s` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <StatPill label="Moves" value={String(moves)} />
            {remainingMs === null ? (
              <StatPill label="Time" value={formatElapsed(elapsedMs)} />
            ) : (
              <StatPill
                label="Time left"
                // Round up, so it reads 0:01 until the very end and only
                // shows 0:00 once time is actually up.
                value={formatElapsed(Math.ceil(remainingMs / 1000) * 1000)}
                urgent={startedAt !== null && remainingMs <= URGENT_MS}
              />
            )}
            <StatPill label="Pairs" value={`${matched.size}/${config.pairs}`} />
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
              onClick={() => newGame()}
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
            <EndPanel
              panelRef={endPanelRef}
              tone="win"
              title="You won! 🎉"
              buttonLabel="Play again"
              onButton={() => newGame()}
              lines={
                <>
                  <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
                    All {config.pairs} pairs in {moves} moves, in {formatBestTime(elapsedMs)}.
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: newBest ? "var(--terra-text)" : "var(--muted)" }}>
                    {newBest
                      ? `🏆 New best time on ${config.label}!`
                      : bestMs !== null
                        ? `Your ${config.label} best is ${formatBestTime(bestMs)} - try to beat it!`
                        : null}
                  </span>
                </>
              }
            />
          )}
          {lost && (
            <EndPanel
              panelRef={endPanelRef}
              tone="loss"
              title="Time's up! ⏰"
              buttonLabel="Try again"
              onButton={() => newGame()}
              lines={
                <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
                  You matched {matched.size} of {config.pairs} pairs. Try again - you&apos;ve got this.
                </span>
              }
            />
          )}
        </div>

        <div className={`mly-match-grid mly-match-grid--${level}`}>
          {deck.map((card, i) => {
            const isMatched = matched.has(card.pairKey);
            const faceUp = isMatched || flipped.includes(i);
            return (
              <button
                key={card.id}
                type="button"
                className="mly-match-card"
                onClick={() => flip(i)}
                disabled={isMatched || lost}
                aria-label={faceUp ? `${card.name}${isMatched ? ", matched" : ""}` : `Card ${i + 1}, face down`}
                style={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  padding: 0,
                  border: "none",
                  background: "none",
                  borderRadius: "var(--match-radius)",
                  perspective: 800,
                  // Lets the faces size their text/emoji off the card's own
                  // width (cqw units), so small Hard cards stay legible.
                  containerType: "inline-size",
                  cursor: faceUp || locked || ended ? "default" : "pointer",
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
                      borderRadius: "var(--match-radius)",
                      background: "var(--primary)",
                      boxShadow: "inset 0 0 0 4px rgba(251, 248, 242, 0.14)",
                      opacity: lost ? 0.55 : 1,
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
                        fontSize: "clamp(13px, 22cqw, 28px)",
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
                      gap: "clamp(2px, 5cqw, 6px)",
                      padding: "clamp(2px, 4cqw, 6px)",
                      borderRadius: "var(--match-radius)",
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
                        <span aria-hidden="true" style={{ fontSize: "clamp(20px, 34cqw, 40px)", lineHeight: 1 }}>
                          {card.emoji}
                        </span>
                        <span
                          className="mly-match-name"
                          style={{
                            fontWeight: 600,
                            fontSize: "clamp(8px, 13cqw, 15px)",
                            lineHeight: 1.15,
                            textAlign: "center",
                            // One line - a broken "Mushroo/m" reads worse.
                            // The longest names ("Mushroom", "Cucumber") fit
                            // Hard cards down to ~360px-wide phones; below
                            // that, globals.css hides the name (emoji only).
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.02em",
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
