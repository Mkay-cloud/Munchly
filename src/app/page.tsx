import HomeClient from "@/components/HomeClient";
import { getAllRecipes } from "@/sanity/queries";
import { getLatestBlogPosts } from "@/sanity/blogQueries";

export const revalidate = 60;

export default async function Home() {
  const [recipes, posts] = await Promise.all([getAllRecipes(), getLatestBlogPosts(3)]);
  return <HomeClient recipes={recipes} posts={posts} />;
}
