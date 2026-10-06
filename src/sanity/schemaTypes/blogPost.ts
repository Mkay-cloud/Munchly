import { defineField, defineType } from "sanity";

// A migrated/written blog post. Posts are created with status "draft" and
// stay invisible on the site until status flips to "published" (either by
// hand in the Studio, or by the daily auto-publish cron job) - this is a
// simple custom field, not Sanity's own draft/publish document system,
// since it's much easier to automate a scheduled drip-publish this way.
//
// Migrated posts preserve the ORIGINAL site's URL and image path structure:
// - `slug` matches the original flat slug (e.g. artisticsince96.com/foo/ -> munchly.online/foo),
//   served from the root dynamic route (src/app/[slug]/page.tsx), not /blog/[slug].
// - `featuredImagePath` / each body image's `originalPath` store the original
//   `/wp-content/uploads/YYYY/MM/filename` path. The image bytes are hosted on
//   Sanity's CDN, but the site serves them back out at that exact original path
//   via src/app/wp-content/uploads/[...path]/route.ts, so links/paths from the
//   old site keep working unchanged.
export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "Short summary shown on the blog listing page and used for SEO/social previews.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "featuredImagePath",
      title: "Featured image original path",
      description: "Original /wp-content/uploads/... path of the featured image, preserved from the source site.",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "originalPath",
              title: "Original path",
              type: "string",
              description: "Original /wp-content/uploads/... path, preserved from the source site.",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      initialValue: "Maggie Collins",
    }),
    defineField({
      name: "originalPublishedAt",
      title: "Originally published",
      description: "The post's original publish date (preserved from the source blog), used to order the auto-publish queue.",
      type: "datetime",
    }),
    defineField({
      name: "publishedAt",
      title: "Published on Munchly",
      description: "Set automatically when the post goes live on Munchly. Leave empty for drafts.",
      type: "datetime",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: ["draft", "published"],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", status: "status", media: "featuredImage" },
    prepare({ title, status, media }) {
      return { title, subtitle: status === "published" ? "Published" : "Draft", media };
    },
  },
});
