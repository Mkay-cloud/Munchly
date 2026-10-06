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

const client = createClient({ projectId, dataset, apiVersion: "2026-01-01", token, useCdn: false });

// Usage: node scripts/import-blog-posts.mjs [time-budget-seconds]
const TIME_BUDGET_MS = (Number(process.argv[2]) || 150) * 1000;
const START = Date.now();

const BLOCKS_FILE = "./blog-import/blog_blocks.json";
const IMAGES_DIR = "./blog-import/all_images";
const CACHE_FILE = "./blog-import/.import-cache.json";
// Committed into the app (src/data) so the deployed site can resolve
// /wp-content/uploads/... requests to the right Sanity CDN asset. Keyed by
// the ORIGINAL site-relative path (e.g. "/wp-content/uploads/2026/03/Salmon-1.webp").
const IMAGE_MAP_FILE = "./src/data/blogImageMap.json";

const articles = JSON.parse(fs.readFileSync(BLOCKS_FILE, "utf8"));

let cache = { imageAssets: {}, doneArticles: [] };
if (fs.existsSync(CACHE_FILE)) {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

let imageMap = {};
if (fs.existsSync(IMAGE_MAP_FILE)) {
  imageMap = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, "utf8"));
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function saveImageMap() {
  fs.writeFileSync(IMAGE_MAP_FILE, JSON.stringify(imageMap, null, 2));
}

// Turns "https://artisticsince96.com/wp-content/uploads/2026/03/Salmon-1.webp"
// into "/wp-content/uploads/2026/03/Salmon-1.webp".
function toOriginalPath(originalUrl) {
  if (!originalUrl) return null;
  try {
    const u = new URL(originalUrl);
    return u.pathname;
  } catch {
    return null;
  }
}

async function uploadImage(localFile, originalUrl) {
  const originalPath = toOriginalPath(originalUrl);

  if (!cache.imageAssets[localFile]) {
    const filePath = path.join(IMAGES_DIR, localFile);
    const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
      filename: localFile,
    });
    cache.imageAssets[localFile] = { assetId: asset._id, cdnUrl: asset.url };
    saveCache();
  }

  const entry = cache.imageAssets[localFile];
  if (originalPath && entry.cdnUrl) {
    imageMap[originalPath] = entry.cdnUrl;
    saveImageMap();
  }

  return { assetId: entry.assetId, originalPath };
}

function timeLeft() {
  return TIME_BUDGET_MS - (Date.now() - START);
}

async function processArticle(article) {
  const blocks = [];
  for (const b of article.blocks) {
    if (b._type === "image_ref") {
      if (!b.local_file) continue;
      const { assetId, originalPath } = await uploadImage(b.local_file, b.original_url);
      blocks.push({
        _type: "image",
        _key: b._key,
        asset: { _type: "reference", _ref: assetId },
        alt: b.alt || "",
        originalPath: originalPath || undefined,
      });
    } else {
      blocks.push(b);
    }
  }

  let featuredImage;
  let featuredImagePath;
  if (article.featured_image_local) {
    const { assetId, originalPath } = await uploadImage(
      article.featured_image_local,
      article.featured_image_original_url
    );
    featuredImage = { _type: "image", asset: { _type: "reference", _ref: assetId } };
    featuredImagePath = originalPath || undefined;
  }

  const doc = {
    _id: `blogPost-${article.slug}`,
    _type: "blogPost",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    excerpt: article.excerpt || undefined,
    featuredImage,
    featuredImagePath,
    body: blocks,
    categories: article.categories || [],
    author: "Maggie Collins",
    originalPublishedAt: article.originalPublishedAt || undefined,
    status: "draft",
  };

  await client.createOrReplace(doc);
  cache.doneArticles.push(article.slug);
  saveCache();
}

async function run() {
  const pending = articles.filter((a) => !cache.doneArticles.includes(a.slug));
  console.log(`${cache.doneArticles.length} already done, ${pending.length} remaining`);

  let processed = 0;
  for (const article of pending) {
    if (timeLeft() < 10000) {
      console.log(`Time budget nearly up, stopping. Processed ${processed} this run.`);
      break;
    }
    try {
      await processArticle(article);
      processed++;
      console.log(`[${cache.doneArticles.length}/${articles.length}] Imported: ${article.slug}`);
    } catch (e) {
      console.error(`FAILED: ${article.slug}:`, e.message);
    }
  }

  console.log(`\nRun complete. Total done: ${cache.doneArticles.length}/${articles.length}`);
  const imagesCached = Object.keys(cache.imageAssets).length;
  console.log(`Images uploaded so far (cached, won't re-upload): ${imagesCached}`);
  console.log(`Image path map entries: ${Object.keys(imageMap).length}`);
}

run();
