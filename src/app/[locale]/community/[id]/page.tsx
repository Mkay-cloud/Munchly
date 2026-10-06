import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AccountNav from "@/components/AccountNav";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import LikeButton from "@/components/LikeButton";
import SignInGate from "@/components/SignInGate";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import CommentForm from "./CommentForm";
import { splitLines, type CommunityComment, type CommunityProfile, type CommunityRecipe } from "@/lib/community";

export const revalidate = 30;

async function getRecipe(id: string) {
  const supabase = await createClient();
  // RLS already limits this to approved recipes, plus the owner's own
  // pending/rejected ones - no status check needed here, a hidden recipe
  // simply comes back as no row.
  const { data } = await supabase.from("community_recipes").select("*").eq("id", id).maybeSingle();
  return data as CommunityRecipe | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) return {};

  return {
    title: `${recipe.title} — Munchly community`,
    description: recipe.description || `A recipe shared on Munchly${recipe.cuisine ? ` - ${recipe.cuisine}` : ""}.`,
    alternates: {
      canonical: `/community/${id}`,
    },
    robots: recipe.status === "approved" ? undefined : { index: false, follow: false },
  };
}

export default async function CommunityRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const viewerId = claims?.claims?.sub as string | undefined;

  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const { data: authorRow } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", recipe.user_id)
    .maybeSingle();
  const author = authorRow as CommunityProfile | null;

  const { data: likeRows } = await supabase.from("community_recipe_likes").select("user_id").eq("recipe_id", id);
  const likeCount = likeRows?.length ?? 0;
  const likedByViewer = !!viewerId && (likeRows ?? []).some((l) => l.user_id === viewerId);

  const { data: commentRows } = await supabase
    .from("community_recipe_comments")
    .select("*")
    .eq("recipe_id", id)
    .order("created_at", { ascending: true });
  const comments = (commentRows ?? []) as CommunityComment[];

  const commenterIds = Array.from(new Set(comments.map((c) => c.user_id)));
  const commenterMap = new Map<string, CommunityProfile>();
  if (commenterIds.length > 0) {
    const { data: commenterProfiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", commenterIds);
    (commenterProfiles ?? []).forEach((p) =>
      commenterMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url })
    );
  }

  const isOwner = viewerId === recipe.user_id;

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
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/community" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            ← Back to community recipes
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
            <AccountNav />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        {isOwner && recipe.status !== "approved" && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 16,
              background: recipe.status === "pending" ? "var(--chip)" : "#FBEAEA",
              color: recipe.status === "pending" ? "var(--muted)" : "#B3261E",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {recipe.status === "pending"
              ? "This is only visible to you until it's approved."
              : "This submission wasn't approved, and is only visible to you."}
          </div>
        )}

        {isOwner && recipe.status === "approved" && recipe.has_pending_edit && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 16,
              background: "var(--chip)",
              color: "var(--muted)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Your edit is under review. Everyone else still sees the version below until it&rsquo;s approved.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            {recipe.title}
          </h1>
          {recipe.description && (
            <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>{recipe.description}</p>
          )}
          <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }}>
            {[recipe.cuisine, recipe.time_minutes ? `${recipe.time_minutes} min` : null].filter(Boolean).join(" · ")}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "var(--chip)", flexShrink: 0 }}>
              <Image src={author?.avatar_url || "/panda-head.png"} alt="" fill sizes="28px" style={{ objectFit: "cover" }} />
            </div>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>by {author?.display_name ?? "Someone"}</span>
          </div>

          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <LikeButton recipeId={recipe.id} initialLiked={likedByViewer} initialCount={likeCount} />
            {isOwner && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Link href={`/suggest?edit=${recipe.id}`} style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                  Edit recipe
                </Link>
                <DeleteRecipeButton recipeId={recipe.id} redirectTo="/suggest" />
              </div>
            )}
          </div>
        </div>

        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>Ingredients</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {splitLines(recipe.ingredients).map((ing, i) => (
              <li key={i} style={{ padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, fontSize: 15 }}>
                {ing}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>Instructions</h2>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {splitLines(recipe.instructions).map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span
                  style={{
                    flex: "none",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#FBF8F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", paddingTop: 2 }}>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>

          {comments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {comments.map((c) => {
                const commenter = commenterMap.get(c.user_id);
                return (
                  <div key={c.id} style={{ display: "flex", gap: 12 }}>
                    <div style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: "var(--chip)", flexShrink: 0 }}>
                      <Image src={commenter?.avatar_url || "/panda-head.png"} alt="" fill sizes="32px" style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{commenter?.display_name ?? "Someone"}</span>
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--ink)" }}>{c.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewerId ? (
            <CommentForm recipeId={recipe.id} />
          ) : (
            <SignInGate message="Sign in to leave a comment." />
          )}
        </section>
      </main>
    </div>
  );
}
