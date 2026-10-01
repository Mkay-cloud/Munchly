import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SignInGate from "@/components/SignInGate";
import SuggestForm from "./SuggestForm";
import type { CommunityRecipe } from "@/lib/community";

export const metadata: Metadata = {
  title: "Suggest a recipe — Munchly",
  description: "Share a recipe with the Munchly community.",
  alternates: {
    canonical: "/suggest",
  },
};

export default async function SuggestPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  let displayName: string | null = null;
  let mySubmissions: CommunityRecipe[] = [];

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    displayName = profile?.display_name ?? null;

    const { data: rows } = await supabase
      .from("community_recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    mySubmissions = (rows ?? []) as CommunityRecipe[];
  }

  // The recipe being edited, if any - found in the submissions we already
  // fetched above rather than with a second query. If the id doesn't match
  // one of the viewer's own rows (bad link, someone else's recipe), this is
  // just null and the form falls back to "new submission" mode.
  const editingRecipe = edit ? mySubmissions.find((r) => r.id === edit) ?? null : null;

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
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 20px" }}>
          <Link href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to Munchly
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
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
            Suggest a recipe
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Share something you cook with the rest of the Munchly community. Every submission is
            reviewed before it goes live on{" "}
            <Link href="/community" style={{ color: "var(--primary)", fontWeight: 600 }}>
              the community page
            </Link>
            .
          </p>
        </div>

        {!userId ? (
          <SignInGate message="Sign in to suggest a recipe." />
        ) : !displayName ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              alignItems: "flex-start",
              padding: "20px 22px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          >
            <p style={{ margin: 0, fontSize: 16, color: "var(--ink)" }}>
              Set up a display name first, so we know what to call you on your recipe.
            </p>
            <Link
              href="/profile"
              style={{
                padding: "13px 22px",
                borderRadius: 999,
                background: "var(--primary)",
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Set up profile
            </Link>
          </div>
        ) : (
          <SuggestForm
            key={editingRecipe?.id ?? "new"}
            displayName={displayName}
            initialSubmissions={mySubmissions}
            editingRecipe={editingRecipe}
          />
        )}
      </main>
    </div>
  );
}
