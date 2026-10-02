"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

export default function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("code");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    // Every code verifies as type "email" now - with "Confirm email"
    // turned off in Supabase (see project notes), a brand-new signup and
    // a returning sign-in both issue the same "email"-typed OTP, so there's
    // no second type to fall back to. (An earlier version tried "email"
    // then "signup" as a fallback, but Supabase invalidates a code on its
    // first verification attempt regardless of whether the type matched -
    // so that fallback never actually got a live code to retry with.)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSuccess();
  };

  // AuthModal only ever mounts client-side in response to a button click
  // (never part of the initial server-rendered tree), so `document` is
  // always available here — no SSR guard needed. The portal escapes the
  // header's `backdropFilter`, which would otherwise turn this fixed-position
  // overlay into one scoped to the header instead of the viewport.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(20,14,10,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--card)",
          borderRadius: 24,
          border: "1px solid var(--border)",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 22, color: "var(--ink)" }}>
            {step === "email" ? "Sign in to Munchly" : "Enter your code"}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
          >
            ×
          </button>
        </div>

        {step === "email" ? (
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
              No password needed. We&apos;ll email you a code to sign in.
            </p>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--border-strong)",
                fontSize: 15,
                background: "var(--bg)",
                color: "var(--ink)",
              }}
            />
            {error && <p style={{ margin: 0, fontSize: 13, color: "#B3261E" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 18px",
                borderRadius: 999,
                background: "var(--primary)",
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
              We sent a code to <strong>{email}</strong>. Enter it below.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              Don&apos;t see it? Check your spam or junk folder — it can land there the first time.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              // Supabase's email OTP length is a project setting, not a
              // fixed 6 digits (this project currently issues 8) - capping
              // this too low silently truncated every code before it was
              // submitted, making every code look "invalid". 10 comfortably
              // covers Supabase's configurable range without hardcoding
              // today's specific length.
              maxLength={10}
              required
              autoFocus
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid var(--border-strong)",
                fontSize: 20,
                letterSpacing: "0.3em",
                textAlign: "center",
                background: "var(--bg)",
                color: "var(--ink)",
              }}
            />
            {error && <p style={{ margin: 0, fontSize: 13, color: "#B3261E" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length < 6}
              style={{
                padding: "13px 18px",
                borderRadius: 999,
                background: "var(--primary)",
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: loading ? "default" : "pointer",
                opacity: loading || code.length < 6 ? 0.7 : 1,
              }}
            >
              {loading ? "Verifying…" : "Verify & sign in"}
            </button>
            {/* 6 is just a sane minimum before enabling submit - Supabase's
                actual required length (8, currently) is enforced server-side
                by verifyOtp, which reports a clear error if it's short. */}
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              style={{ border: "none", background: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
