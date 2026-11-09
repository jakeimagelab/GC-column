import { SITE_URL } from "@/content/site";

export const locales = [
  { code: "ko", hreflang: "ko-KR", pathPrefix: "" },
] as const;

export function localizedAlternates(pathname: string) {
  return Object.fromEntries(locales.map((locale) => [
    locale.hreflang,
    `${SITE_URL}${locale.pathPrefix}${pathname === "/" ? "" : pathname}`,
  ]));
}
