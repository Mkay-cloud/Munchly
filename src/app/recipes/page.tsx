import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllRecipes } from "@/sanity/queries";
import AccountNav from "@/components/AccountNav";
import FavoriteButton from "@/components/FavoriteButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All recipes — Munchly",
  description: "Browse every recipe in the Munchly library.",
  alternates: {
    canonical: "/recipes",
  },
};

export default async function AllRecipesPage() {
  const recipes = await getAllRecipes();

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
            All recipes
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {recipes.length} recipe{recipes.length === 1 ? "" : "s"} in the library so far.
          </p>
        </div>

        {recipes.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No recipes yet — check back soon.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
            {recipes.map((r) => (
              <div key={r._id} style={{ position: "relative" }}>
                <Link
                  href={`/recipes/${r.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    textDecoration: "none",
                    color: "var(--ink)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "var(--section)" }}>
                    {r.imageUrl && (
                      <Image src={r.imageUrl} alt={r.title} fill sizes="240px" style={{ objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{r.title}</span>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      {[r.cuisine, r.timeMinutes ? `${r.timeMinutes} min` : null].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </Link>
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
                  <FavoriteButton slug={r.slug} title={r.title} variant="icon" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
