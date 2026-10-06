import Link from "next/link";
import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Terms of Use — Munchly",
  description: "The ground rules for using Munchly, sharing recipes and joining in the community.",
  alternates: {
    canonical: "/terms",
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

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
          Munchly is a small, independent app for deciding what to eat, browsing recipes and
          sharing your own. These terms are the ground rules for using it. By using Munchly you
          agree to them - and if anything here is unclear, just{" "}
          <Link href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>
            ask
          </Link>
          .
        </p>

        <Section title="Using Munchly">
          <p style={{ margin: 0 }}>
            Most of Munchly - the wheel, the recipe library, the meal planner, the shopping list,
            the fridge search and the games - works without an account and is free to use for your
            own personal, non-commercial cooking.
          </p>
          <p style={{ margin: 0 }}>
            Signing in is optional and only needed to save favorites, share recipes, comment, and
            set up a profile. You&apos;re responsible for what happens under your account, so keep
            access to the email address you sign in with to yourself.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p style={{ margin: 0 }}>Please don&apos;t use Munchly to:</p>
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>post anything hateful, harassing, threatening, sexually explicit or illegal;</li>
            <li>post spam, advertising, or links that have nothing to do with food;</li>
            <li>pretend to be someone else, or post other people&apos;s personal information;</li>
            <li>upload a profile picture you don&apos;t have the right to use;</li>
            <li>
              try to break, overload, scrape at scale, or get around the security of the site or
              other people&apos;s accounts.
            </li>
          </ul>
          <p style={{ margin: 0 }}>
            We may remove content or close accounts that break these rules.
          </p>
        </Section>

        <Section title="Community recipes and comments">
          <p style={{ margin: 0 }}>
            When you share a recipe, comment, or set a display name and profile picture, it can be
            seen publicly alongside your name. Only share recipes that are your own, or that you
            have the right to share - rewrite instructions in your own words rather than copying
            them from a cookbook or another website, and credit where the idea came from if you
            like.
          </p>
          <p style={{ margin: 0 }}>
            You keep ownership of what you post. By posting it, you give Munchly permission to
            display, store and lightly format it on the site (for example, to fit the recipe
            layout) for as long as it&apos;s up. You can edit or ask us to remove your recipes at
            any time.
          </p>
          <p style={{ margin: 0 }}>
            Submitted recipes, and edits to them, are reviewed before they appear publicly.
            We may decline, edit for formatting, or take down anything that doesn&apos;t fit these
            terms or the spirit of the site, without having to give a reason.
          </p>
        </Section>

        <Section title="Recipes, allergies and food safety">
          <p style={{ margin: 0 }}>
            Recipes on Munchly - including community ones - are for general inspiration. We
            can&apos;t check every ingredient list, cooking time or temperature. Always check
            ingredients for allergies and dietary needs, follow safe food-handling practice, and
            use your own judgment in the kitchen.
          </p>
        </Section>

        <Section title="No warranty">
          <p style={{ margin: 0 }}>
            Munchly is provided &quot;as is&quot;, without guarantees of any kind. We do our best to
            keep it working and accurate, but features may change, break, or be removed, and
            things saved only in your browser (your plan, shopping list, pantry and game scores) can
            be lost if your browser data is cleared. To the extent the law allows, Munchly
            isn&apos;t liable for any loss or harm that comes from using the site or its recipes.
          </p>
        </Section>

        <Section title="Your privacy">
          <p style={{ margin: 0 }}>
            How we handle your data is covered in the{" "}
            <Link href="/privacy" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p style={{ margin: 0 }}>
            Munchly is still growing, so these terms may change as new features are added.
            We&apos;ll update the date at the top when they do. Continuing to use the site after a
            change means you accept the updated terms.
          </p>
        </Section>

        <Section title="Contact">
          <p style={{ margin: 0 }}>
            Questions, a recipe you&apos;d like taken down, or something that breaks these rules?
            Email{" "}
            <a href="mailto:hello@munchly.online" style={{ color: "var(--primary)" }}>
              hello@munchly.online
            </a>{" "}
            or use the{" "}
            <Link href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>
              contact page
            </Link>
            .
          </p>
        </Section>
      </main>
    </div>
  );
}
