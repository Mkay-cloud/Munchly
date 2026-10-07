import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateTexts } from "@/lib/translate";
import type { Locale } from "@/i18n/locales";
import type { Recipe } from "@/sanity/queries";
import type { BlogPost, BlogPostSummary } from "@/sanity/blogQueries";

// Machine-translates Sanity recipe/blog content (title, note, ingredients,
// instructions, excerpt, body) into the non-English locales, with the
// result cached in Supabase's content_translations table so DeepL is only
// ever called once per (item, locale) - see
// scripts/supabase-content-translations.sql for the table and the
// reasoning. Everything here fails soft: no DEEPL_API_KEY, no
// SUPABASE_SERVICE_ROLE_KEY, or a DeepL error all just fall back to the
// original English content rather than breaking the page.
//
// Deliberately NOT translated: slug, cuisine, moods, tags, timeMinutes,
// imageUrl, categories, author, publishedAt. Those are either internal
// matching/storage keys (same reasoning as DAY_LABEL_KEYS/MOOD_LABEL_KEYS
// in lib/weekPlan.ts - recipe.moods and recipe.cuisine are compared
// against literal English strings elsewhere) or not free text to begin
// with.

function hashOf(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

type PortableSpan = { _type?: string; text?: string; [key: string]: unknown };
type PortableBlock = { _type?: string; children?: PortableSpan[]; [key: string]: unknown };

async function readCache(contentType: string, contentId: string, locale: string) {
  const admin = createAdminClient();
  if (!admin) return { admin: null, row: null as { source_hash: string; fields: Record<string, unknown> } | null };
  const { data } = await admin
    .from("content_translations")
    .select("source_hash, fields")
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("locale", locale)
    .maybeSingle();
  return { admin, row: (data as { source_hash: string; fields: Record<string, unknown> } | null) ?? null };
}

async function writeCache(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  contentType: string,
  contentId: string,
  locale: string,
  sourceHash: string,
  fields: Record<string, unknown>
) {
  await admin.from("content_translations").upsert(
    {
      content_type: contentType,
      content_id: contentId,
      locale,
      source_hash: sourceHash,
      fields,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "content_type,content_id,locale" }
  );
}

// --- Recipes -----------------------------------------------------------

type RecipeFields = { title: string; note: string | null; ingredients: string[]; instructionTexts: string[] };

export async function translateRecipe(recipe: Recipe, locale: Locale): Promise<Recipe> {
  if (locale === "en") return recipe;

  const instructionTexts = recipe.instructions.map((b) => b.children?.map((c) => c.text ?? "").join("") ?? "");
  const source = { title: recipe.title, note: recipe.note, ingredients: recipe.ingredients, instructionTexts };
  const sourceHash = hashOf(source);

  const { admin, row } = await readCache("recipe", recipe._id, locale);
  if (row && row.source_hash === sourceHash) {
    return applyRecipeFields(recipe, row.fields as unknown as RecipeFields);
  }
  if (!admin) return recipe;

  const batch = [source.title, source.note ?? "", ...source.ingredients, ...source.instructionTexts];
  const translated = await translateTexts(batch, locale);
  if (!translated) return recipe;

  const [title, note, ...rest] = translated;
  const fields: RecipeFields = {
    title,
    note: source.note ? note : null,
    ingredients: rest.slice(0, source.ingredients.length),
    instructionTexts: rest.slice(source.ingredients.length),
  };

  await writeCache(admin, "recipe", recipe._id, locale, sourceHash, fields);
  return applyRecipeFields(recipe, fields);
}

function applyRecipeFields(recipe: Recipe, fields: RecipeFields): Recipe {
  return {
    ...recipe,
    title: fields.title,
    note: fields.note,
    ingredients: fields.ingredients,
    instructions: fields.instructionTexts.map((text) => ({ children: [{ text }] })),
  };
}

export async function translateRecipes(recipes: Recipe[], locale: Locale): Promise<Recipe[]> {
  if (locale === "en" || recipes.length === 0) return recipes;
  return Promise.all(recipes.map((r) => translateRecipe(r, locale)));
}

// --- Blog posts ----------------------------------------------------------

type SummaryFields = { title: string; excerpt: string | null };

export async function translateBlogPostSummary(post: BlogPostSummary, locale: Locale): Promise<BlogPostSummary> {
  if (locale === "en") return post;

  const source = { title: post.title, excerpt: post.excerpt };
  const sourceHash = hashOf(source);

  const { admin, row } = await readCache("blogPostSummary", post._id, locale);
  if (row && row.source_hash === sourceHash) {
    const fields = row.fields as unknown as SummaryFields;
    return { ...post, title: fields.title, excerpt: fields.excerpt };
  }
  if (!admin) return post;

  const translated = await translateTexts([source.title, source.excerpt ?? ""], locale);
  if (!translated) return post;

  const fields: SummaryFields = { title: translated[0], excerpt: source.excerpt ? translated[1] : null };
  await writeCache(admin, "blogPostSummary", post._id, locale, sourceHash, fields);
  return { ...post, title: fields.title, excerpt: fields.excerpt };
}

export async function translateBlogPostSummaries(posts: BlogPostSummary[], locale: Locale): Promise<BlogPostSummary[]> {
  if (locale === "en" || posts.length === 0) return posts;
  return Promise.all(posts.map((p) => translateBlogPostSummary(p, locale)));
}

type FullFields = { title: string; excerpt: string | null; body: unknown[] };

export async function translateBlogPost(post: BlogPost, locale: Locale): Promise<BlogPost> {
  if (locale === "en") return post;

  const blocks = post.body as PortableBlock[];
  // Collect every text span across the body in order, alongside its
  // (block index, child index) so the translated strings can be slotted
  // back into an otherwise-untouched clone of the body - block type,
  // style, listItem, marks and non-text blocks (e.g. images) all pass
  // through unchanged.
  const spanRefs: { blockIndex: number; childIndex: number }[] = [];
  const spanTexts: string[] = [];
  blocks.forEach((block, bi) => {
    if (block?._type !== "block" || !Array.isArray(block.children)) return;
    block.children.forEach((child, ci) => {
      if (typeof child?.text === "string") {
        spanRefs.push({ blockIndex: bi, childIndex: ci });
        spanTexts.push(child.text);
      }
    });
  });

  const source = { title: post.title, excerpt: post.excerpt, bodyTexts: spanTexts };
  const sourceHash = hashOf(source);

  const { admin, row } = await readCache("blogPostFull", post._id, locale);
  if (row && row.source_hash === sourceHash) {
    return applyBlogPostFields(post, row.fields as unknown as FullFields);
  }
  if (!admin) return post;

  const batch = [source.title, source.excerpt ?? "", ...source.bodyTexts];
  const translated = await translateTexts(batch, locale);
  if (!translated) return post;

  const [title, excerpt, ...bodyTexts] = translated;
  const translatedBlocks = blocks.map((block) => ({ ...block, children: block.children ? [...block.children] : block.children }));
  spanRefs.forEach(({ blockIndex, childIndex }, i) => {
    const block = translatedBlocks[blockIndex];
    const children = block.children as PortableSpan[];
    children[childIndex] = { ...children[childIndex], text: bodyTexts[i] };
  });

  const fields: FullFields = { title, excerpt: source.excerpt ? excerpt : null, body: translatedBlocks };
  await writeCache(admin, "blogPostFull", post._id, locale, sourceHash, fields);
  return applyBlogPostFields(post, fields);
}

function applyBlogPostFields(post: BlogPost, fields: FullFields): BlogPost {
  return { ...post, title: fields.title, excerpt: fields.excerpt, body: fields.body };
}
