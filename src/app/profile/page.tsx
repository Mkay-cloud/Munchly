import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SignInGate from "@/components/SignInGate";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "My profile — Munchly",
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const email = data?.claims?.email as string | undefined;

  let initialDisplayName = "";
  let initialAvatarUrl: string | null = null;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      initialDisplayName = profile.display_name ?? "";
      initialAvatarUrl = profile.avatar_url ?? null;
    } else if (email) {
      // No profile row yet - suggest something based on their email so the
      // field isn't just blank on a first visit.
      initialDisplayName = email.split("@")[0];
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
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
          <Link href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to Munchly
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/suggest" className="hidden sm:inline" style={{ fontWeight: 600, fontSize: 15, color: "var(--primary)" }}>
              Suggest a recipe
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
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
            My profile
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            This is how you&apos;ll show up on recipes you submit and comments you leave.
          </p>
        </div>

        {!userId ? (
          <SignInGate message="Sign in to set up your profile." />
        ) : (
          <ProfileClient initialDisplayName={initialDisplayName} initialAvatarUrl={initialAvatarUrl} />
        )}
      </main>
    </div>
  );
}
