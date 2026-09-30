import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

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

const ASSETS_DIR = "/home/claude/munchly-assets";
const recipes = JSON.parse(
  fs.readFileSync(new URL("./recipes-data.json", import.meta.url), "utf8")
);

function toPortableText(paragraphs) {
  return paragraphs.map((text) => ({
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text, marks: [] }],
    markDefs: [],
  }));
}

async function run() {
  for (const r of recipes) {
    const imgPath = path.join(ASSETS_DIR, r.image);
    console.log(`Uploading image for ${r.title}...`);
    const asset = await client.assets.upload("image", fs.createReadStream(imgPath), {
      filename: r.image,
    });

    const doc = {
      _type: "recipe",
      title: r.title,
      slug: { _type: "slug", current: r.slug },
      image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      cuisine: r.cuisine,
      moods: r.moods,
      timeMinutes: r.timeMinutes,
      note: r.note,
      ingredients: r.ingredients,
      instructions: toPortableText(r.instructions),
    };

    // Upsert by a deterministic document id derived from the slug, so re-running
    // this script updates existing recipes instead of duplicating them.
    const docId = `recipe-${r.slug}`;
    await client.createOrReplace({ _id: docId, ...doc });
    console.log(`  -> saved as ${docId}`);
  }
  console.log(`\nDone: ${recipes.length} recipes imported.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
