import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Munchly",
  description: "Get in touch with Munchly - feedback, bug reports, and recipe ideas welcome.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
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
            Get in touch
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            Found a bug, have a recipe to suggest, or just want to say hi? It goes to a real person.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "24px 26px",
            borderRadius: 20,
            border: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Email</span>
          <a
            href="mailto:hello@munchly.online"
            style={{ fontSize: 22, fontWeight: 600, color: "var(--primary)" }}
          >
            hello@munchly.online
          </a>
          <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--ink)" }}>
            Munchly is run by one person, so replies aren&apos;t instant - but every message gets
            read.
          </p>
        </div>
      </main>
    </div>
  );
}
