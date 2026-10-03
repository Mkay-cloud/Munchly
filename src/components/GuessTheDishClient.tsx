"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Confetti from "@/components/Confetti";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  CATEGORIES,
  categoryLabel,
  dealRound,
  DISHES_PER_ROUND,
  loadBestScore,
  recordScore,
  resultMessage,
  subscribeBestScore,
  type Category,
  type DealtDish,
} from "@/lib/guessTheDish";
import {
  isSoundEnabled,
  playMatchSound,
  playMismatchSound,
  playTapSound,
  playWinSound,
  setSoundEnabled,
  subscribeSoundSetting,
} from "@/lib/sound";
import { viewportBottom } from "@/lib/viewport";

// How long the answer feedback stays up before moving on by itself - same
// pacing as Food Trivia: a wrong answer gets longer so there's time to read
// the right one. "Next" skips the wait.
const ADVANCE_AFTER_CORRECT_MS = 1200;
const ADVANCE_AFTER_WRONG_MS = 2000;

const LETTERS = ["A", "B", "C", "D"];

type Phase = "start" | "playing" | "done";

function Pill({ children }: { children: React.ReactNode }) {
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
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </span>
  );
}

const primaryButton: React.CSSProperties = {
  padding: "14px 26px",
  borderRadius: 999,
  background: "var(--primary)",
  color: "#FBF8F2",
  fontWeight: 600,
  fontSize: 16,
  border: "1.5px solid var(--primary)",
  cursor: "pointer",
};

export default function GuessTheDishClient() {
  const [phase, setPhase] = useState<Phase>("start");
  // Which cuisine the rounds draw from; starts on "All cuisines".
  const [category, setCategory] = useState<Category>("all");
  // Dealt on Start (never during render), so the server and the first client
  // render both show the start screen - no hydration mismatch.
  const [round, setRound] = useState<DealtDish[]>([]);
  const [index, setIndex] = useState(0);
  // The option picked for the current dish; null = not answered yet.
  const [picked, setPicked] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  // One entry per finished dish: guessed right?
  const [results, setResults] = useState<boolean[]>([]);
  const [newBest, setNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // The best for whichever category is selected (each has its own key).
  const getBest = useCallback(() => loadBestScore(category), [category]);
  const bestScore = useSyncExternalStore(subscribeBestScore, getBest, () => null);
  // Same site-wide setting as every other mute button on Munchly.
  const soundOn = useSyncExternalStore(subscribeSoundSetting, isSoundEnabled, () => true);

  const dish = round[index];
  const score = results.filter(Boolean).length;
  const isLast = index === round.length - 1;
  const answered = picked !== null;
  const answeredCorrectly = answered && dish !== undefined && picked === dish.name;

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // New dish (or the results): scroll just enough for the clue, all four
  // answers and the Next row to fit under the sticky header - and not at all
  // when they already fit.
  useEffect(() => {
    if (phase === "start") return;
    const el = stageRef.current;
    if (!el) return;
    const headerGap = 84;
    const rect = el.getBoundingClientRect();
    let delta = 0;
    if (rect.top < headerGap) delta = rect.top - headerGap;
    else if (rect.bottom > viewportBottom() - 12) delta = Math.min(rect.top - headerGap, rect.bottom - viewportBottom() + 12);
    if (delta === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
  }, [phase, index]);

  // After answering, the answer buttons are disabled - hand keyboard focus to
  // Next so a keyboard player isn't left stranded. If Next ended up below the
  // fold on a short phone, nudge it into view.
  useEffect(() => {
    if (picked === null) return;
    const next = nextButtonRef.current;
    if (!next) return;
    next.focus({ preventScroll: true });
    const overflow = next.getBoundingClientRect().bottom - (viewportBottom() - 12);
    if (overflow > 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollBy({ top: overflow, behavior: reduce ? "auto" : "smooth" });
    }
  }, [picked]);

  const clearTimer = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  const start = () => {
    clearTimer();
    setRound(dealRound(category));
    setIndex(0);
    setPicked(null);
    setHintShown(false);
    setResults([]);
    setNewBest(false);
    setConfettiKey(null);
    setPhase("playing");
    playTapSound();
  };

  // Picking another cuisine drops whatever was in progress and goes back to
  // a fresh start screen for that selection.
  const changeCategory = (next: Category) => {
    clearTimer();
    setCategory(next);
    setRound([]);
    setIndex(0);
    setPicked(null);
    setHintShown(false);
    setResults([]);
    setNewBest(false);
    setConfettiKey(null);
    setPhase("start");
  };

  const finish = (finalResults: boolean[]) => {
    const finalScore = finalResults.filter(Boolean).length;
    setPreviousBest(loadBestScore(category));
    const isNew = recordScore(category, finalScore);
    setNewBest(isNew);
    setPhase("done");
    if (isNew) {
      setConfettiKey((k) => (k ?? 0) + 1);
      playWinSound();
    }
  };

  // Takes the results explicitly because it's also called from the
  // auto-advance timer, whose closure would otherwise be one dish behind.
  const advance = (currentResults: boolean[]) => {
    clearTimer();
    if (index + 1 >= round.length) {
      finish(currentResults);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
    setHintShown(false);
  };

  const choose = (option: string) => {
    if (picked !== null || !dish) return;
    const correct = option === dish.name;
    const next = [...results, correct];
    setPicked(option);
    setResults(next);
    setHintShown(true);
    playTapSound();
    if (correct) playMatchSound();
    else playMismatchSound();
    advanceTimer.current = setTimeout(() => advance(next), correct ? ADVANCE_AFTER_CORRECT_MS : ADVANCE_AFTER_WRONG_MS);
  };

  const showHint = () => {
    setHintShown(true);
    playTapSound();
  };

  const muteButton = (
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
  );

  const bestLabel = bestScore === null ? "—" : `${bestScore}/${DISHES_PER_ROUND}`;

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
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/games" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to games
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 22 }}>
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
            Guess the Dish
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Read the emoji, pick the dish. {DISHES_PER_ROUND} dishes per round, four options each.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <label htmlFor="dish-category" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
            Cuisine
          </label>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", minWidth: 0, maxWidth: "100%" }}>
            <select
              id="dish-category"
              className="mly-select"
              value={category}
              onChange={(e) => changeCategory(e.target.value as Category)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                maxWidth: "100%",
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            {/* Custom chevron (the native one is hidden by appearance: none so
                the control matches the Ingredient Match level picker). */}
            <svg aria-hidden="true" width="12" height="8" viewBox="0 0 12 8" style={{ position: "absolute", right: 18, pointerEvents: "none", color: "var(--muted)" }}>
              <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {phase === "start" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
              padding: "24px 22px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 44, lineHeight: 1, letterSpacing: "0.06em" }}>
              🍜🥜🦐🍋
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>What&apos;s cooking?</span>
              <span style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.5 }}>
                Each dish is a few emoji - tap the name that matches from four options. Stuck? Tap Show hint before you
                answer. {category === "all" ? "Dishes come from every cuisine" : `All ${category} dishes`}, and every round is a
                new mix.
              </span>
            </div>
            <Pill>
              <span style={{ color: "var(--muted)" }}>Your best{category === "all" ? "" : ` (${category})`}:</span> {bestLabel}
            </Pill>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={start} style={primaryButton}>
                Start game
              </button>
              {muteButton}
            </div>
          </div>
        )}

        {phase === "playing" && dish && (
          <div ref={stageRef} style={{ display: "flex", flexDirection: "column", gap: 14, scrollMarginTop: 84 }}>
            {/* Progress */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }} aria-live="polite">
                  Dish {index + 1} of {round.length}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Pill>
                    <span style={{ color: "var(--muted)" }}>Score</span> {score}
                  </Pill>
                  {muteButton}
                </div>
              </div>
              <div
                role="progressbar"
                aria-label="Round progress"
                aria-valuemin={0}
                aria-valuemax={round.length}
                aria-valuenow={results.length}
                style={{ height: 8, borderRadius: 999, background: "var(--chip)", overflow: "hidden" }}
              >
                <div style={{ height: "100%", width: `${(results.length / round.length) * 100}%`, background: "var(--primary)", borderRadius: 999, transition: "width .3s ease" }} />
              </div>
            </div>

            {/* Clue */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "20px 18px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "var(--card)",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", background: "var(--chip)", padding: "4px 10px", borderRadius: 999 }}>
                  {dish.region}
                </span>
              </div>
              <div
                key={`${dish.id}-${answeredCorrectly ? "right" : "open"}`}
                className={answeredCorrectly ? "mly-pop" : undefined}
                role="img"
                aria-label={`Emoji clue: ${dish.emoji}`}
                style={{ fontSize: "clamp(44px, 13vw, 68px)", lineHeight: 1.15, letterSpacing: "0.08em", wordBreak: "break-all" }}
              >
                {dish.emoji}
              </div>
              {hintShown ? (
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: "var(--ink-2)", maxWidth: 520 }}>
                  <span aria-hidden="true">💡 </span>
                  {dish.hint}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={showHint}
                  style={{ border: "none", background: "none", color: "var(--primary-text)", fontWeight: 600, fontSize: 15, cursor: "pointer", padding: "6px 10px" }}
                >
                  💡 Show hint
                </button>
              )}
            </div>

            {/* Answers - full-width buttons, stacked (same pattern as Food Trivia) */}
            <div role="group" aria-label="Which dish is it?" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dish.options.map((option, i) => {
                const isAnswer = option === dish.name;
                const isPick = option === picked;
                const state = !answered ? "idle" : isAnswer ? "correct" : isPick ? "wrong" : "dim";
                const colors =
                  state === "correct"
                    ? { bg: "var(--success-tint)", line: "var(--success-line)", ink: "var(--success-ink)" }
                    : state === "wrong"
                      ? { bg: "var(--danger-tint)", line: "var(--danger-line)", ink: "var(--danger-ink)" }
                      : { bg: "var(--card)", line: "var(--border-strong)", ink: "var(--ink)" };
                const marked = state === "correct" || state === "wrong";
                return (
                  <button
                    key={`${dish.id}-${option}`}
                    type="button"
                    className="mly-answer"
                    onClick={() => choose(option)}
                    disabled={answered}
                    aria-label={state === "correct" ? `${option} - correct answer` : state === "wrong" ? `${option} - your answer, wrong` : option}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      minHeight: 58,
                      padding: "12px 16px",
                      borderRadius: 16,
                      border: `${marked ? 2 : 1.5}px solid ${colors.line}`,
                      background: colors.bg,
                      color: colors.ink,
                      fontSize: 16,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      textAlign: "left",
                      cursor: answered ? "default" : "pointer",
                      opacity: state === "dim" ? 0.5 : 1,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flex: "none",
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: marked ? 16 : 13,
                        fontWeight: 700,
                        background: marked ? colors.line : "var(--chip)",
                        color: marked ? "var(--card)" : "var(--muted)",
                      }}
                    >
                      {state === "correct" ? "✓" : state === "wrong" ? "✗" : LETTERS[i]}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback + Next */}
            <div aria-live="polite" style={{ minHeight: 48 }}>
              {answered && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: answeredCorrectly ? "var(--success-ink)" : "var(--danger-ink)" }}>
                    {answeredCorrectly ? `✓ Yes - it's ${dish.name}!` : `✗ Not quite - it's ${dish.name}.`}
                  </span>
                  <button
                    ref={nextButtonRef}
                    type="button"
                    onClick={() => advance(results)}
                    style={{ ...primaryButton, position: "relative", overflow: "hidden", padding: "12px 22px", fontSize: 15 }}
                  >
                    {isLast ? "See my score →" : "Next →"}
                    {/* Drains while the game waits to move on by itself. */}
                    <span
                      key={index}
                      aria-hidden="true"
                      className="mly-drain"
                      style={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        height: 3,
                        width: "100%",
                        background: "rgba(251, 248, 242, 0.55)",
                        animationDuration: `${answeredCorrectly ? ADVANCE_AFTER_CORRECT_MS : ADVANCE_AFTER_WRONG_MS}ms`,
                      }}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "done" && (
          <EndScreen
            stageRef={stageRef}
            category={category}
            round={round}
            results={results}
            newBest={newBest}
            previousBest={previousBest}
            bestScore={bestScore}
            onPlayAgain={start}
            muteButton={muteButton}
          />
        )}
      </main>
    </div>
  );
}

function EndScreen({
  stageRef,
  category,
  round,
  results,
  newBest,
  previousBest,
  bestScore,
  onPlayAgain,
  muteButton,
}: {
  stageRef: React.Ref<HTMLDivElement>;
  category: Category;
  round: DealtDish[];
  results: boolean[];
  newBest: boolean;
  previousBest: number | null;
  bestScore: number | null;
  onPlayAgain: () => void;
  muteButton: React.ReactNode;
}) {
  const total = DISHES_PER_ROUND;
  const score = results.filter(Boolean).length;
  const { title, body } = resultMessage(score, total);
  const high = score >= Math.ceil(total * 0.7);
  const scope = category === "all" ? "" : ` ${category}`;
  return (
    <div ref={stageRef} style={{ display: "flex", flexDirection: "column", gap: 16, scrollMarginTop: 84 }}>
      <div
        aria-live="polite"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 14,
          padding: "24px 22px",
          borderRadius: 20,
          border: `1px solid ${high ? "var(--sage-line)" : "var(--border)"}`,
          background: high ? "var(--sage-tint)" : "var(--card)",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>Your score</span>
        <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: "clamp(56px, 14vw, 80px)", lineHeight: 1, color: "var(--primary-text)", fontVariantNumeric: "tabular-nums" }}>
          {score}/{total}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 26, color: high ? "var(--olive-text)" : "var(--ink)" }}>{title}</span>
          <span style={{ fontSize: 15, color: "var(--ink-2)" }}>{body}</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: newBest ? "var(--terra-text)" : "var(--muted)" }}>
          {newBest
            ? previousBest === null
              ? `🏆 New${scope} best score: ${score}/${total}!`
              : `🏆 New${scope} best score! (was ${previousBest}/${total})`
            : `Your${scope} best: ${bestScore ?? score}/${total}${bestScore !== null && bestScore > score ? " - try to beat it!" : ""}`}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={onPlayAgain} style={primaryButton}>
            Play again
          </button>
          <Link
            href="/games"
            style={{ padding: "14px 22px", borderRadius: 999, border: "1.5px solid var(--border-strong)", background: "var(--card)", color: "var(--ink)", fontWeight: 600, fontSize: 16 }}
          >
            More games
          </Link>
          {muteButton}
        </div>
      </div>

      {/* Round recap - see the answers you missed. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 18px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--card)" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>This round</span>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {round.map((d, i) => (
            <li key={d.id} data-recap={results[i] ? "right" : "wrong"} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}>
              <span aria-hidden="true" style={{ flex: "none", width: 22, fontWeight: 700, color: results[i] ? "var(--success-line)" : "var(--danger-line)" }}>
                {results[i] ? "✓" : "✗"}
              </span>
              <span aria-hidden="true" style={{ flex: "none", minWidth: 88, letterSpacing: "0.04em" }}>
                {d.emoji}
              </span>
              <span style={{ fontWeight: 600, minWidth: 0 }}>
                {d.name}
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{results[i] ? " - guessed" : " - missed"}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
