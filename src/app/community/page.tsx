import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AccountNav from "@/components/AccountNav";
import LikeButton from "@/components/LikeButton";
import type { CommunityProfile, CommunityRecipe } from "@/lib/community";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Community recipes — Munchly",
  description: "Recipes shared by the Munchly community.",
  alternates: {
    canonical: "/community",
  },
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const viewerId = claims?.claims?.sub as string | undefined;

  const { data: rows } = await supabase
    .from("community_recipes")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  const recipes = (rows ?? []) as CommunityRecipe[];
  const recipeIds = recipes.map((r) => r.id);
  const authorIds = Array.from(new Set(recipes.map((r) => r.user_id)));

  const profileMap = new Map<string, CommunityProfile>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", authorIds);
    (profiles ?? []).forEach((p) => profileMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url }));
  }

  const likeCounts = new Map<string, number>();
  const likedByViewer = new Set<string>();
  if (recipeIds.length > 0) {
    const { data: likes } = await supabase
      .from("community_recipe_likes")
      .select("recipe_id, user_id")
      .in("recipe_id", recipeIds);
    (likes ?? []).forEach((l) => {
      likeCounts.set(l.recipe_id, (likeCounts.get(l.recipe_id) ?? 0) + 1);
      if (viewerId && l.user_id === viewerId) likedByViewer.add(l.recipe_id);
    });
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
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to Munchly
          </Link>
          <AccountNav />
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
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
              Community recipes
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
              {recipes.length} recipe{recipes.length === 1 ? "" : "s"} shared by the Munchly community.
            </p>
          </div>
          <Link
            href="/suggest"
            style={{
              padding: "13px 20px",
              borderRadius: 999,
              background: "var(--primary)",
              color: "#FBF8F2",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Suggest a recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            Nothing here yet.{" "}
            <Link href="/suggest" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Be the first to suggest one.
            </Link>
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            {recipes.map((r) => {
              const author = profileMap.get(r.user_id);
              return (
                <div key={r.id} style={{ display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", background: "var(--card)" }}>
                  <Link
                    href={`/community/${r.id}`}
                    style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "var(--ink)" }}
                  >
                    <div style={{ padding: "18px 18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 17 }}>{r.title}</span>
                      {r.description && (
                        <span style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.4 }}>{r.description}</span>
                      )}
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>
                        {[r.cuisine, r.time_minutes ? `${r.time_minutes} min` : null].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </Link>
                  <div
                    style={{
                      padding: "12px 18px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ position: "relative", width: 24, height: 24, borderRadius: "50%", overflow: "hidden", background: "var(--chip)", flexShrink: 0 }}>
                        <Image src={author?.avatar_url || "/panda-head.png"} alt="" fill sizes="24px" style={{ objectFit: "cover" }} />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {author?.display_name ?? "Someone"}
                      </span>
                    </div>
                    <LikeButton
                      recipeId={r.id}
                      initialLiked={likedByViewer.has(r.id)}
                      initialCount={likeCounts.get(r.id) ?? 0}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
