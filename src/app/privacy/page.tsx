import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Privacy Policy — Munchly",
  description: "What Munchly collects, why, and how to get in touch about it.",
  alternates: {
    canonical: "/privacy",
  },
};

const LAST_UPDATED = "October 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 20 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 16, lineHeight: 1.7, color: "var(--ink)" }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
          Munchly is a small, independent app, and this page tries to say in plain language what we
          collect, why, and how you can get it removed. If anything here is unclear, just{" "}
          <Link href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>
            ask
          </Link>
          .
        </p>

        <Section title="If you sign in">
          <p style={{ margin: 0 }}>
            Signing in is passwordless - you enter your email, we send you a one-time code or link,
            and that&apos;s it. Your email address is stored by our authentication provider,{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
              Supabase
            </a>
            , so we can recognize you on your next visit.
          </p>
          <p style={{ margin: 0 }}>
            Recipes you save with the heart button are tied to your account and stored in our
            database (also hosted by Supabase), so your favorites follow you between devices when
            you&apos;re signed in.
          </p>
        </Section>

        <Section title="If you don&apos;t sign in">
          <p style={{ margin: 0 }}>
            Your weekly meal plan, shopping list, and fridge/pantry list all work without an
            account. They&apos;re saved only in your own browser&apos;s local storage - never sent
            to or stored on our servers. Clearing your browser data, using a different browser, or
            switching devices will lose them.
          </p>
        </Section>

        <Section title="Analytics">
          <p style={{ margin: 0 }}>
            We use Google Analytics to understand, in aggregate, how people use Munchly - which
            pages get visited, roughly what device or browser is being used, that kind of thing.
            This uses cookies and is standard web analytics; it&apos;s not used to identify you
            personally. You can read{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
              Google&apos;s privacy policy
            </a>{" "}
            or opt out of Google Analytics entirely using{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
              their browser add-on
            </a>
            .
          </p>
        </Section>

        <Section title="Who we share data with">
          <p style={{ margin: 0 }}>
            We don&apos;t sell your data, and we don&apos;t run ads. Munchly runs on a small set of
            service providers who process data on our behalf to make the app work: Supabase
            (accounts and favorites), Sanity (recipe content - no personal data lives here), Vercel
            (hosting), and Google Analytics (usage analytics, above). Each handles data under their
            own privacy policy.
          </p>
        </Section>

        <Section title="Deleting your data">
          <p style={{ margin: 0 }}>
            Want your account and saved favorites removed? Email{" "}
            <a href="mailto:hello@munchly.online" style={{ color: "var(--primary)" }}>
              hello@munchly.online
            </a>{" "}
            and we&apos;ll take care of it. Anything stored only in your browser (your plan,
            shopping list, pantry) you can clear yourself at any time through your browser&apos;s
            settings.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p style={{ margin: 0 }}>
            Munchly is still growing, so this page may change as new features are added. We&apos;ll
            update the date at the top when it does.
          </p>
        </Section>
      </main>
    </div>
  );
}
