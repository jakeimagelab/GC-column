import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { TreatmentDetailTemplate } from "@/components/treatments/TreatmentDetailTemplate";
import { TreatmentPreviewPage } from "@/components/treatments/TreatmentPreviewPage";
import { getPublishedColumns } from "@/content/columns";
import { SITE_URL } from "@/content/site";
import {
  getCategory,
  getTreatment,
  getTreatmentCategoryPath,
  isTreatmentPageVisible,
  treatments as treatmentSummaries,
} from "@/content/treatments";
import { getTreatmentDetail } from "@/content/treatments/index";
import type { TreatmentDetail } from "@/content/treatments/types";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, graph } from "@/lib/seo";

type TreatmentPageProps = { params: Promise<{ category: string; slug: string }> };

export const dynamicParams = false;

function plainText(value: string) {
  return value.replace(/\n+/g, " ").replace(/[ \t]+/g, " ").trim();
}

function absoluteAsset(path?: string) {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function withSummaryAccent(treatment: TreatmentDetail) {
  const summary = getTreatment(treatment.slug);
  return summary?.brandColor ? { ...treatment, accent: summary.brandColor } : treatment;
}

function relatedColumnsFor(treatment: TreatmentDetail) {
  if (!treatment.relatedColumnSlug) return [];
  return getPublishedColumns().filter((column) => column.slug === treatment.relatedColumnSlug);
}

export function generateStaticParams() {
  return treatmentSummaries
    .filter((treatment) => isTreatmentPageVisible(treatment.slug))
    .map((treatment) => ({ category: treatment.categorySlug, slug: treatment.slug }));
}

export async function generateMetadata({ params }: TreatmentPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isTreatmentPageVisible(slug)) return {};
  const treatment = getTreatmentDetail(category, slug);
  const content = await readSiteContent();

  if (!treatment) {
    const summary = getTreatment(slug);
    if (!summary || summary.categorySlug !== category) return {};
    return buildMetadata(content, {
      title: `${summary.name} | 글로리의원 언주역`,
      description: summary.desc,
      pathname: summary.detailPath,
      noIndex: true,
    });
  }

  return buildMetadata(content, {
    title: `${treatment.name} | 글로리의원 언주역`,
    description: plainText(treatment.hero.oneLiner),
    pathname: `/treatments/${treatment.category}/${treatment.slug}`,
    imagePath: treatment.hero.image.src,
    authorUrl: `${SITE_URL}/doctor/lee-ho`,
  });
}

export default async function TreatmentPage({ params }: TreatmentPageProps) {
  const { category, slug } = await params;
  if (!isTreatmentPageVisible(slug)) notFound();

  const detail = getTreatmentDetail(category, slug);
  const content = await readSiteContent();
  if (!detail) {
    const summary = getTreatment(slug);
    if (!summary || summary.categorySlug !== category) notFound();
    return (
      <TreatmentPreviewPage
        treatment={summary}
        categoryName={getCategory(summary.categorySlug)?.name ?? summary.categorySlug}
        content={content}
      />
    );
  }

  const treatment = withSummaryAccent(detail);
  const url = `${SITE_URL}/treatments/${treatment.category}/${treatment.slug}`;
  const relatedColumns = relatedColumnsFor(treatment);
  const faqEntities = treatment.faq.flatMap((faq, index) => faq.needsReview ? [] : [{
    "@type": "Question",
    "@id": `${url}#faq-${index + 1}`,
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
      author: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
    },
  }]);
  const procedureId = `${url}#procedure`;
  const faqId = `${url}#faq`;
  const relatedColumnUrl = treatment.relatedColumnSlug
    ? `${SITE_URL}/column/${treatment.relatedColumnSlug}`
    : undefined;
  const structured = graph(content, [
    {
      "@type": "MedicalProcedure",
      "@id": procedureId,
      name: treatment.name,
      alternateName: treatment.nameEn,
      procedureType: "NoninvasiveProcedure",
      bodyLocation: treatment.bodyLocation && !treatment.bodyLocation.needsReview
        ? treatment.bodyLocation.value
        : undefined,
      description: plainText(treatment.hero.oneLiner),
      url,
      author: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
      reviewedBy: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
      image: absoluteAsset(treatment.hero.image.src),
    },
    {
      "@type": "MedicalWebPage",
      "@id": `${url}#webpage`,
      name: treatment.name,
      headline: treatment.name,
      description: plainText(treatment.hero.oneLiner),
      url,
      inLanguage: "ko-KR",
      author: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
      reviewedBy: { "@id": `${SITE_URL}/doctor/lee-ho#physician` },
      publisher: { "@id": `${SITE_URL}/#clinic` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": procedureId },
      image: absoluteAsset(treatment.hero.image.src),
      relatedLink: relatedColumnUrl,
      mainEntity: faqEntities.length ? { "@id": faqId } : undefined,
    },
    faqEntities.length ? {
      "@type": "FAQPage",
      "@id": faqId,
      mainEntity: faqEntities,
    } : undefined,
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: getCategory(treatment.category)?.name ?? treatment.category,
          item: `${SITE_URL}${getTreatmentCategoryPath(treatment.category)}`,
        },
        { "@type": "ListItem", position: 3, name: treatment.name, item: url },
      ],
    },
  ]);

  return (
    <>
      <JsonLd value={structured} />
      <TreatmentDetailTemplate treatment={treatment} content={content} relatedColumns={relatedColumns} />
    </>
  );
}
