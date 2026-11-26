import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnList } from "@/components/ColumnList";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { JsonLd } from "@/components/JsonLd";
import { containsPlaceholder, getVisibleColumns } from "@/content/columns";
import { getText } from "@/content/site-content-types";
import { categories, getCategory, getTreatment, isTreatmentPageVisible, treatments } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, collectionNodes, graph } from "@/lib/seo";
import { filterColumns } from "@/lib/column-filters";
import styles from "@/app/seo-pages.module.css";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ treatment?: string | string[] }> };

export const dynamicParams = false;
export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) return {};
  const content = await readSiteContent();
  const description = getText(content, `column.category.${category.slug}.intro`);
  return buildMetadata(content, { title: `${category.name} 칼럼 | 언주역 글로리의원`, description, pathname: `/column/category/${category.slug}` });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = getCategory(slug as (typeof categories)[number]["slug"]);
  if (!category) notFound();
  const content = await readSiteContent();
  const description = getText(content, `column.category.${category.slug}.intro`);
  const { treatment } = await searchParams;
  const selected = typeof treatment === "string" ? treatment : "";
  const columns = filterColumns(getVisibleColumns().filter((column) => column.categorySlug === category.slug), "", "", selected);
  const relatedTreatments = treatments.filter((treatment) => treatment.categorySlug === category.slug && isTreatmentPageVisible(treatment.slug) && !containsPlaceholder(treatment));
  const faqs = columns.flatMap((column) => column.faqs.filter((faq) => !faq.needsReview && !faq.a.includes("[원장 확인]") && faq.a.trim()));
  const pageGraph = graph(content, collectionNodes(`/column/category/${category.slug}`, `${category.name} 칼럼`, description, columns));

  return (
    <main className="pageFrame">
      <ColumnHeader content={content} />
      <JsonLd value={pageGraph} />
      <section className={styles.hero} data-scroll-world-scene data-scroll-world-strength="subtle"><span className={styles.eyebrow} data-scroll-world-layer="counter">{category.nameEn}</span><h1 data-scroll-world-layer="copy">{category.name} 칼럼</h1><p data-scroll-world-layer="copy">{description}</p></section>
      <div className={styles.content}>
        <section data-scroll-world-scene data-scroll-world-strength="subtle"><h2>{category.name} 칼럼 · {columns.length}건</h2>{selected ? <p>{getTreatment(selected)?.name ?? selected} · <Link href={`/column/category/${category.slug}`}>필터 해제</Link></p> : null}{columns.length ? <ColumnList columns={columns} /> : <><p>현재 조건에 맞는 공개 칼럼이 없습니다. 새 글을 준비하고 있습니다.</p><Link href="/column/all">전체 칼럼 보기 →</Link></>}</section>
        {relatedTreatments.length ? <section data-scroll-world-scene data-scroll-world-strength="subtle">
          <h2 data-scroll-world-layer="copy">관련 시술</h2>
          <div className={styles.treatments} data-scroll-world-layer="depth">
            {relatedTreatments.map((treatment) => <Link href={treatment.detailPath} key={treatment.slug}><b>{treatment.name} 시술 안내</b><span>{treatment.desc}</span></Link>)}
          </div>
        </section> : null}
        {faqs.length ? <section data-scroll-world-scene data-scroll-world-strength="soft"><h2 data-scroll-world-layer="copy">자주 묻는 질문</h2><div className={styles.faqList} data-scroll-world-layer="depth">{faqs.map((faq, index) => <article id={`faq-${index + 1}`} key={`${faq.q}-${index}`}><h3>{faq.q}</h3><p>{faq.a}</p></article>)}</div></section> : null}
      </div>
      <ColumnFooter content={content} />
      <FloatingQuickMenu content={content} compact />
    </main>
  );
}
