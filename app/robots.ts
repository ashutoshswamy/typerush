import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/race"],
    },
    sitemap: "https://typerush.ashutoshswamy.in/sitemap.xml",
  };
}
