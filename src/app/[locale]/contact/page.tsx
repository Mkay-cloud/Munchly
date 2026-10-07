import LocaleLink from "@/i18n/Link";
import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { getTranslations } from "@/i18n/getTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const metadata: Metadata = {
  title: "Contact — Munchly",
  description: "Get in touch with Munchly - feedback, bug reports, and recipe ideas welcome.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getTranslations(locale);

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
          <LocaleLink href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {t("common.backToMunchly")}
          </LocaleLink>
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
            {t("contactPage.title")}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {t("contactPage.subtitle")}
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
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{t("contactPage.emailLabel")}</span>
          <a
            href="mailto:hello@munchly.online"
            style={{ fontSize: 22, fontWeight: 600, color: "var(--primary)" }}
          >
            hello@munchly.online
          </a>
          <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--ink)" }}>
            {t("contactPage.note")}
          </p>
        </div>
      </main>
    </div>
  );
}
