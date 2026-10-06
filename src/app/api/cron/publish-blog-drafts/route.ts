import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";

// Daily auto-publish for the migrated blog backlog. Vercel Cron hits this
// route once a day (see vercel.json); it takes the oldest N still-draft
// posts (oldest-first by their *original* publish date, so the backlog
// publishes roughly in the order it was originally written) and flips them
// to status "published" with publishedAt set to now.
//
// Protected by CRON_SECRET so it can't be triggered by anyone else - Vercel
// Cron sends this automatically as a bearer token when CRON_SECRET is set
// in the project's environment variables.

const DAILY_COUNT = Number(process.env.BLOG_DAILY_PUBLISH_COUNT || "2");

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId || !token) {
    return NextResponse.json({ error: "Missing Sanity env vars" }, { status: 500 });
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-01-01",
    token,
    useCdn: false,
  });

  const drafts: { _id: string; title: string }[] = await client.fetch(
    `*[_type == "blogPost" && status == "draft"] | order(originalPublishedAt asc) [0...$count] { _id, title }`,
    { count: DAILY_COUNT }
  );

  if (drafts.length === 0) {
    return NextResponse.json({ published: [], message: "No drafts left to publish" });
  }

  const now = new Date().toISOString();
  const tx = client.transaction();
  for (const d of drafts) {
    tx.patch(d._id, { set: { status: "published", publishedAt: now } });
  }
  await tx.commit();

  return NextResponse.json({
    published: drafts.map((d) => ({ id: d._id, title: d.title })),
    publishedAt: now,
  });
}
