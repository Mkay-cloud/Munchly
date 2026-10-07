"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import LocaleLink from "@/i18n/Link";
import { useTranslations } from "@/i18n/LocaleProvider";
import Confetti from "@/components/Confetti";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  buildDeck,
  timeLimitParts,
  formatBestTime,
  formatElapsed,
  LEVEL_ORDER,
  LEVELS,
  loadBestTime,
  nextLevel,
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
import { viewportBottom } from "@/lib/viewport";

// How long a non-matching pair stays face-up before flipping back.
const MISMATCH_DELAY_MS = 900;

// The countdown pill turns urgent for the last stretch of a timed level -
// 20s reads as a fair heads-up on Hard's 3 minutes (10s felt too late).
const URGENT_MS = 20_000;

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

type EndAction = { label: string; onClick: () => void; primary?: boolean };

// The panel shown when a game ends - a win or (on timed levels) a loss.
function EndPanel({
  panelRef,
  tone,
  title,
  lines,
  actions,
}: {
  panelRef: React.Ref<HTMLDivElement>;
  tone: "win" | "loss";
  title: string;
  lines: React.ReactNode;
  actions: EndAction[];
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            style={{
              padding: "13px 22px",
              borderRadius: 999,
              background: a.primary ? "var(--primary)" : "var(--card)",
              color: a.primary ? "#FBF8F2" : "var(--ink)",
              fontWeight: 600,
              fontSize: 15,
              border: a.primary ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
              cursor: "pointer",
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function IngredientMatchClient() {
  const t = useTranslations();
  // Always starts on Easy; picking a level deals a fresh board.
  const [level, setLevel] = useState<Level>("easy");
  const config = LEVELS[level];
  const timeLimitMs = config.timeLimitMs;
  const upNext = nextLevel(level);

  // Translated level name - LEVELS[level].label stays as an internal English
  // id for storage keys etc, but the player always sees the translated word.
  const levelLabel = useCallback(
    (l: Level) => (l === "easy" ? t("ingredientMatchGame.levelEasy") : l === "medium" ? t("ingredientMatchGame.levelMedium") : t("ingredientMatchGame.levelHard")),
    [t]
  );
  // "3 minutes" / "90 seconds", localized.
  const describeTime = useCallback(
    (ms: number) => {
      const { amount, unit } = timeLimitParts(ms);
      if (unit === "seconds") return t(amount === 1 ? "ingredientMatchGame.secondsOne" : "ingredientMatchGame.secondsOther", { count: String(amount) });
      return t(amount === 1 ? "ingredientMatchGame.minutesOne" : "ingredientMatchGame.minutesOther", { count: String(amount) });
    },
    [t]
  );
  // Same but abbreviated ("3 min") for the compact level-select option text.
  const describeTimeShort = useCallback(
    (ms: number) => {
      const { amount, unit } = timeLimitParts(ms);
      if (unit === "seconds") return t(amount === 1 ? "ingredientMatchGame.secondsOne" : "ingredientMatchGame.secondsOther", { count: String(amount) });
      return `${amount} min`;
    },
    [t]
  );

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
    if (rect.top >= topGap && rect.bottom <= viewportBottom()) return;
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
          <LocaleLink href="/games" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {t("gamesCommon.backToGames")}
          </LocaleLink>
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
            {t("ingredientMatchGame.title")}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {t("ingredientMatchGame.subtitle", { pairs: String(config.pairs) })}
            {timeLimitMs !== null && <>{t("ingredientMatchGame.subtitleTimed", { time: describeTime(timeLimitMs) })}</>}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <label htmlFor="match-level" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            {t("ingredientMatchGame.levelLabel")}
          </label>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <select
              id="match-level"
              className="mly-select"
              value={level}
              onChange={(e) => newGame(e.target.value as Level)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                padding: "11px 44px 11px 18px",
                borderRadius: 999,
                border: "1.5px solid var(--border-strong)",
                background: "var(--card)",
                color: "var(--ink)",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {LEVEL_ORDER.map((l) => {
                const c = LEVELS[l];
                return (
                  <option key={l} value={l}>
                    {levelLabel(l)} · {t("ingredientMatchGame.pairsCount", { count: String(c.pairs) })}
                    {c.timeLimitMs !== null ? t("ingredientMatchGame.timerSuffix", { time: describeTimeShort(c.timeLimitMs) }) : ""}
                  </option>
                );
              })}
            </select>
            {/* Custom chevron (the native one is hidden by appearance: none so
                the control looks the same in every browser and both themes). */}
            <svg
              aria-hidden="true"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              style={{ position: "absolute", right: 18, pointerEvents: "none", color: "var(--muted)" }}
            >
              <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <StatPill label={t("ingredientMatchGame.movesLabel")} value={String(moves)} />
            {remainingMs === null ? (
              <StatPill label={t("gamesCommon.time")} value={formatElapsed(elapsedMs)} />
            ) : (
              <StatPill
                label={t("ingredientMatchGame.timeLeftLabel")}
                // Round up, so it reads 0:01 until the very end and only
                // shows 0:00 once time is actually up.
                value={formatElapsed(Math.ceil(remainingMs / 1000) * 1000)}
                urgent={startedAt !== null && remainingMs <= URGENT_MS}
              />
            )}
            <StatPill label={t("ingredientMatchGame.pairsLabel")} value={`${matched.size}/${config.pairs}`} />
            <StatPill label={t("gamesCommon.yourBest")} value={bestMs === null ? "—" : formatBestTime(bestMs)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundOn)}
              aria-pressed={soundOn}
              aria-label={soundOn ? t("gamesCommon.muteAriaOn") : t("gamesCommon.muteAriaOff")}
              title={soundOn ? t("gamesCommon.muteTitleOn") : t("gamesCommon.muteTitleOff")}
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
              {t("gamesCommon.newGame")}
            </button>
          </div>
        </div>

        <div aria-live="polite" style={{ display: "contents" }}>
          {won && (
            <EndPanel
              panelRef={endPanelRef}
              tone="win"
              title={t("ingredientMatchGame.wonTitle")}
              actions={
                upNext
                  ? [
                      { label: t("ingredientMatchGame.nextLevelButton"), onClick: () => newGame(upNext), primary: true },
                      { label: t("gamesCommon.playAgain"), onClick: () => newGame() },
                    ]
                  : [{ label: t("gamesCommon.playAgain"), onClick: () => newGame(), primary: true }]
              }
              lines={
                <>
                  <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
                    {t("ingredientMatchGame.wonSummary", { pairs: String(config.pairs), moves: String(moves), time: formatBestTime(elapsedMs) })}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: newBest ? "var(--terra-text)" : "var(--muted)" }}>
                    {newBest
                      ? t("ingredientMatchGame.wonNewBest", { level: levelLabel(level) })
                      : bestMs !== null
                        ? t("ingredientMatchGame.wonBestLine", { level: levelLabel(level), time: formatBestTime(bestMs) })
                        : null}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>
                    {upNext
                      ? t(level === "easy" ? "ingredientMatchGame.wonNextPromptEasy" : "ingredientMatchGame.wonNextPromptHarder", { level: levelLabel(upNext) })
                      : t("ingredientMatchGame.wonAllDone")}
                  </span>
                </>
              }
            />
          )}
          {lost && (
            <EndPanel
              panelRef={endPanelRef}
              tone="loss"
              title={t("ingredientMatchGame.lostTitle")}
              actions={[{ label: t("ingredientMatchGame.tryAgain"), onClick: () => newGame(), primary: true }]}
              lines={
                <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
                  {t("ingredientMatchGame.lostSummary", { matched: String(matched.size), total: String(config.pairs) })}
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
                aria-label={faceUp ? (isMatched ? t("ingredientMatchGame.matchedAria", { name: card.name }) : card.name) : t("ingredientMatchGame.faceDownAria", { number: String(i + 1) })}
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
