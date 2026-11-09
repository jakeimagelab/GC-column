import type { MetadataRoute } from "next";
import { getPublishedColumns } from "@/content/columns";
import { categories } from "@/content/treatments";
import { SITE_URL } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const columns = getPublishedColumns();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1, images: [`${SITE_URL}/opengraph-image`] },
    { url: `${SITE_URL}/column`, changeFrequency: "weekly", priority: 0.9, images: [`${SITE_URL}/opengraph-image`] },
    { url: `${SITE_URL}/column/all`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/doctor/lee-ho`, changeFrequency: "monthly", priority: 0.8, images: [`${SITE_URL}/opengraph-image`] },
    ...categories.map((category) => ({ url: `${SITE_URL}/column/category/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...columns.map((column) => ({
      url: `${SITE_URL}/column/${column.slug}`,
      lastModified: column.updatedAt ?? column.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [column.photo.src ? `${SITE_URL}${column.photo.src}` : `${SITE_URL}/column/${column.slug}/opengraph-image`],
    })),
  ];
}
