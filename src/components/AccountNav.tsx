"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";

type Profile = { display_name: string | null; avatar_url: string | null };

export default function AccountNav() {
  const { session, loading } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // No reset-to-null branch for the signed-out case: when there's no
    // session this component renders the "Sign in" button below and never
    // reads `profile` at all, so there's nothing stale to clear.
    if (!session) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

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

  const label = profile?.display_name || session.user.email;
  const isAdmin =
    !!session.user.email &&
    !!process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
    session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px 6px 6px",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 15,
          color: "var(--primary-text)",
          border: "1.5px solid var(--border-strong)",
          background: "var(--card)",
          cursor: "pointer",
          maxWidth: 220,
        }}
      >
        <span
          style={{
            position: "relative",
            width: 28,
            height: 28,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--chip)",
            flexShrink: 0,
          }}
        >
          <Image src={profile?.avatar_url || "/panda-head.png"} alt="" fill sizes="28px" style={{ objectFit: "cover" }} />
        </span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
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
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 600, fontSize: 14, color: "var(--ink)" }}
          >
            My profile
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 600, fontSize: 14, color: "var(--primary)" }}
            >
              Review submissions
            </Link>
          )}
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
