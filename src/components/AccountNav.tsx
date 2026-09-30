"use client";

import Link from "next/link";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";

export default function AccountNav() {
  const { session, loading } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  if (loading) {
    return <span style={{ width: 42, height: 42, flex: "none" }} />;
  }

  if (!session) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 15,
            color: "var(--primary-text)",
            border: "1.5px solid var(--border-strong)",
            background: "var(--card)",
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
        )}
      </>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 15,
          color: "var(--primary-text)",
          border: "1.5px solid var(--border-strong)",
          background: "var(--card)",
          cursor: "pointer",
          maxWidth: 220,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {session.user.email}
      </button>
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            minWidth: 180,
            boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
            zIndex: 30,
          }}
        >
          <Link
            href="/favorites"
            onClick={() => setMenuOpen(false)}
            style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 600, fontSize: 14, color: "var(--ink)" }}
          >
            My favorites
          </Link>
          <button
            onClick={signOut}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              color: "var(--ink)",
              border: "none",
              background: "none",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
