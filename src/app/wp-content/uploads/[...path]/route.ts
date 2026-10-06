import { NextRequest } from "next/server";
import imageMap from "@/data/blogImageMap.json";

// Serves migrated blog images back out at their EXACT original WordPress path
// (e.g. /wp-content/uploads/2026/03/Salmon-1.webp), even though the actual
// bytes are stored on Sanity's CDN. This keeps every old inbound link and
// in-article <img> path from artisticsince96.com working unchanged on
// munchly.online. blogImageMap.json (original path -> Sanity CDN URL) is
// written by scripts/import-blog-posts.mjs during migration.
//
// We proxy (fetch + stream) rather than redirect, so the URL in the
// address bar / crawler index stays the original path instead of jumping
// to a cdn.sanity.io URL.

export const revalidate = 86400;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = "/wp-content/uploads/" + path.join("/");
  const cdnUrl = (imageMap as Record<string, string>)[key];

  if (!cdnUrl) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(cdnUrl, { cache: "force-cache" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(upstream.body, { status: 200, headers });
}
