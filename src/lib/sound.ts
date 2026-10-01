// Tiny Web Audio sound effects for the spin wheel - synthesized on the fly
// (no audio files to host or license), so this is just a couple of oscillator
// / noise bursts scheduled against the wheel's own 4.2s CSS transition.
"use client";

const STORAGE_KEY = "munchly_sound_v1";

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
