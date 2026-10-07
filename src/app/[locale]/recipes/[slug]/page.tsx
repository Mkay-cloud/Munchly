import Image from "next/image";
import LocaleLink from "@/i18n/Link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug } from "@/sanity/queries";
import FavoriteButton from "@/components/FavoriteButton";
import AccountNav from "@/components/AccountNav";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { getTranslations } from "@/i18n/getTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { translateRecipe } from "@/lib/contentTranslations";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const raw = await getRecipeBySlug(slug);
  if (!raw) return {};
  const recipe = await translateRecipe(raw, locale);
  const path = locale === DEFAULT_LOCALE ? `/recipes/${slug}` : `/${locale}/recipes/${slug}`;

  return {
    title: `${recipe.title} — Munchly`,
    description: recipe.note || `${recipe.title}${recipe.cuisine ? ` — a ${recipe.cuisine} recipe` : ""} on Munchly.`,
    alternates: {
      canonical: path,
    },
    openGraph: recipe.imageUrl
      ? { images: [{ url: recipe.imageUrl }] }
      : undefined,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getTranslations(locale);
  const raw = await getRecipeBySlug(slug);
  if (!raw) notFound();
  const recipe = await translateRecipe(raw, locale);

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
          <LocaleLink href="/" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {t("common.backToMunchly")}
          </LocaleLink>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
            <AccountNav />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 28 }}>
        {recipe.imageUrl && (
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: 28, overflow: "hidden", border: "1px solid var(--border)" }}>
            <Image src={recipe.imageUrl} alt={recipe.title} fill sizes="800px" style={{ objectFit: "cover" }} priority />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {[recipe.cuisine, recipe.timeMinutes ? `${recipe.timeMinutes} min` : null, recipe.note]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div>
            <FavoriteButton slug={recipe.slug} title={recipe.title} />
          </div>
        </div>

        {recipe.ingredients?.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>{t("recipeDetailPage.ingredients")}</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  style={{
                    padding: "12px 16px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    fontSize: 15,
                  }}
                >
                  {ing}
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipe.instructions?.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 24 }}>{t("recipeDetailPage.instructions")}</h2>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {recipe.instructions.map((block, i) => {
                const text = block.children?.map((c) => c.text).join("") ?? "";
                return (
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
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", paddingTop: 2 }}>{text}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}
