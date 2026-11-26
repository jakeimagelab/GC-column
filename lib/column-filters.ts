import type { Column } from "@/content/types";

export const concernKeys = ["sagging", "jawline", "pigment", "pores", "regeneration", "wrinkle"] as const;
const legacyConcernQueries = new Map([
  ["처짐", "sagging"], ["턱선", "jawline"], ["색소", "pigment"],
  ["모공", "pores"], ["피부결", "regeneration"], ["주름", "wrinkle"],
]);

export const getLegacyConcern = (query: string) => legacyConcernQueries.get(query.trim().toLowerCase());

export const byPublication = (a: Column, b: Column) =>
  (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");

export function filterColumns(columns: Column[], q: string, concern: string, treatment: string) {
  const query = q.trim().toLowerCase();
  const legacyConcern = concern ? undefined : getLegacyConcern(query);
  const concernKey = concern || legacyConcern;
  return columns.filter((column) =>
    (!concernKey || column.concerns.some((key) => key === concernKey)) &&
    (!treatment || column.treatmentSlugs.some((slug) => slug === treatment)) &&
    (!query || legacyConcern || [
      column.title, column.summary, ...column.keywords, ...column.faqs.filter((faq) => !faq.needsReview && !faq.a.includes("[원장 확인]")).map((faq) => faq.q),
    ].some((value) => value.toLowerCase().includes(query)))
  ).sort(byPublication);
}
