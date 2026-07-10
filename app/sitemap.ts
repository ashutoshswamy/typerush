import type { MetadataRoute } from "next";

const SITE_URL = "https://typerush.ashutoshswamy.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/type`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
