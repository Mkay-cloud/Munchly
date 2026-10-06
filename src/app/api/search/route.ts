import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { GAMES } from "@/lib/games";
import { APP_LINKS, ACCOUNT_LINKS, INFO_LINKS } from "@/lib/siteLinks";

// Site-wide search, used by SiteSearch (the search icon in SiteMenu, on
// every page). Recipes and blog posts come from Sanity via `match` (a
// case-insensitive, tokenized "contains" search); games and plain pages
// are small static lists, filtered in memory. Each group is capped at 6
// results so the dropdown never gets too tall.

type ResultItem = { title: string; href: string; sub?: string };

const PAGES = [...APP_LINKS, ...ACCOUNT_LINKS, ...INFO_LINKS];
const LIMIT = 6;

type RawRecipeHit = { title: string; slug: string; cuisine: string | null };
type RawPostHit = { title: string; slug: string; excerpt: string | null };

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ recipes: [], posts: [], games: [], pages: [] });
  }

  const pattern = `*${q}*`;

  const [recipeHits, postHits] = await Promise.all([
    client.fetch<RawRecipeHit[]>(
      `*[_type == "recipe" && (title match $p || cuisine match $p || note match $p)] | order(title asc) [0...6] { title, "slug": slug.current, cuisine }`,
      { p: pattern }
    ),
    client.fetch<RawPostHit[]>(
      `*[_type == "blogPost" && status == "published" && (title match $p || excerpt match $p)] | order(publishedAt desc) [0...6] { title, "slug": slug.current, excerpt }`,
      { p: pattern }
    ),
  ]);

  const needle = q.toLowerCase();

  const games: ResultItem[] = GAMES.filter(
    (g) => g.title.toLowerCase().includes(needle) || g.blurb.toLowerCase().includes(needle)
  )
    .slice(0, LIMIT)
    .map((g) => ({ title: g.title, href: g.href, sub: g.blurb }));

  const pages: ResultItem[] = PAGES.filter((p) => p.label.toLowerCase().includes(needle))
    .slice(0, LIMIT)
    .map((p) => ({ title: p.label, href: p.href }));

  const recipes: ResultItem[] = recipeHits.map((r) => ({
    title: r.title,
    href: `/recipes/${r.slug}`,
    sub: r.cuisine ?? undefined,
  }));

  const posts: ResultItem[] = postHits.map((p) => ({
    title: p.title,
    href: `/${p.slug}`,
    sub: p.excerpt ?? undefined,
  }));

  return NextResponse.json({ recipes, posts, games, pages });
}
