// Game logic for Ingredient Merge (/games/ingredient-merge). Pure functions
// over a plain state object, so the component just commits whatever these
// return - and the rules can be exercised without a browser.

export const COLS = 5;
export const ROWS = 5;
export const CELLS = COLS * ROWS;

// How long until the next base ingredient drops onto an empty cell, by how
// full the board is: quick while it's sparse (so a fast player isn't left
// waiting), slower as it fills up (so a slower player isn't buried). Tuned
// with a simulated player - see the PR description.
export function spawnDelayMs(tilesOnBoard: number): number {
  if (tilesOnBoard < 8) return 1200;
  if (tilesOnBoard < 14) return 2000;
  if (tilesOnBoard < 20) return 3000;
  return 4500;
}
// Base ingredients on the board when a game starts.
const STARTING_TILES = 6;

export type ChainId = "pasta" | "sandwich" | "sundae";

export type Tier = { emoji: string; name: string };

export type Chain = {
  id: ChainId;
  // Lowest tier first; the last one is the finished dish, which gets served
  // straight off the board the moment it's made.
  tiers: Tier[];
};

export const CHAINS: Chain[] = [
  {
    id: "pasta",
    tiers: [
      { emoji: "🍅", name: "Tomato" },
      { emoji: "🔪", name: "Chopped tomato" },
      { emoji: "🥫", name: "Tomato sauce" },
      { emoji: "🍝", name: "Spaghetti" },
    ],
  },
  {
    id: "sandwich",
    tiers: [
      { emoji: "🌾", name: "Wheat" },
      { emoji: "🥣", name: "Dough" },
      { emoji: "🍞", name: "Bread" },
      { emoji: "🥪", name: "Sandwich" },
    ],
  },
  {
    id: "sundae",
    tiers: [
      { emoji: "🍓", name: "Strawberry" },
      { emoji: "🧺", name: "Berry basket" },
      { emoji: "🍦", name: "Berry ice cream" },
      { emoji: "🍨", name: "Sundae" },
    ],
  },
];

export const CHAIN_BY_ID = Object.fromEntries(CHAINS.map((c) => [c.id, c])) as Record<ChainId, Chain>;

// What a round asks for. 2 of each = 6 dishes = 48 base ingredients, which
// lands at roughly 2 minutes at the auto-spawn pace (less with "Add").
export const ORDER_SIZE: Record<ChainId, number> = { pasta: 2, sandwich: 2, sundae: 2 };

export type Tile = { id: number; chain: ChainId; tier: number };

export type GameState = {
  board: (Tile | null)[];
  selected: number | null;
  served: Record<ChainId, number>;
  merges: number;
  nextId: number;
};

export const finalTier = (chain: ChainId) => CHAIN_BY_ID[chain].tiers.length - 1;
export const tierOf = (t: Tile) => CHAIN_BY_ID[t.chain].tiers[t.tier];
export const sameKind = (a: Tile | null, b: Tile | null) => !!a && !!b && a.chain === b.chain && a.tier === b.tier;

export function neighbours(i: number): number[] {
  const r = Math.floor(i / COLS), c = i % COLS;
  const out: number[] = [];
  if (r > 0) out.push(i - COLS);
  if (r < ROWS - 1) out.push(i + COLS);
  if (c > 0) out.push(i - 1);
  if (c < COLS - 1) out.push(i + 1);
  return out;
}

export const isAdjacent = (a: number, b: number) => neighbours(a).includes(b);

export const remaining = (s: GameState, chain: ChainId) => Math.max(0, ORDER_SIZE[chain] - s.served[chain]);
export const ordersDone = (s: GameState) => CHAINS.every((c) => remaining(s, c.id) === 0);
export const emptyCells = (s: GameState) => s.board.flatMap((t, i) => (t ? [] : [i]));

// Any two matching tiles side by side?
export function hasAdjacentPair(board: (Tile | null)[]): boolean {
  return board.some((t, i) => t !== null && neighbours(i).some((j) => j > i && sameKind(t, board[j])));
}

// Stuck = full board and nothing next to its twin. (A full board always
// *contains* a matching pair - there are only 9 kinds of tile that can sit
// on it - so Shuffle can always fix this.)
export const isStuck = (s: GameState) => emptyCells(s).length === 0 && !hasAdjacentPair(s.board);

// Which chains still need dishes - new ingredients only come from those, so
// the board doesn't fill with things nobody ordered.
function spawnableChains(s: GameState): ChainId[] {
  const open = CHAINS.filter((c) => remaining(s, c.id) > 0).map((c) => c.id);
  return open.length ? open : CHAINS.map((c) => c.id);
}

// Drops one base-tier ingredient on a random empty cell. `rollCell` and
// `rollChain` are 0..1 random numbers, passed in so this stays pure.
export function spawn(s: GameState, rollCell: number, rollChain: number): GameState {
  const empty = emptyCells(s);
  if (!empty.length) return s;
  const cell = empty[Math.floor(rollCell * empty.length)];
  const chains = spawnableChains(s);
  const chain = chains[Math.floor(rollChain * chains.length)];
  const board = [...s.board];
  board[cell] = { id: s.nextId, chain, tier: 0 };
  return { ...s, board, nextId: s.nextId + 1 };
}

export function newGame(rand: () => number = Math.random): GameState {
  let s: GameState = {
    board: Array(CELLS).fill(null),
    selected: null,
    served: { pasta: 0, sandwich: 0, sundae: 0 },
    merges: 0,
    nextId: 1,
  };
  // Two of each base ingredient to start, so there's something to merge
  // straight away.
  for (let k = 0; k < STARTING_TILES; k++) {
    const empty = emptyCells(s);
    const cell = empty[Math.floor(rand() * empty.length)];
    const chain = CHAINS[k % CHAINS.length].id;
    const board = [...s.board];
    board[cell] = { id: s.nextId, chain, tier: 0 };
    s = { ...s, board, nextId: s.nextId + 1 };
  }
  return s;
}

export type TapResult =
  | { kind: "select" }
  | { kind: "deselect" }
  | { kind: "move" }
  | { kind: "merge"; tile: Tile }
  | { kind: "serve"; chain: ChainId; bonus: boolean }
  | { kind: "too-far" }
  | { kind: "none" };

// One tap on cell `i`. Rules:
// - nothing selected: tap a tile to select it.
// - tap the selected tile again: deselect.
// - tap an empty cell: move the selected tile there.
// - tap an adjacent identical tile: merge into it (one tier up). A merge that
//   makes the finished dish serves it immediately, freeing the cell.
// - tap an identical tile that isn't adjacent: nothing moves; the UI hints
//   "move it next to the other one".
// - tap any other tile: select that one instead.
export function tap(s: GameState, i: number): { state: GameState; result: TapResult } {
  const tile = s.board[i];
  const sel = s.selected;

  if (sel === null) {
    if (!tile) return { state: s, result: { kind: "none" } };
    return { state: { ...s, selected: i }, result: { kind: "select" } };
  }
  if (sel === i) return { state: { ...s, selected: null }, result: { kind: "deselect" } };

  const from = s.board[sel]!;
  if (!tile) {
    const board = [...s.board];
    board[i] = from;
    board[sel] = null;
    return { state: { ...s, board, selected: null }, result: { kind: "move" } };
  }
  if (sameKind(from, tile)) {
    if (!isAdjacent(sel, i)) return { state: s, result: { kind: "too-far" } };
    const board = [...s.board];
    board[sel] = null;
    const tier = tile.tier + 1;
    const merges = s.merges + 1;
    if (tier === finalTier(tile.chain)) {
      board[i] = null;
      const bonus = remaining(s, tile.chain) === 0;
      const served = { ...s.served, [tile.chain]: s.served[tile.chain] + 1 };
      return { state: { ...s, board, selected: null, merges, served }, result: { kind: "serve", chain: tile.chain, bonus } };
    }
    const made: Tile = { id: s.nextId, chain: tile.chain, tier };
    board[i] = made;
    return { state: { ...s, board, selected: null, merges, nextId: s.nextId + 1 }, result: { kind: "merge", tile: made } };
  }
  return { state: { ...s, selected: i }, result: { kind: "select" } };
}

// Bins the selected tile - the "I'm stuck / I don't want this" escape hatch.
export function binSelected(s: GameState): GameState {
  if (s.selected === null) return s;
  const board = [...s.board];
  board[s.selected] = null;
  return { ...s, board, selected: null };
}

// Rearranges every tile (and gap) at random, guaranteeing at least one pair
// of matching tiles ends up side by side whenever the board has a pair at
// all.
export function shuffleBoard(s: GameState, rand: () => number = Math.random): GameState {
  const cells = [...s.board];
  const permute = () => {
    const a = [...cells];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const tiles = cells.filter((t): t is Tile => t !== null);
  const hasPair = tiles.some((t, i) => tiles.some((u, j) => j > i && sameKind(t, u)));
  let board = permute();
  for (let tries = 0; hasPair && !hasAdjacentPair(board) && tries < 40; tries++) board = permute();
  if (hasPair && !hasAdjacentPair(board)) {
    // Rare after 40 tries - just place one matching pair side by side.
    const a = board.findIndex((t, i) => t && board.some((u, j) => j !== i && sameKind(t, u)));
    const b = board.findIndex((u, j) => j !== a && sameKind(board[a], u));
    const target = neighbours(a)[0];
    [board[target], board[b]] = [board[b], board[target]];
  }
  return { ...s, board, selected: null };
}

// --- Best time -------------------------------------------------------------
// localStorage only (no sign-in), so it's a personal best for this
// browser/device. Separate key from the other games.

const BEST_KEY = "munchly_merge_best_v1";
const BEST_EVENT = "munchly-merge-best-change";

export function loadBestTime(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

// Saves `ms` if it beats the stored best; returns whether it did.
export function recordTime(ms: number): boolean {
  const best = loadBestTime();
  if (best !== null && ms >= best) return false;
  try {
    window.localStorage.setItem(BEST_KEY, String(Math.round(ms)));
  } catch {
    // Storage blocked - still celebrate this visit.
  }
  window.dispatchEvent(new Event(BEST_EVENT));
  return true;
}

export function subscribeBestTime(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === BEST_KEY) onChange();
  };
  window.addEventListener(BEST_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BEST_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
