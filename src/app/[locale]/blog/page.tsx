import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/sanity/blogQueries";
import AccountNav from "@/components/AccountNav";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Munchly",
  description: "Recipes, kitchen notes and cooking stories from Munchly.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
            <AccountNav />
          </div>
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
            Blog
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Recipes, kitchen notes and cooking stories.
          </p>
        </div>

        {posts.length === 0 ? (
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            New posts are on their way — check back soon.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/${post.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 16,
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--ink)",
                }}
              >
                {post.imageUrl && (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden" }}>
                    <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 600px) 100vw, 320px" style={{ objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 19, lineHeight: 1.25 }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
