import type { Metadata } from "next";
import type { Column } from "@/content/types";
import type { ReaderQuestion } from "@/content/question-types";
import type { SiteContent } from "@/content/site-content-types";
import { getText } from "@/content/site-content-types";
import { getTreatment } from "@/content/treatments";
import { SITE_URL } from "@/content/site";
import { localizedAlternates } from "./i18n";
import {
  absoluteAsset,
  getClinicAddress,
  getClinicImage,
  getDoctorImage,
  getMapUrls,
  getOpeningHoursSpecification,
  getSameAs,
  splitLines,
} from "./site-info";

const PLACEHOLDER = /(^|\s)\[[^\]]+\]/;

export function hasPlaceholder(value: string) {
  return PLACEHOLDER.test(value);
}

export function publicText(value?: string) {
  const clean = value?.trim();
  return clean && !hasPlaceholder(clean) ? clean : undefined;
}

export function formatDateKo(value?: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${year}. ${month}. ${day}.`;
}

export function sentenceDescription(value: string, maxLength = 150) {
  const clean = publicText(value) ?? "";
  if (clean.length <= maxLength) return clean;
  const candidate = clean.slice(0, maxLength + 1);
  const sentenceEnd = Math.max(candidate.lastIndexOf("."), candidate.lastIndexOf("?"), candidate.lastIndexOf("!"));
  if (sentenceEnd >= 50) return candidate.slice(0, sentenceEnd + 1);
  const wordEnd = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, wordEnd > 50 ? wordEnd : maxLength).trim()}…`;
}

export function canonical(pathname: string) {
  const path = pathname === "/" ? "" : pathname.replace(/\/+$/, "");
  return `${SITE_URL}${path}`;
}

type MetadataInput = {
  title: string;
  description: string;
  pathname: string;
  type?: "website" | "article";
  imagePath?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorUrl?: string;
  noIndex?: boolean;
};

export function buildMetadata(content: SiteContent, input: MetadataInput): Metadata {
  const url = canonical(input.pathname);
  const image = canonical(input.imagePath ?? "/opengraph-image");
  const verificationOther: Record<string, string> = {};
  const naver = getText(content, "seo.verification.naver").trim();
  const bing = getText(content, "seo.verification.bing").trim();
  if (naver) verificationOther["naver-site-verification"] = naver;
  if (bing) verificationOther["msvalidate.01"] = bing;
  const noIndex = process.env.NODE_ENV === "development" || input.noIndex;
  const article = input.type === "article" ? {
    type: "article" as const,
    publishedTime: input.publishedAt,
    modifiedTime: input.updatedAt,
    authors: input.authorUrl ? [input.authorUrl] : undefined,
  } : { type: "website" as const };

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
      languages: localizedAlternates(input.pathname),
      types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
    },
    openGraph: {
      ...article,
      title: input.title,
      description: input.description,
      url,
      siteName: getText(content, "common.brand.name"),
      locale: "ko_KR",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image] },
    verification: {
      google: getText(content, "seo.verification.google").trim() || undefined,
      other: Object.keys(verificationOther).length ? verificationOther : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

function compact(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).flatMap(([key, item]) => {
      const clean = compact(item);
      return clean === undefined ? [] : [[key, clean] as const];
    });
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  if (value === undefined || value === null || value === "") return undefined;
  return value;
}

export function commonGraph(content: SiteContent) {
  const address = getClinicAddress(content);
  const lat = Number(getText(content, "home.location.lat"));
  const lng = Number(getText(content, "home.location.lng"));
  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng) && getText(content, "home.location.lat").trim() && getText(content, "home.location.lng").trim();
  const specialty = getText(content, "clinic.showSpecialty") === "true" ? "Dermatology" : undefined;
  const openingHours = getOpeningHoursSpecification(content);
  const mapUrls = getMapUrls(content);
  const clinicImage = getClinicImage(content);
  const logo = absoluteAsset(content["common.header.logo"] && !Array.isArray(content["common.header.logo"]) && content["common.header.logo"].type !== "text" ? content["common.header.logo"].src : undefined);
  const physicianImage = getDoctorImage(content);
  const knowsAbout = splitLines(getText(content, "doctor.specialties"));

  return [
    compact({
      "@type": "MedicalClinic",
      "@id": `${SITE_URL}/#clinic`,
      name: getText(content, "common.brand.name"),
      alternateName: getText(content, "common.brand.nameEn"),
      url: SITE_URL,
      telephone: getText(content, "common.clinic.phone"),
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        postalCode: getText(content, "clinic.address.postalCode"),
        addressLocality: getText(content, "clinic.address.locality"),
        addressRegion: getText(content, "clinic.address.region"),
        addressCountry: getText(content, "clinic.address.country"),
      },
      geo: hasGeo ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng } : undefined,
      openingHoursSpecification: openingHours,
      medicalSpecialty: specialty,
      image: clinicImage,
      logo,
      sameAs: getSameAs(content),
      hasMap: mapUrls.kakao,
    }),
    compact({
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: getText(content, "common.brand.name"),
      url: SITE_URL,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}/#clinic` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/column?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    }),
    compact({
      "@type": "Physician",
      "@id": `${SITE_URL}/doctor/lee-ho#physician`,
      name: getText(content, "doctor.name"),
      jobTitle: getText(content, "doctor.jobTitle"),
      worksFor: { "@id": `${SITE_URL}/#clinic` },
      alumniOf: splitLines(getText(content, "doctor.alumniOf")).map((name) => ({ "@type": "EducationalOrganization", name })),
      image: physicianImage,
      url: `${SITE_URL}/doctor/lee-ho`,
      sameAs: splitLines(getText(content, "doctor.sameAs")),
      knowsAbout,
      medicalSpecialty: specialty,
    }),
  ].filter(Boolean);
}

export function graph(content: SiteContent, nodes: unknown[]) {
  return compact({ "@context": "https://schema.org", "@graph": [...commonGraph(content), ...nodes.map(compact).filter(Boolean)] });
}

export function articleGraph(content: SiteContent, column: Column, categoryName: string, readerQuestions: ReaderQuestion[] = []) {
  const url = `${SITE_URL}/column/${column.slug}`;
  const categoryUrl = `${SITE_URL}/column/category/${column.categorySlug}`;
  const procedures = column.treatmentSlugs.flatMap((slug) => {
    const treatment = getTreatment(slug);
    return treatment && publicText(treatment.name) ? [{ "@type": "MedicalProcedure", name: treatment.name }] : [];
  });
  const faqId = `${url}#faq`;
  const image = absoluteAsset(column.photo.src);
  const faq = {
    "@type": "FAQPage",
    "@id": faqId,
    mainEntity: [
      ...column.faqs.map((item, index) => ({
      "@type": "Question",
      "@id": `${url}#faq-${index + 1}`,
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
      ...readerQuestions.flatMap((item) => item.answer ? [{
        "@type": "Question",
        "@id": `${url}#reader-${item.id}`,
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      }] : []),
    ],
  };
  const video = column.video && publicText(column.video.transcript) && publicText(column.video.name) ? {
    "@type": "VideoObject",
    name: column.video.name,
    description: publicText(column.video.description),
    thumbnailUrl: publicText(column.video.thumbnailUrl),
    uploadDate: publicText(column.video.uploadDate),
    contentUrl: publicText(column.video.contentUrl),
    embedUrl: publicText(column.video.embedUrl),
    transcript: column.video.transcript,
  } : undefined;

  return graph(content, [
    {
      "@type": "MedicalWebPage",
      "@id": `${url}#webpage`,
      headline: column.title,
      description: sentenceDescription(column.summary),
      url,
      inLanguage: "ko-KR",
      datePublished: column.publishedAt,
      dateModified: column.updatedAt,
      lastReviewed: column.reviewedAt,
      author: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
      reviewedBy: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
      publisher: { "@id": `${SITE_URL}/#clinic` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      image,
      about: procedures,
      mainEntity: { "@id": faqId },
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["#summary"] },
    },
    faq,
    video,
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "원장 칼럼", item: `${SITE_URL}/column` },
        { "@type": "ListItem", position: 3, name: categoryName, item: categoryUrl },
        { "@type": "ListItem", position: 4, name: column.title, item: url },
      ],
    },
  ]);
}

export function collectionNodes(pathname: string, title: string, description: string, columns: Column[]) {
  const url = canonical(pathname);
  return [
    {
      "@type": "CollectionPage",
      "@id": `${url}#collection`,
      name: title,
      description,
      url,
      inLanguage: "ko-KR",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      mainEntity: { "@id": `${url}#items` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#items`,
      itemListElement: columns.map((column, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/column/${column.slug}`,
        name: column.title,
      })),
    },
  ];
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
