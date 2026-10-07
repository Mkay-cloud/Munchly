import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/sanity/blogQueries";
import BlogBody from "@/components/BlogBody";
import AccountNav from "@/components/AccountNav";
import SiteMenu from "@/components/SiteMenu";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleLink from "@/i18n/Link";
import { getTranslations } from "@/i18n/getTranslations";
import { isLocale, DEFAULT_LOCALE, BCP47_TAG } from "@/i18n/locales";
import { translateBlogPost } from "@/lib/contentTranslations";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const raw = await getBlogPostBySlug(slug);
  if (!raw) return {};
  const post = await translateBlogPost(raw, locale);
  const path = locale === DEFAULT_LOCALE ? `/${slug}` : `/${locale}/${slug}`;

  return {
    title: `${post.title} — Munchly Blog`,
    description: post.excerpt || post.title,
    alternates: { canonical: path },
    openGraph: post.imageUrl ? { images: [{ url: post.imageUrl }] } : undefined,
  };
}

function formatDate(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const tag = (BCP47_TAG as Record<string, string>)[locale] ?? "en-US";
  return new Date(iso).toLocaleDateString(tag, { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getTranslations(locale);
  const raw = await getBlogPostBySlug(slug);
  if (!raw) notFound();
  const post = await translateBlogPost(raw, locale);

  const dateLabel = formatDate(post.publishedAt, locale);

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
          <LocaleLink href="/blog" style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
            {t("blogPostPage.backLink")}
          </LocaleLink>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SiteMenu />
            <ThemeToggle />
            <AccountNav />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
        {post.imageUrl && (
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: 28, overflow: "hidden", border: "1px solid var(--border)" }}>
            <Image src={post.imageUrl} alt={post.title} fill sizes="800px" style={{ objectFit: "cover" }} priority />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: "clamp(28px, 5vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
            }}
          >
            {post.title}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
            {[post.author, dateLabel].filter(Boolean).join(" · ")}
          </p>
          {post.categories.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {post.categories.map((c) => (
                <span
                  key={c}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "var(--chip)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-2)",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <BlogBody value={post.body} />
      </main>
    </div>
  );
}
