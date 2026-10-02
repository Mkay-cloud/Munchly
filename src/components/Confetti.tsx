"use client";

import { useEffect, useRef } from "react";

// Munchly palette (fixed hex, not CSS vars - canvas can't read them cheaply,
// and these read fine on both the light and dark backgrounds).
const COLORS = ["#641f2b", "#9c3346", "#a65d48", "#f0b09b", "#e0a838", "#3e4634", "#aeb89f", "#e9d6ba"];

const DURATION_MS = 3800;
const FADE_FROM_MS = 2700;
const PER_CANNON = 80;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  wobble: number;
  round: boolean;
};

// A one-shot, full-viewport confetti burst: two "cannons" in the bottom
// corners fire up and inward, then gravity brings everything down. Drawn on
// a fixed, click-through canvas over the whole page, then calls onDone so
// the parent can unmount it. Skipped entirely for prefers-reduced-motion.
export default function Confetti({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDoneRef.current();
      return;
    }

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Scale launch speed with the screen so the burst reaches roughly the
    // top of the screen on both phones and desktops.
    const power = Math.sqrt(height) * 0.95;
    const pieces: Piece[] = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < PER_CANNON; i++) {
        const angle = (-Math.PI / 2) + side * -(0.15 + Math.random() * 0.55);
        const speed = power * (0.55 + Math.random() * 0.6);
        pieces.push({
          x: side === -1 ? -10 : width + 10,
          y: height + 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 6 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          wobble: Math.random() * Math.PI * 2,
          round: Math.random() < 0.3,
        });
      }
    }

    let raf = 0;
    let start = 0;
    let last = 0;
    const frame = (time: number) => {
      if (!start) start = last = time;
      const elapsed = time - start;
      // Normalise to 60fps steps so the motion is the same on 120Hz screens.
      const step = Math.min((time - last) / 16.67, 3);
      last = time;

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = elapsed < FADE_FROM_MS ? 1 : Math.max(0, 1 - (elapsed - FADE_FROM_MS) / (DURATION_MS - FADE_FROM_MS));

      for (const p of pieces) {
        p.vy += 0.32 * step;
        p.vx *= Math.pow(0.985, step);
        p.vy *= Math.pow(0.985, step);
        p.wobble += 0.12 * step;
        p.x += (p.vx + Math.sin(p.wobble) * 0.8) * step;
        p.y += p.vy * step;
        p.rot += p.vr * step;
        if (p.y > height + 40) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // cos() squashes the strip as it "tumbles", for a cheap 3D feel.
          ctx.fillRect(-p.size / 2, (-p.size / 4) * Math.abs(Math.cos(p.wobble)), p.size, (p.size / 2) * Math.abs(Math.cos(p.wobble)) + 1);
        }
        ctx.restore();
      }

      if (elapsed < DURATION_MS) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
        onDoneRef.current();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="confetti"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 40 }}
    />
  );
}
