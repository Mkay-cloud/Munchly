"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Confetti from "@/components/Confetti";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  binSelected,
  CELLS,
  CHAIN_BY_ID,
  CHAINS,
  COLS,
  emptyCells,
  formatClock,
  isAdjacent,
  isStuck,
  loadBestTime,
  newGame,
  ORDER_SIZE,
  ordersDone,
  recordTime,
  sameKind,
  shuffleBoard,
  spawn,
  spawnDelayMs,
  subscribeBestTime,
  tap,
  tierOf,
  type GameState,
} from "@/lib/ingredientMerge";
import {
  isSoundEnabled,
  playFlipSound,
  playMatchSound,
  playMismatchSound,
  playServeSound,
  playTapSound,
  playWinSound,
  setSoundEnabled,
  subscribeSoundSetting,
} from "@/lib/sound";

type Phase = "start" | "playing" | "won";

// Wrapped so the React Compiler lint doesn't flag Date.now() in handlers
// (it's only called from event handlers / timers, never during render).
const timestamp = () => Date.now();

function Pill({ label, value }: { label: string; value: string }) {
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
      <span style={{ color: "var(--muted)" }}>{label}</span>
      {value}
    </span>
  );
}

const pillButton = (variant: "primary" | "olive" | "outline"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "11px 18px",
  borderRadius: 999,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  border: `1.5px solid ${variant === "primary" ? "var(--primary)" : variant === "olive" ? "var(--olive)" : "var(--border-strong)"}`,
  background: variant === "primary" ? "var(--primary)" : variant === "olive" ? "var(--olive)" : "var(--card)",
  color: variant === "outline" ? "var(--ink)" : "#FBF8F2",
});

export default function IngredientMergeClient() {
  const [phase, setPhase] = useState<Phase>("start");
  // The board is only dealt when a game starts, so the server and the first
  // client render both show the start screen - no hydration mismatch.
  const [game, setGame] = useState<GameState | null>(null);
  // Source of truth for the game, mirrored into state for rendering. Both
  // taps and the spawn timer go through commit(), so a spawn landing between
  // a render and a tap can never be overwritten by a stale copy.
  const gameRef = useRef<GameState | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [confettiKey, setConfettiKey] = useState<number | null>(null);
  const winPanelRef = useRef<HTMLDivElement>(null);

  const bestMs = useSyncExternalStore(subscribeBestTime, loadBestTime, () => null);
  // Same site-wide setting as every other mute button on Munchly.
  const soundOn = useSyncExternalStore(subscribeSoundSetting, isSoundEnabled, () => true);

  const commit = (next: GameState) => {
    gameRef.current = next;
    setGame(next);
  };

  // Spawn loop: one new base ingredient after a delay that depends on how
  // full the board is at that moment (see spawnDelayMs). Runs independently
  // of the player's taps, so busy tapping never postpones a spawn.
  useEffect(() => {
    if (phase !== "playing") return;
    let id: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const g = gameRef.current;
      const filled = g ? CELLS - emptyCells(g).length : 0;
      id = setTimeout(() => {
        const cur = gameRef.current;
        if (cur) commit(spawn(cur, Math.random(), Math.random()));
        schedule();
      }, spawnDelayMs(filled));
    };
    schedule();
    return () => clearTimeout(id);
  }, [phase]);

  // Clock.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setNow(timestamp()), 250);
    return () => clearInterval(id);
  }, [phase]);

  // Toasts and hints fade on their own.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(id);
  }, [toast]);

  // Bring the win panel into view (it sits above the board).
  useEffect(() => {
    if (phase !== "won") return;
    const panel = winPanelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (rect.top >= 84 && rect.bottom <= window.innerHeight) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: rect.top - 84, behavior: reduce ? "auto" : "smooth" });
  }, [phase]);

  const start = () => {
    const g = newGame();
    commit(g);
    const t = timestamp();
    setStartedAt(t);
    setNow(t);
    setFinishedAt(null);
    setHint(null);
    setToast(null);
    setNewBest(false);
    setConfettiKey(null);
    setPhase("playing");
    playTapSound();
  };

  const win = (t: number) => {
    setFinishedAt(t);
    setNow(t);
    setPreviousBest(loadBestTime());
    setNewBest(recordTime(t - (startedAt ?? t)));
    setConfettiKey((k) => (k ?? 0) + 1);
    setPhase("won");
    playWinSound();
  };

  const onCell = (i: number) => {
    const g = gameRef.current;
    if (!g || phase !== "playing") return;
    const { state, result } = tap(g, i);
    commit(state);
    switch (result.kind) {
      case "select": {
        const t = tierOf(state.board[i]!);
        setHint(`${t.emoji} ${t.name} - tap a matching tile next to it to merge, or an empty square to move it.`);
        playTapSound();
        break;
      }
      case "deselect":
        setHint(null);
        break;
      case "move":
        setHint(null);
        playFlipSound();
        break;
      case "merge": {
        const t = tierOf(result.tile);
        setHint(null);
        setToast({ id: state.merges, text: `${t.emoji} ${t.name}!` });
        playMatchSound();
        break;
      }
      case "serve": {
        const dish = CHAIN_BY_ID[result.chain].tiers.at(-1)!;
        setHint(null);
        setToast({ id: state.merges, text: result.bonus ? `${dish.emoji} Bonus ${dish.name} served!` : `${dish.emoji} ${dish.name} served!` });
        if (ordersDone(state)) win(timestamp());
        else playServeSound();
        break;
      }
      case "too-far":
        setHint("Too far apart - move it right next to its twin first (tap an empty square beside it).");
        playMismatchSound();
        break;
    }
  };

  const addIngredient = () => {
    const g = gameRef.current;
    if (!g || phase !== "playing") return;
    if (!emptyCells(g).length) {
      setHint("The board's full - merge something, or use Shuffle / Bin.");
      playMismatchSound();
      return;
    }
    commit(spawn(g, Math.random(), Math.random()));
    playTapSound();
  };

  const shuffle = () => {
    const g = gameRef.current;
    if (!g || phase !== "playing") return;
    commit(shuffleBoard(g));
    setHint(null);
    playFlipSound();
  };

  const bin = () => {
    const g = gameRef.current;
    if (!g || g.selected === null || phase !== "playing") return;
    commit(binSelected(g));
    setHint(null);
    playFlipSound();
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

  const elapsedMs = startedAt === null ? 0 : (finishedAt ?? now) - startedAt;
  const stuck = phase === "playing" && game !== null && isStuck(game);
  const selected = game?.selected ?? null;
  const selectedTile = selected !== null && game ? game.board[selected] : null;

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

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 20 }}>
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
            Ingredient Merge
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Merge matching ingredients into finished dishes and fill every order. Tap a tile, then tap its twin right next to
            it.
          </p>
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
            <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>How to cook</span>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>
              <li>Tap a tile to pick it up, then tap an <strong>identical tile right next to it</strong> to merge them into the next step.</li>
              <li>Tap an <strong>empty square</strong> to move the tile you picked up.</li>
              <li>Fresh ingredients drop in every couple of seconds - or tap <strong>+ Add</strong> for more.</li>
              <li>Finished dishes go straight to the orders. Fill them all to win!</li>
            </ul>
            <RecipeBook />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Pill label="Your best:" value={bestMs === null ? "—" : formatClock(bestMs)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={start} style={{ ...pillButton("primary"), padding: "14px 26px", fontSize: 16 }}>
                Start cooking
              </button>
              {muteButton}
            </div>
          </div>
        )}

        {phase !== "start" && game && (
          <>
            {/* Orders */}
            <section
              aria-label="Orders"
              style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 18px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--card)" }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Orders</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                {CHAINS.map((c) => {
                  const dish = c.tiers.at(-1)!;
                  const done = Math.min(game.served[c.id], ORDER_SIZE[c.id]);
                  const complete = done >= ORDER_SIZE[c.id];
                  return (
                    <div
                      key={c.id}
                      data-order={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 14,
                        background: complete ? "var(--sage-tint)" : "var(--section)",
                        border: `1.5px solid ${complete ? "var(--sage-line)" : "transparent"}`,
                      }}
                    >
                      <span aria-hidden="true" style={{ fontSize: 26, lineHeight: 1 }}>
                        {dish.emoji}
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: complete ? "var(--olive-text)" : "var(--ink)" }}>{dish.name}</span>
                        <span style={{ fontSize: 13, color: complete ? "var(--olive-text)" : "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                          {complete ? `✓ ${done}/${ORDER_SIZE[c.id]} done` : `${done}/${ORDER_SIZE[c.id]} served`}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Stats */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Pill label="Time" value={formatClock(elapsedMs)} />
                <Pill label="Merges" value={String(game.merges)} />
                <Pill label="Best" value={bestMs === null ? "—" : formatClock(bestMs)} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {muteButton}
                <button type="button" onClick={start} style={{ ...pillButton("outline"), padding: "9px 16px", fontSize: 14 }}>
                  New game
                </button>
              </div>
            </div>

            {phase === "won" && (
              <div
                ref={winPanelRef}
                aria-live="polite"
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
                  <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 28, color: "var(--olive-text)" }}>Order up! 🎉</span>
                  <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
                    Every dish served in {formatClock(elapsedMs)}, with {game.merges} merges.
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: newBest ? "var(--terra-text)" : "var(--muted)" }}>
                    {newBest
                      ? previousBest === null
                        ? "🏆 New best time!"
                        : `🏆 New best time! (was ${formatClock(previousBest)})`
                      : bestMs !== null
                        ? `Your best is ${formatClock(bestMs)} - try to beat it!`
                        : null}
                  </span>
                </div>
                <button type="button" onClick={start} style={{ ...pillButton("primary"), padding: "13px 22px" }}>
                  Play again
                </button>
              </div>
            )}

            {/* Board */}
            <div style={{ position: "relative", width: "100%", maxWidth: 440, margin: "0 auto" }}>
              <div
                role="group"
                aria-label="Kitchen board, 5 by 5"
                className="mly-merge-board"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  gap: "clamp(5px, 1.6vw, 8px)",
                  padding: "clamp(6px, 2vw, 10px)",
                  borderRadius: 22,
                  background: "var(--section)",
                  border: "1px solid var(--border)",
                  opacity: phase === "won" ? 0.6 : 1,
                }}
              >
                {game.board.map((tile, i) => {
                  const isSel = selected === i;
                  const isTwin = !isSel && selectedTile !== null && sameKind(selectedTile, tile);
                  const canMerge = isTwin && selected !== null && isAdjacent(selected, i);
                  const moveTarget = !tile && selectedTile !== null;
                  const t = tile ? tierOf(tile) : null;
                  const row = Math.floor(i / COLS) + 1, col = (i % COLS) + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="mly-merge-cell"
                      data-cell={i}
                      data-kind={tile ? `${tile.chain}-${tile.tier}` : "empty"}
                      onClick={() => onCell(i)}
                      disabled={phase !== "playing"}
                      aria-label={
                        tile
                          ? `${t!.name}${isSel ? ", selected" : canMerge ? ", tap to merge" : ""}, row ${row} column ${col}`
                          : `Empty, row ${row} column ${col}${moveTarget ? ", tap to move here" : ""}`
                      }
                      aria-pressed={tile ? isSel : undefined}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        padding: 0,
                        borderRadius: "clamp(10px, 3vw, 16px)",
                        border: isSel
                          ? "3px solid var(--primary-text)"
                          : canMerge
                            ? "2.5px solid var(--success-line)"
                            : isTwin
                              ? "2px dashed var(--muted)"
                              : tile
                                ? "1.5px solid var(--border-strong)"
                                : moveTarget
                                  ? "1.5px dashed var(--muted)"
                                  : "1.5px dashed var(--line)",
                        background: canMerge ? "var(--success-tint)" : tile ? "var(--card)" : "transparent",
                        boxShadow: isSel ? "0 6px 16px rgba(0,0,0,0.18)" : tile ? "0 1px 0 var(--border)" : "none",
                        transform: isSel ? "scale(1.06)" : "none",
                        zIndex: isSel ? 1 : 0,
                        cursor: phase === "playing" && (tile || moveTarget) ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        containerType: "inline-size",
                      }}
                    >
                      {tile && (
                        <span key={tile.id} className="mly-pop" aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2cqw" }}>
                          <span style={{ fontSize: "clamp(22px, 48cqw, 36px)", lineHeight: 1 }}>{t!.emoji}</span>
                          {/* Tier pips: one per step up the chain. */}
                          <span style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: tile.tier + 1 }, (_, k) => (
                              <span key={k} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--muted)" }} />
                            ))}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {toast && (
                <div
                  key={toast.id}
                  className="mly-toast"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -14,
                    transform: "translateX(-50%)",
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "var(--olive)",
                    color: "#FBF8F2",
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  {toast.text}
                </div>
              )}
            </div>

            {/* Hint / stuck notice */}
            <div aria-live="polite" style={{ minHeight: 24, textAlign: "center", fontSize: 14, fontWeight: 600 }}>
              {phase === "playing" &&
                (stuck ? (
                  <span style={{ color: "var(--danger-ink)" }}>No moves left on a full board - tap Shuffle to mix it up!</span>
                ) : hint ? (
                  <span style={{ color: "var(--ink-2)" }}>{hint}</span>
                ) : (
                  <span style={{ color: "var(--muted)" }}>Tap a tile to pick it up.</span>
                ))}
            </div>

            {/* Controls */}
            {phase === "playing" && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                <button type="button" onClick={addIngredient} style={pillButton("olive")}>
                  + Add
                </button>
                <button type="button" onClick={shuffle} style={pillButton(stuck ? "primary" : "outline")}>
                  🔀 Shuffle
                </button>
                <button
                  type="button"
                  onClick={bin}
                  disabled={selected === null}
                  title="Throw away the tile you've picked up"
                  style={{ ...pillButton("outline"), opacity: selected === null ? 0.45 : 1, cursor: selected === null ? "default" : "pointer" }}
                >
                  🗑️ Bin
                </button>
              </div>
            )}

            <RecipeBook />
          </>
        )}
      </main>
    </div>
  );
}

// The three chains, so players can see what merges into what.
function RecipeBook() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Recipes</span>
      {CHAINS.map((c) => (
        <div
          key={c.id}
          aria-label={c.tiers.map((t) => t.name).join(", then ")}
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, fontSize: 14, color: "var(--ink-2)" }}
        >
          {c.tiers.map((t, k) => (
            <span key={t.name} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {k > 0 && <span aria-hidden="true" style={{ color: "var(--faint)" }}>→</span>}
              <span title={t.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: "var(--chip)" }}>
                <span aria-hidden="true">{t.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</span>
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
