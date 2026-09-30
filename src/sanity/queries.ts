import { client } from "./client";
import { urlFor } from "./image";

export type Recipe = {
  _id: string;
  title: string;
  slug: string;
  cuisine: string | null;
  moods: string[];
  tags: string[];
  timeMinutes: number | null;
  note: string | null;
  ingredients: string[];
  instructions: { children?: { text?: string }[] }[];
  imageUrl: string | null;
};

type RawRecipe = {
  _id: string;
  title: string;
  slug: string;
  cuisine?: string | null;
  moods?: string[] | null;
  tags?: string[] | null;
  timeMinutes?: number | null;
  note?: string | null;
  ingredients?: string[] | null;
  instructions?: { children?: { text?: string }[] }[] | null;
  image?: import("@sanity/image-url").SanityImageSource | null;
};

const RECIPE_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  cuisine,
  moods,
  tags,
  timeMinutes,
  note,
  ingredients,
  instructions,
  image
}`;

export async function getAllRecipes(): Promise<Recipe[]> {
  const raw: RawRecipe[] = await client.fetch(
    `*[_type == "recipe"] | order(title asc) ${RECIPE_PROJECTION}`
  );
  return raw.map((r) => ({
    _id: r._id,
    title: r.title,
    slug: r.slug,
    cuisine: r.cuisine ?? null,
    moods: r.moods ?? [],
    tags: r.tags ?? [],
    timeMinutes: r.timeMinutes ?? null,
    note: r.note ?? null,
    ingredients: r.ingredients ?? [],
    instructions: r.instructions ?? [],
    imageUrl: r.image ? urlFor(r.image).width(800).height(600).fit("crop").url() : null,
  }));
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const r: RawRecipe | null = await client.fetch(
    `*[_type == "recipe" && slug.current == $slug][0] ${RECIPE_PROJECTION}`,
    { slug }
  );
  if (!r) return null;
  return {
    _id: r._id,
    title: r.title,
    slug: r.slug,
    cuisine: r.cuisine ?? null,
    moods: r.moods ?? [],
    tags: r.tags ?? [],
    timeMinutes: r.timeMinutes ?? null,
    note: r.note ?? null,
    ingredients: r.ingredients ?? [],
    instructions: r.instructions ?? [],
    imageUrl: r.image ? urlFor(r.image).width(1200).height(800).fit("crop").url() : null,
  };
}
