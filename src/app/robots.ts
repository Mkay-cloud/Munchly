import type { MetadataRoute } from "next";

const SITE_URL = "https://munchly.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/favorites", "/profile", "/studio"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
