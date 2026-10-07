import Image from "next/image";
import LocaleLink from "@/i18n/Link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getRecipesBySlugs } from "@/sanity/queries";
import { translateRecipes } from "@/lib/contentTranslations";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import FavoritesGate from "./FavoritesGate";
import { getTranslations } from "@/i18n/getTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";

export const metadata: Metadata = {
  title: "My favorites — Munchly",
  alternates: {
    canonical: "/favorites",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getTranslations(locale);
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  let recipes: Awaited<ReturnType<typeof getRecipesBySlugs>> = [];

  if (userId) {
    const { data: rows } = await supabase
      .from("favorites")
      .select("recipe_slug")
      .order("created_at", { ascending: false });
    const slugs = (rows ?? []).map((r) => r.recipe_slug as string);
    recipes = await translateRecipes(await getRecipesBySlugs(slugs), locale);
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
          <LocaleLink href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {t("common.backToMunchly")}
          </LocaleLink>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
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
            {t("favoritesPage.title")}
          </h1>
          {userId && (
            <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
              {t(recipes.length === 1 ? "favoritesPage.countOne" : "favoritesPage.countOther", { count: String(recipes.length) })}
            </p>
          )}
        </div>

        {!userId ? (
          <FavoritesGate />
        ) : recipes.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            {t("favoritesPage.emptyPrompt")}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
            {recipes.map((r) => (
              <LocaleLink
                key={r._id}
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
              </LocaleLink>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
