import type { MetadataRoute } from "next";
import { columns } from "@/content/columns";
import { SITE_URL } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/column`, changeFrequency: "weekly", priority: 0.9 },
    ...columns.map((column) => ({
      url: `${SITE_URL}/column/${column.slug}`,
      changeFrequency: "monthly" as const,
      priority: column.slug === "xerf-vs-thermage" ? 0.8 : 0.6,
    })),
  ];
}
