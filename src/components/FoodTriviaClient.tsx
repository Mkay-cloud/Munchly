"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Confetti from "@/components/Confetti";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  dealQuiz,
  loadBestScore,
  QUESTIONS,
  QUESTIONS_PER_QUIZ,
  recordScore,
  resultMessage,
  subscribeBestScore,
  type DealtQuestion,
} from "@/lib/foodTrivia";
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

// How long the answer feedback stays up before moving on by itself. A wrong
// answer gets longer so there's time to read the correct one; "Next" skips
// the wait either way.
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

export default function FoodTriviaClient() {
  const [phase, setPhase] = useState<Phase>("start");
  // Dealt when a quiz starts (never during render), so the server and the
  // first client render both show the start screen - no hydration mismatch.
  const [quiz, setQuiz] = useState<DealtQuestion[]>([]);
  const [index, setIndex] = useState(0);
  // The option picked for the current question; null = not answered yet.
  const [picked, setPicked] = useState<string | null>(null);
  // One entry per answered question: was it right?
  const [results, setResults] = useState<boolean[]>([]);
  const [newBest, setNewBest] = useState(false);
  // Previous best, captured when the quiz ends (for the end-screen message).
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  // The block that should fit on screen: the quiz (progress bar down to the
  // Next button) while playing, or the results card at the end.
  const stageRef = useRef<HTMLDivElement>(null);

  const bestScore = useSyncExternalStore(subscribeBestScore, loadBestScore, () => null);
  // Same site-wide setting as the home page's and Ingredient Match's mute
  // buttons.
  const soundOn = useSyncExternalStore(subscribeSoundSetting, isSoundEnabled, () => true);

  const score = results.filter(Boolean).length;
  const current = quiz[index];
  const isLast = index === quiz.length - 1;

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // After answering, the answer buttons are disabled - hand keyboard focus
  // to "Next" so a keyboard player isn't left stranded.
  // If a long "Not quite - it's …" line wraps on a narrow phone and pushes
  // Next below the fold, nudge it into view.
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

  // On phones the title + intro push the answers' feedback and the Next
  // button below the fold. Whenever a new question (or the results) shows,
  // scroll just enough for the whole block to fit under the sticky header -
  // and not at all when it already fits, as on desktop.
  useEffect(() => {
    if (phase === "start") return;
    const el = stageRef.current;
    if (!el) return;
    const headerGap = 84; // sticky header (~67px) + breathing room
    const rect = el.getBoundingClientRect();
    // Room for the feedback row that appears under the answers.
    // (The feedback row under the answers reserves its height up front, so
    // rect already includes it.)
    const bottom = rect.bottom;
    let delta = 0;
    if (rect.top < headerGap) delta = rect.top - headerGap;
    else if (bottom > viewportBottom() - 12) delta = Math.min(rect.top - headerGap, bottom - viewportBottom() + 12);
    if (delta === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
  }, [phase, index]);

  const start = () => {
    clearTimer();
    setQuiz(dealQuiz());
    setIndex(0);
    setPicked(null);
    setResults([]);
    setNewBest(false);
    setConfettiKey(null);
    setPhase("playing");
    playTapSound();
  };

  const finish = (finalResults: boolean[]) => {
    const finalScore = finalResults.filter(Boolean).length;
    setPreviousBest(loadBestScore());
    const isNewBest = recordScore(finalScore);
    setNewBest(isNewBest);
    setPhase("done");
    if (isNewBest) {
      setConfettiKey((k) => (k ?? 0) + 1);
      playWinSound();
    }
  };

  // Moves on from an answered question. Takes the results explicitly because
  // it's also called from the auto-advance timer, whose closure would
  // otherwise see the results from before this answer.
  const advance = (currentResults: boolean[]) => {
    clearTimer();
    if (index + 1 >= quiz.length) {
      finish(currentResults);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  const choose = (option: string) => {
    if (picked !== null || !current) return;
    const correct = option === current.answer;
    const nextResults = [...results, correct];
    setPicked(option);
    setResults(nextResults);
    playTapSound();
    if (correct) playMatchSound();
    else playMismatchSound();
    advanceTimer.current = setTimeout(
      () => advance(nextResults),
      correct ? ADVANCE_AFTER_CORRECT_MS : ADVANCE_AFTER_WRONG_MS
    );
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

  const bestLabel = bestScore === null ? "—" : `${bestScore}/${QUESTIONS_PER_QUIZ}`;
  const answeredCorrectly = picked !== null && current && picked === current.answer;

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

      <main
        style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 24 }}
      >
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
            Food Trivia
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {QUESTIONS_PER_QUIZ} random questions on world cuisines, ingredients, cooking techniques and food history.
            How many can you get?
          </p>
        </div>

        {phase === "start" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 18,
              padding: "24px 22px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 44, lineHeight: 1 }}>
              🧠
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>Ready to test your food smarts?</span>
              <span style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.5 }}>
                Pick one answer per question - you&apos;ll see straight away if you got it. There are {QUESTIONS.length} questions in
                the pot, so every round is a different mix.
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Pill>
                <span style={{ color: "var(--muted)" }}>Your best:</span> {bestLabel}
              </Pill>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={start} style={primaryButton}>
                Start quiz
              </button>
              {muteButton}
            </div>
          </div>
        )}

        {phase === "playing" && current && (
          <div ref={stageRef} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Progress row */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }} aria-live="polite">
                  Question {index + 1} of {quiz.length}
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
                aria-label="Quiz progress"
                aria-valuemin={0}
                aria-valuemax={quiz.length}
                aria-valuenow={results.length}
                style={{ height: 8, borderRadius: 999, background: "var(--chip)", overflow: "hidden" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(results.length / quiz.length) * 100}%`,
                    background: "var(--primary)",
                    borderRadius: 999,
                    transition: "width .3s ease",
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "22px 20px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--muted)",
                  background: "var(--chip)",
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                {current.topic} · {current.difficulty}
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-fredoka)",
                  fontWeight: 500,
                  fontSize: "clamp(21px, 4.4vw, 27px)",
                  lineHeight: 1.25,
                }}
              >
                {current.question}
              </h2>
            </div>

            {/* Answers - full-width buttons, stacked */}
            <div role="group" aria-label="Answers" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {current.options.map((option, i) => {
                const answered = picked !== null;
                const isAnswer = option === current.answer;
                const isPick = option === picked;
                const state = !answered ? "idle" : isAnswer ? "correct" : isPick ? "wrong" : "dim";
                const colors =
                  state === "correct"
                    ? { bg: "var(--success-tint)", line: "var(--success-line)", ink: "var(--success-ink)" }
                    : state === "wrong"
                      ? { bg: "var(--danger-tint)", line: "var(--danger-line)", ink: "var(--danger-ink)" }
                      : { bg: "var(--card)", line: "var(--border-strong)", ink: "var(--ink)" };
                return (
                  <button
                    key={option}
                    type="button"
                    className="mly-answer"
                    onClick={() => choose(option)}
                    disabled={answered}
                    aria-label={
                      state === "correct"
                        ? `${option} - correct answer`
                        : state === "wrong"
                          ? `${option} - your answer, wrong`
                          : option
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      minHeight: 58,
                      padding: "12px 16px",
                      borderRadius: 16,
                      border: `${state === "correct" || state === "wrong" ? 2 : 1.5}px solid ${colors.line}`,
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
                        fontSize: state === "correct" || state === "wrong" ? 16 : 13,
                        fontWeight: 700,
                        background: state === "correct" || state === "wrong" ? colors.line : "var(--chip)",
                        color: state === "correct" || state === "wrong" ? "var(--card)" : "var(--muted)",
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
              {picked !== null && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: answeredCorrectly ? "var(--success-ink)" : "var(--danger-ink)",
                    }}
                  >
                    {answeredCorrectly ? "✓ Correct!" : `✗ Not quite - it's ${current.answer}.`}
                  </span>
                  <button
                    ref={nextButtonRef}
                    type="button"
                    onClick={() => advance(results)}
                    style={{ ...primaryButton, position: "relative", overflow: "hidden", padding: "12px 22px", fontSize: 15 }}
                  >
                    {isLast ? "See my score →" : "Next →"}
                    {/* Drains while the quiz waits to move on by itself. */}
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
            score={score}
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
  score,
  newBest,
  previousBest,
  bestScore,
  onPlayAgain,
  muteButton,
}: {
  stageRef: React.Ref<HTMLDivElement>;
  score: number;
  newBest: boolean;
  previousBest: number | null;
  bestScore: number | null;
  onPlayAgain: () => void;
  muteButton: React.ReactNode;
}) {
  const total = QUESTIONS_PER_QUIZ;
  const { title, body } = resultMessage(score, total);
  const high = score >= Math.ceil(total * 0.7);
  return (
    <div
      ref={stageRef}
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
        padding: "26px 22px",
        borderRadius: 20,
        border: `1px solid ${high ? "var(--sage-line)" : "var(--border)"}`,
        background: high ? "var(--sage-tint)" : "var(--card)",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>Your score</span>
      <span
        style={{
          fontFamily: "var(--font-fredoka)",
          fontWeight: 600,
          fontSize: "clamp(56px, 14vw, 80px)",
          lineHeight: 1,
          color: "var(--primary-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {score}/{total}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 26, color: high ? "var(--olive-text)" : "var(--ink)" }}>
          {title}
        </span>
        <span style={{ fontSize: 15, color: "var(--ink-2)" }}>{body}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: newBest ? "var(--terra-text)" : "var(--muted)" }}>
        {newBest
          ? previousBest === null
            ? `🏆 New best score: ${score}/${total}!`
            : `🏆 New best score! (was ${previousBest}/${total})`
          : `Your best: ${bestScore ?? score}/${total}${bestScore !== null && bestScore > score ? " - try to beat it!" : ""}`}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={onPlayAgain} style={primaryButton}>
          Play again
        </button>
        <Link
          href="/games"
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            border: "1.5px solid var(--border-strong)",
            background: "var(--card)",
            color: "var(--ink)",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          More games
        </Link>
        {muteButton}
      </div>
    </div>
  );
}
