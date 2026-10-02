import HomeClient from "@/components/HomeClient";
import { getAllRecipes } from "@/sanity/queries";

export const revalidate = 60;

export default async function Home() {
  const recipes = await getAllRecipes();
  return <HomeClient recipes={recipes} />;
}
