import { client } from "./client";
import { urlFor } from "./image";

export type BlogPostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  categories: string[];
  author: string | null;
  publishedAt: string | null;
  // The site-relative path the image should be served at (preserving the
  // original WordPress /wp-content/uploads/... path via the proxy route at
  // src/app/wp-content/uploads/[...path]/route.ts). Falls back to the raw
  // Sanity CDN URL for any post imported before that path was captured.
  imageUrl: string | null;
};

export type BlogPost = BlogPostSummary & {
  body: unknown[];
};

const SUMMARY_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  categories,
  author,
  publishedAt,
  featuredImage,
  featuredImagePath
`;

type RawSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  categories?: string[] | null;
  author?: string | null;
  publishedAt?: string | null;
  featuredImage?: import("@sanity/image-url").SanityImageSource | null;
  featuredImagePath?: string | null;
};

function toSummary(r: RawSummary): BlogPostSummary {
  return {
    _id: r._id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt ?? null,
    categories: r.categories ?? [],
    author: r.author ?? null,
    publishedAt: r.publishedAt ?? null,
    imageUrl: r.featuredImagePath
      ? r.featuredImagePath
      : r.featuredImage
        ? urlFor(r.featuredImage).width(800).height(600).fit("crop").url()
        : null,
  };
}

// Only ever returns posts with status "published" - drafts (including the
// imported backlog waiting on the daily auto-publish job) never show up here.
export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const raw: RawSummary[] = await client.fetch(
    `*[_type == "blogPost" && status == "published"] | order(publishedAt desc) { ${SUMMARY_FIELDS} }`
  );
  return raw.map(toSummary);
}

// The newest N published posts, for the homepage's blog preview section.
export async function getLatestBlogPosts(limit = 3): Promise<BlogPostSummary[]> {
  const raw: RawSummary[] = await client.fetch(
    `*[_type == "blogPost" && status == "published"] | order(publishedAt desc) [0...${limit}] { ${SUMMARY_FIELDS} }`
  );
  return raw.map(toSummary);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const raw:
    | (RawSummary & { body?: unknown[] | null })
    | null = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug && status == "published"][0] { ${SUMMARY_FIELDS}, body }`,
    { slug }
  );
  if (!raw) return null;
  return { ...toSummary(raw), body: raw.body ?? [] };
}
