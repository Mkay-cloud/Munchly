import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SignInGate from "@/components/SignInGate";
import ThemeToggle from "@/components/ThemeToggle";
import AdminReviewClient from "./AdminReviewClient";
import type { CommunityRecipe } from "@/lib/community";

export const metadata: Metadata = {
  title: "Review submissions — Munchly",
  robots: { index: false, follow: false },
};

// Only one person needs this page, so there's no roles table - just a
// server-only env var compared against the signed-in user's email. The
// real access control is the matching RLS policy in Supabase (same email
// check, written directly into the policy), since anyone could otherwise
// call supabase.from("community_recipes").update(...) straight from the
// browser console and skip this page entirely.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;
  const isAdmin = !!email && !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;

  let pendingSubmissions: CommunityRecipe[] = [];
  let pendingEdits: CommunityRecipe[] = [];
  let authorNames: Record<string, string> = {};

  if (isAdmin) {
    const { data: rows } = await supabase
      .from("community_recipes")
      .select("*")
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: true });
    const all = (rows ?? []) as CommunityRecipe[];
    pendingSubmissions = all.filter((r) => r.status === "pending");
    pendingEdits = all.filter((r) => r.status === "approved" && r.has_pending_edit);

    const authorIds = Array.from(new Set([...pendingSubmissions, ...pendingEdits].map((r) => r.user_id)));
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", authorIds);
      authorNames = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name as string]));
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
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to Munchly
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
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
            Review submissions
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            New recipe submissions and edits to already-published recipes, waiting on a decision.
          </p>
        </div>

        {!email ? (
          <SignInGate message="Sign in to review submissions." />
        ) : !isAdmin ? (
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            You don&rsquo;t have access to this page.
          </p>
        ) : (
          <AdminReviewClient
            initialPendingSubmissions={pendingSubmissions}
            initialPendingEdits={pendingEdits}
            authorNames={authorNames}
          />
        )}
      </main>
    </div>
  );
}
