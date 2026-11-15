import type { SiteContent } from "@/content/site-content-types";
import { getHeroSlides, getImage, getText } from "@/content/site-content-types";
import { SITE_URL } from "@/content/site";

export const clinicHours = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

export const sameAsIds = [
  "clinic.sameAs.naverPlace",
  "clinic.sameAs.kakaoMap",
  "clinic.sameAs.googleMap",
  "clinic.sameAs.website",
  "clinic.sameAs.youtube",
  "clinic.sameAs.instagram",
  "clinic.sameAs.modoodoc",
] as const;

export function splitLines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function getClinicAddress(content: SiteContent) {
  return [getText(content, "clinic.address.street"), getText(content, "clinic.address.detail")].filter(Boolean).join(", ");
}

export function getMapUrls(content: SiteContent) {
  const query = encodeURIComponent(getText(content, "clinic.address.street"));
  return {
    naver: getText(content, "home.location.naverUrl") || getText(content, "clinic.sameAs.naverPlace") || `https://map.naver.com/p/search/${query}`,
    kakao: getText(content, "home.location.kakaoUrl") || getText(content, "clinic.sameAs.kakaoMap") || `https://map.kakao.com/link/search/${query}`,
    google: getText(content, "home.location.googleUrl") || getText(content, "clinic.sameAs.googleMap") || `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

export function getSameAs(content: SiteContent) {
  return sameAsIds.map((id) => getText(content, id)).filter(Boolean);
}

export function getOpeningHoursSpecification(content: SiteContent) {
  return clinicHours.flatMap(([id, dayOfWeek]) => {
    const value = getText(content, `clinic.hours.${id}`).trim();
    const match = value.match(/(\d{2}:\d{2})\s*[-–~]\s*(\d{2}:\d{2})/);
    return match ? [{ "@type": "OpeningHoursSpecification", dayOfWeek, opens: match[1], closes: match[2] }] : [];
  });
}

export function getDisplayedHours(content: SiteContent) {
  const summary = getText(content, "home.location.hours").trim();
  if (summary) return summary;
  const values = clinicHours.map(([id]) => getText(content, `clinic.hours.${id}`).trim()).filter(Boolean);
  return values.join(" · ");
}

export function absoluteAsset(src?: string | null) {
  if (!src) return undefined;
  return src.startsWith("http") ? src : `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export function getClinicImage(content: SiteContent) {
  const slide = getHeroSlides(content).find((item) => item.bgImage.src)?.bgImage.src;
  return absoluteAsset(slide ?? getImage(content, "home.gallery.lounge").src);
}

export function getDoctorImage(content: SiteContent) {
  return absoluteAsset(getImage(content, "home.doctor.photo").src);
}
