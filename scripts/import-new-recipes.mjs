import { createClient } from "@sanity/client";
import fs from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN env vars");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

const dataFile = process.argv[2] || "/tmp/new-recipes.json";
const recipes = JSON.parse(fs.readFileSync(dataFile, "utf8"));

function toPortableText(paragraphs) {
  return paragraphs.map((text) => ({
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text, marks: [] }],
    markDefs: [],
  }));
}

function slugFromId(id) {
  return id.replace(/^recipe-/, "");
}

async function run() {
  for (const r of recipes) {
    const slug = slugFromId(r.id);
    const doc = {
      _type: "recipe",
      title: r.title,
      slug: { _type: "slug", current: slug },
      cuisine: r.cuisine,
      moods: r.moods,
      tags: r.tags || [],
      timeMinutes: r.timeMinutes,
      note: r.note,
      ingredients: r.ingredients,
      instructions: toPortableText(r.instructions),
    };

    await client.createOrReplace({ _id: r.id, ...doc });
    console.log(`  -> saved as ${r.id}`);
  }
  console.log(`\nDone: ${recipes.length} recipes imported.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
