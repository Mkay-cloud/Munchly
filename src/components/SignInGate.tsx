"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";

// Shared "you need to sign in to see this" prompt - used by any page gated
// behind auth (favorites, profile, and the community recipe pages coming
// next). Takes just a message so each page can explain why it's gated.
export default function SignInGate({ message }: { message: string }) {
  const [showAuth, setShowAuth] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  if (signedIn) {
    return (
      <p style={{ color: "var(--muted)" }}>
        You&apos;re signed in — refreshing…
        <ReloadOnMount />
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
      <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>{message}</p>
      <button
        onClick={() => setShowAuth(true)}
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
        Sign in
      </button>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setSignedIn(true)} />
      )}
    </div>
  );
}

function ReloadOnMount() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
  return null;
}
