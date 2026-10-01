import Link from "next/link";
import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "About — Munchly",
  description: "What Munchly is, and why it exists.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
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
            About Munchly
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 16, lineHeight: 1.7, color: "var(--ink)" }}>
          <p style={{ margin: 0 }}>
            Munchly started from one very ordinary problem: standing in front of the fridge every
            night, not hungry for &ldquo;nothing in particular,&rdquo; and not wanting to make a
            single decision about it. So instead of another recipe site to scroll through, Munchly
            is built around one button: spin the wheel, get an answer, go eat.
          </p>
          <p style={{ margin: 0 }}>
            From there it&apos;s grown into a small toolkit for the rest of the week too - browse
            the full recipe library when you want to pick something yourself, plan out your meals
            for the week ahead, turn that plan straight into a shopping list, and see what you can
            cook from whatever&apos;s already in your fridge.
          </p>
          <p style={{ margin: 0 }}>
            Munchly is an independent, still-growing project. It&apos;s built by one person (with a
            very patient AI co-pilot doing a lot of the typing), so new recipes and features show up
            in small steps rather than all at once. If there&apos;s something you&apos;d love to see
            next, the <Link href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>contact page</Link> goes straight to a real inbox, not a form that disappears into the void.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <Link
            href="/recipes"
            style={{
              padding: "13px 20px",
              borderRadius: 999,
              background: "var(--olive)",
              color: "#FBF8F2",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Browse recipes
          </Link>
          <Link
            href="/"
            style={{
              padding: "13px 20px",
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              background: "var(--card)",
              color: "var(--ink)",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Spin the wheel
          </Link>
        </div>
      </main>
    </div>
  );
}
