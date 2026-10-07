import LocaleLink from "@/i18n/Link";
import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { getTranslations } from "@/i18n/getTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const metadata: Metadata = {
  title: "About — Munchly",
  description: "What Munchly is, and why it exists.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage({
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
            {t("aboutPage.title")}
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 16, lineHeight: 1.7, color: "var(--ink)" }}>
          <p style={{ margin: 0 }}>{t("aboutPage.paragraph1")}</p>
          <p style={{ margin: 0 }}>{t("aboutPage.paragraph2")}</p>
          <p style={{ margin: 0 }}>
            {t("aboutPage.paragraph3Before")}
            <LocaleLink href="/contact" style={{ color: "var(--primary)", fontWeight: 600 }}>
              {t("aboutPage.contactLink")}
            </LocaleLink>
            {t("aboutPage.paragraph3After")}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <LocaleLink
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
            {t("nav.browseRecipes")}
          </LocaleLink>
          <LocaleLink
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
            {t("nav.spinTheWheel")}
          </LocaleLink>
        </div>
      </main>
    </div>
  );
}
