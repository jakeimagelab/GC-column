import type { MetadataRoute } from "next";
import { getPublishedColumns } from "@/content/columns";
import { categories, isTreatmentPageVisible } from "@/content/treatments";
import { treatmentDetails } from "@/content/treatments/index";
import { SITE_URL } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const columns = getPublishedColumns();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1, images: [`${SITE_URL}/opengraph-image`] },
    { url: `${SITE_URL}/column`, changeFrequency: "weekly", priority: 0.9, images: [`${SITE_URL}/opengraph-image`] },
    { url: `${SITE_URL}/column/all`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/doctor/lee-ho`, changeFrequency: "monthly", priority: 0.8, images: [`${SITE_URL}/opengraph-image`] },
    ...treatmentDetails.filter((treatment) => isTreatmentPageVisible(treatment.slug)).map((treatment) => ({
      url: `${SITE_URL}/treatments/${treatment.category}/${treatment.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: treatment.hero.image.src ? [`${SITE_URL}${treatment.hero.image.src}`] : undefined,
    })),
    ...categories.map((category) => ({ url: `${SITE_URL}/column/category/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...columns.map((column) => ({
      url: `${SITE_URL}/column/${column.slug}`,
      lastModified: column.updatedAt ?? column.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [column.listImage || column.heroImage || column.photo.src
        ? `${SITE_URL}${column.listImage ?? column.heroImage ?? column.photo.src}`
        : `${SITE_URL}/column/${column.slug}/opengraph-image`],
    })),
  ];
}
