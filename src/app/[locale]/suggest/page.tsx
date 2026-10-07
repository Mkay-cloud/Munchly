import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SignInGate from "@/components/SignInGate";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleLink from "@/i18n/Link";
import { getTranslations } from "@/i18n/getTranslations";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import SuggestForm from "./SuggestForm";
import type { CommunityRecipe } from "@/lib/community";

export const metadata: Metadata = {
  title: "Suggest a recipe — Munchly",
  description: "Share a recipe with the Munchly community.",
  alternates: {
    canonical: "/suggest",
  },
};

export default async function SuggestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getTranslations(locale);
  const { edit } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  let displayName: string | null = null;
  let mySubmissions: CommunityRecipe[] = [];

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    displayName = profile?.display_name ?? null;

    const { data: rows } = await supabase
      .from("community_recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    mySubmissions = (rows ?? []) as CommunityRecipe[];
  }

  // The recipe being edited, if any - found in the submissions we already
  // fetched above rather than with a second query. If the id doesn't match
  // one of the viewer's own rows (bad link, someone else's recipe), this is
  // just null and the form falls back to "new submission" mode.
  const editingRecipe = edit ? mySubmissions.find((r) => r.id === edit) ?? null : null;

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
          <ThemeToggle />
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
            {t("suggestPage.title")}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--muted)" }}>
            {t("suggestPage.subtitleBefore")}
            <LocaleLink href="/community" style={{ color: "var(--primary)", fontWeight: 600 }}>
              {t("suggestPage.subtitleLink")}
            </LocaleLink>
            {t("suggestPage.subtitleAfter")}
          </p>
        </div>

        {!userId ? (
          <SignInGate message={t("suggestPage.signInMessage")} />
        ) : !displayName ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              alignItems: "flex-start",
              padding: "20px 22px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          >
            <p style={{ margin: 0, fontSize: 16, color: "var(--ink)" }}>
              {t("suggestPage.setupNamePrompt")}
            </p>
            <LocaleLink
              href="/profile"
              style={{
                padding: "13px 22px",
                borderRadius: 999,
                background: "var(--primary)",
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {t("suggestPage.setupProfileButton")}
            </LocaleLink>
          </div>
        ) : (
          <SuggestForm
            key={editingRecipe?.id ?? "new"}
            displayName={displayName}
            initialSubmissions={mySubmissions}
            editingRecipe={editingRecipe}
          />
        )}
      </main>
    </div>
  );
}
