import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { prices } from "@/lib/prices";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(prices.updated_at),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
