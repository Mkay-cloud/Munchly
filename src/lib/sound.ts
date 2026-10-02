// Tiny Web Audio sound effects for the spin wheel and the games - synthesized
// on the fly (no audio files to host or license), so this is just a few
// oscillator / noise bursts. One shared on/off setting covers the whole site.
"use client";

const STORAGE_KEY = "munchly_sound_v1";
// Fired on this tab when setSoundEnabled() changes the setting (the native
// "storage" event only fires in *other* tabs).
const CHANGE_EVENT = "munchly-sound-change";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!ctx) ctx = new AudioContextCtor();
  // Safari/iOS suspend the context until a user-gesture-triggered resume -
  // spin() calls this synchronously from a click handler, so this qualifies.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    // Storage blocked (private browsing etc.) - default to on.
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    // Storage full or blocked - the toggle still works for this visit, it
    // just won't be remembered next time. Not worth surfacing to the user.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// For useSyncExternalStore - lets a component read the setting without a
// server/client hydration mismatch, and stay in sync if it's toggled in
// another tab.
export function subscribeSoundSetting(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// One short burst of filtered noise = a single "tick", like a wheel passing
// a segment boundary.
function tick(context: AudioContext, when: number, strength: number) {
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * 0.03));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1500;
  filter.Q.value = 1.4;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.22 * strength, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.035);

  source.connect(filter).connect(gain).connect(context.destination);
  source.start(when);
  source.stop(when + 0.04);
}

// Plays a sequence of ticks that bunch up early and spread out toward the
// end, mirroring the wheel's own ease-out deceleration (the CSS transition
// is `transform 4.2s cubic-bezier(0.12,0.7,0.14,1)`).
export function playSpinSound(durationMs: number): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;

  const duration = durationMs / 1000;
  const now = context.currentTime;
  const tickCount = 26;
  for (let k = 1; k <= tickCount; k++) {
    const p = k / tickCount;
    const t = duration * (1 - Math.pow(1 - p, 3));
    const strength = 1 - p * 0.55;
    tick(context, now + t, strength);
  }
}

// A bright little two-note "ta-da" for when the wheel lands on a result.
export function playLandSound(): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;

  const now = context.currentTime;
  const notes = [1046.5, 1318.5]; // C6, E6
  notes.forEach((freq, i) => {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = context.createGain();
    const start = now + i * 0.07;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.28, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

    osc.connect(gain).connect(context.destination);
    osc.start(start);
    osc.stop(start + 0.6);
  });
}

// --- Ingredient Match (/games/ingredient-match) ---------------------------

// One enveloped oscillator note - the building block for the game sounds.
function note(
  context: AudioContext,
  freq: number,
  start: number,
  duration: number,
  { type = "sine", peak = 0.2, endFreq }: { type?: OscillatorType; peak?: number; endFreq?: number } = {}
) {
  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(context.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

// A light papery "flick" for turning a card over.
export function playFlipSound(): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;

  const now = context.currentTime;
  const length = 0.06;
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * length));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(3600, now + length);

  const gain = context.createGain();
  gain.gain.value = 0.32;

  source.connect(filter).connect(gain).connect(context.destination);
  source.start(now);
  source.stop(now + length + 0.02);
}

// Delay before a pair's result sound, so the second card's flip is heard
// first.
const RESULT_OFFSET = 0.12;

// Two bright rising notes - "got it!".
export function playMatchSound(): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;

  const t = context.currentTime + RESULT_OFFSET;
  note(context, 783.99, t, 0.22, { type: "triangle", peak: 0.22 }); // G5
  note(context, 1174.66, t + 0.09, 0.38, { type: "triangle", peak: 0.22 }); // D6
}

// A soft, low two-step "bwomp" downwards - "nope".
export function playMismatchSound(): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;

  const t = context.currentTime + RESULT_OFFSET;
  note(context, 311.13, t, 0.16, { type: "triangle", peak: 0.2, endFreq: 293.66 }); // Eb4 -> D4
  note(context, 233.08, t + 0.15, 0.32, { type: "triangle", peak: 0.2, endFreq: 196 }); // Bb3 -> G3
}

// A quick rising arpeggio into a sparkly major chord - "you won!".
export function playWinSound(): void {
  if (!isSoundEnabled()) return;
  const context = getContext();
  if (!context) return;

  const t = context.currentTime + RESULT_OFFSET;
  const run = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5 E5 G5 C6 E6
  run.forEach((freq, i) => note(context, freq, t + i * 0.075, 0.25, { type: "triangle", peak: 0.18 }));

  const chordAt = t + run.length * 0.075 + 0.02;
  [1046.5, 1318.51, 1567.98, 2093].forEach((freq) =>
    note(context, freq, chordAt, 1.1, { type: "sine", peak: 0.09 })
  );
  // Little twinkles on top.
  [2637, 3136, 2793.83, 3520].forEach((freq, i) =>
    note(context, freq, chordAt + 0.12 + i * 0.11, 0.18, { type: "sine", peak: 0.05 })
  );
}
