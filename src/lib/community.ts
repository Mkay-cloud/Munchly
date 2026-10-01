// Shared types for the Suggest-a-recipe feature (community_recipes,
// community_recipe_likes, community_recipe_comments - see the Supabase
// migration run for this feature). Separate from src/sanity/queries.ts,
// which is the curated/editorial recipe library.

export type CommunityRecipeStatus = "pending" | "approved" | "rejected";

export type CommunityRecipe = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  cuisine: string | null;
  time_minutes: number | null;
  status: CommunityRecipeStatus;
  created_at: string;
};

export type CommunityProfile = {
  display_name: string;
  avatar_url: string | null;
};

export type CommunityComment = {
  id: string;
  recipe_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

// Community recipe ingredients/instructions are stored as plain text (one
// item per line) rather than Sanity's portable-text blocks - simpler for a
// user-submitted form. This turns that text into a clean list for display.
export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
