import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleToc, type TocItem } from "@/components/ArticleToc";
import { ArticleProgress } from "@/components/ArticleProgress";
import { ButtonLink } from "@/components/ButtonLink";
import { ColumnHeader } from "@/components/ColumnHeader";
import { DevEditorMount } from "@/components/DevEditorMount";
import { FaqList } from "@/components/FaqList";
import { ImageSlot } from "@/components/ImageSlot";
import { JsonLd } from "@/components/JsonLd";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { QuestionForm } from "@/components/QuestionForm";
import { ShareButtons } from "@/components/ShareButtons";
import {
  columns,
  getColumn,
  getPublishedColumns,
  getVisibleColumn,
  getVisibleColumns,
  isPublishable,
} from "@/content/columns";
import { getImage, getText } from "@/content/site-content-types";
import { detailContent, SITE_URL } from "@/content/site";
import { getCategory, getTreatment } from "@/content/treatments";
import type { Column } from "@/content/types";
import { readSiteContent } from "@/lib/contentStore";
import { readPublishedQuestions } from "@/lib/questionStore";
import { articleGraph, buildMetadata, formatDateKo, graph, sentenceDescription } from "@/lib/seo";
import styles from "./page.module.css";

type ColumnDetailPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  const source = process.env.NODE_ENV === "development" ? columns : getPublishedColumns();
  return source.map((column) => ({ slug: column.slug }));
}

export async function generateMetadata({ params }: ColumnDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const column = getColumn(slug);
  if (!column || (process.env.NODE_ENV !== "development" && !isPublishable(column))) return {};
  const content = await readSiteContent();
  return buildMetadata(content, {
    title: `${column.title} | 언주역 글로리의원`,
    description: sentenceDescription(column.summary),
    pathname: `/column/${column.slug}`,
    type: "article",
    imagePath: `/column/${column.slug}/opengraph-image`,
    publishedAt: column.publishedAt,
    updatedAt: column.updatedAt,
    authorUrl: `${SITE_URL}/doctor/lee-ho`,
    noIndex: !isPublishable(column),
  });
}

function relatedColumns(column: Column) {
  const source = process.env.NODE_ENV === "development" ? getVisibleColumns() : getPublishedColumns();
  return source
    .filter((candidate) => candidate.slug !== column.slug)
    .map((candidate) => ({
      column: candidate,
      score:
        candidate.treatmentSlugs.filter((slug) => column.treatmentSlugs.includes(slug)).length * 4 +
        (candidate.categorySlug === column.categorySlug ? 2 : 0) +
        candidate.keywords.filter((keyword) => column.keywords.includes(keyword)).length,
    }))
    .filter((item) => item.score > 0)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.column);
}

export default async function ColumnDetailPage({ params }: ColumnDetailPageProps) {
  const { slug } = await params;
  const column = getVisibleColumn(slug);
  if (!column) notFound();
  const content = await readSiteContent();
  const readerQuestions = await readPublishedQuestions(column.slug);
  const category = getCategory(column.categorySlug);
  if (!category) notFound();
  const publishable = isPublishable(column);
  const related = relatedColumns(column);
  const visible = getVisibleColumns();
  const currentIndex = visible.findIndex((item) => item.slug === column.slug);
  const previous = currentIndex > 0 ? visible[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < visible.length - 1 ? visible[currentIndex + 1] : undefined;
  const pageUrl = `${SITE_URL}/column/${column.slug}`;
  const tocItems: TocItem[] = [
    { id: "summary", label: detailContent.coreTitle },
    ...column.sections.map((section) => ({ id: section.id, label: `${section.no} ${section.heading}` })),
    { id: "judgement", label: "권하는 경우 · 다른 선택을 보는 경우" },
    { id: "precautions", label: "시술 전 확인 · FAQ" },
  ];
  const structured = publishable
    ? articleGraph(content, column, category.name, readerQuestions)
    : graph(content, [{ "@type": "WebPage", "@id": `${pageUrl}#draft`, url: pageUrl, name: "비공개 초안", inLanguage: "ko-KR" }]);
  const articleImage = column.photo.src ? { type: "image" as const, src: column.photo.src, label: column.photo.label, alt: column.photo.alt, zoom: 100, focusX: 50, focusY: 50 } : undefined;

  return (
    <main className="pageFrame">
      <ArticleProgress />
      <JsonLd value={structured} />
      <ColumnHeader content={content} />
      {!publishable ? <div className={styles.draftBanner}>비공개 초안</div> : null}

      <section className={styles.titleArea}>
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link href="/">홈</Link><span>›</span><Link href="/column">원장 칼럼</Link><span>›</span><Link href={`/column/category/${category.slug}`}>{category.name}</Link><span>›</span><span aria-current="page">{column.title}</span>
        </nav>
        <Link className={styles.category} href={`/column/category/${category.slug}`}>{category.name}</Link>
        <h1>{column.title}</h1>
        <div className={styles.authorLine}>
          <span className={styles.authorAvatar} aria-hidden="true" />
          <span>
            <Link href="/doctor/lee-ho"><b>{column.author}</b></Link>
            {column.publishedAt ? <> · 게시 <time dateTime={column.publishedAt}>{formatDateKo(column.publishedAt)}</time></> : null}
            {column.updatedAt ? <> · 수정 <time dateTime={column.updatedAt}>{formatDateKo(column.updatedAt)}</time></> : null}
            <> · 읽는 시간 {column.readMinutes}분</>
          </span>
          {column.reviewedAt ? <span className={styles.reviewed}>마지막 검토일 <time dateTime={column.reviewedAt}>{formatDateKo(column.reviewedAt)}</time> · <Link href="/doctor/lee-ho">대표원장 이호 검토</Link></span> : null}
        </div>
        {column.questionSource ? <div className={styles.questionSource}>{column.questionSource}</div> : null}
        <ShareButtons content={content} title={column.title} summary={column.summary} url={pageUrl} image={`${pageUrl}/opengraph-image`} kakaoKey={process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ""} />
      </section>

      <div className={styles.bodyLayout}>
        <article className={styles.article} data-article-body>
          <section className={styles.summary} id="summary">
            <b>{detailContent.coreTitle}</b>
            <p>{column.summary}</p>
            <div className={styles.keyPoints}><b>핵심 포인트</b><ul>{column.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></div>
          </section>

          <figure className={styles.photoFigure}>
            <ImageSlot className={styles.heroPhoto} label={column.photo.label} alt={column.photo.alt} image={articleImage} sizes="(max-width: 1024px) 100vw, 760px" />
            <figcaption>{column.photo.caption}</figcaption>
          </figure>

          <ArticleToc items={tocItems} title={detailContent.tocTitle} compact />

          {column.sections.map((section) => (
            <section className={styles.articleSection} id={section.id} key={section.id}>
              <h2><span>{section.no}</span> {section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.figure ? <figure className={styles.diagramFigure}><ImageSlot className={styles.diagram} label={section.figure.label} alt={section.figure.label.replace("\n", " ")} variant="diagram" /><figcaption>{section.figure.caption}</figcaption></figure> : null}
              {section.table ? (
                <div className={styles.tableScroll}>
                  <table>
                    <caption>{section.table.caption ?? section.heading}</caption>
                    <thead><tr>{section.table.head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
                    <tbody>{section.table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row">{cell}</th> : <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ))}

          <section className={styles.judgement} id="judgement">
            <h2><span>03</span> {detailContent.judgementTitle}</h2>
            <div className={styles.judgementGrid}>
              <div><b>권하는 경우</b><ul>{column.judgement.recommend.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>
              <div><b>권하지 않거나 다른 시술을 먼저 보는 경우</b><ul>{column.judgement.notRecommend.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>
            </div>
          </section>

          {column.video ? (
            <section className={styles.videoSection} id="video">
              <h2>{detailContent.videoTitle}</h2>
              <div className={styles.videoSlot} role="img" aria-label={column.video.label}><span className={styles.playButton}>▶</span><span>{column.video.label}</span></div>
              <details className={styles.transcript}><summary>영상 대본 전문</summary><p>{column.video.transcript}</p></details>
            </section>
          ) : null}

          <div id="precautions" className={styles.precautionsGroup}>
            <section className={styles.precautions}><h2><span>04</span> {detailContent.precautionsTitle}</h2><ul>{column.precautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section className={styles.faqSection}><h2>{detailContent.faqTitle}</h2><FaqList items={column.faqs.map((faq, index) => ({ ...faq, id: `faq-${index + 1}` }))} /></section>
            {readerQuestions.length ? <section className={styles.faqSection}><h2>{getText(content, "qna.readerTitle")}</h2><FaqList items={readerQuestions.flatMap((item) => item.answer ? [{ q: item.question, a: item.answer, id: `reader-${item.id}` }] : [])} /></section> : null}
          </div>

          <QuestionForm content={content} columnSlug={column.slug} />

          {column.references.length ? <section className={styles.references}><h2>{detailContent.referencesTitle}</h2><ul>{column.references.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}

          <section className={styles.authorBox}>
            <ImageSlot label="대표원장 이호 프로필 사진" alt="대표원장 이호 프로필 사진" width={120} height={140} image={getImage(content, "home.doctor.photo")} sizes="120px" />
            <div>
              <h2><Link href="/doctor/lee-ho">{detailContent.authorTitle}</Link></h2>
              <p>{detailContent.authorCareer}</p>
              <p>{column.publishedAt ? <>게시 <time dateTime={column.publishedAt}>{formatDateKo(column.publishedAt)}</time></> : null}{column.updatedAt ? <> · 수정 <time dateTime={column.updatedAt}>{formatDateKo(column.updatedAt)}</time></> : null}{column.reviewedAt ? <> · 검토 <time dateTime={column.reviewedAt}>{formatDateKo(column.reviewedAt)}</time></> : null}</p>
              <Link href="/doctor/lee-ho">원장 프로필 →</Link>
            </div>
          </section>

          <section className={styles.treatmentCta}>
            <div><b>관련 시술</b><span>{detailContent.treatmentDescription}</span><div className={styles.treatmentLinks}>{column.treatmentSlugs.flatMap((slug) => { const treatment = getTreatment(slug); return treatment ? [<Link href={`/column/category/${treatment.categorySlug}`} key={slug}>{treatment.name}</Link>] : []; })}</div></div>
            <div className={styles.ctaButtons}><ButtonLink href="tel:0269587525" variant="taupe">예약·상담</ButtonLink><ButtonLink href={getText(content, "home.location.kakaoUrl") || "/#location"} variant="lightOutline">카톡 상담</ButtonLink></div>
          </section>

          {related.length ? (
            <section className={styles.related}>
              <h2>{detailContent.relatedTitle}</h2>
              <div className={styles.relatedGrid}>{related.map((item) => <Link href={`/column/${item.slug}`} key={item.slug}><ImageSlot label="관련 칼럼 이미지" alt={`${item.title} 대표 이미지`} height={120} /><b>{item.title}</b></Link>)}</div>
            </section>
          ) : null}

          {previous || next ? <nav className={styles.articleNav} aria-label="이전 글과 다음 글">{previous ? <Link href={`/column/${previous.slug}`}>← 이전 글 {previous.title}</Link> : <span />}{next ? <Link href={`/column/${next.slug}`}>다음 글 {next.title} →</Link> : <span />}</nav> : null}
          <ShareButtons content={content} title={column.title} summary={column.summary} url={pageUrl} image={`${pageUrl}/opengraph-image`} kakaoKey={process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ""} />
          <div className={styles.notice}>{detailContent.notice}</div>
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.stickySidebar}>
            <ArticleToc items={tocItems} title="목차" />
            <div className={styles.doctorCard}>
              <Link href="/doctor/lee-ho"><span aria-hidden="true" /><b>{getText(content, "doctor.jobTitle")} {getText(content, "doctor.name")}</b></Link>
              <p>상담부터 시술까지 직접 진행합니다.</p>
              <ButtonLink href="tel:0269587525" variant="taupe">예약·상담 02-6958-7525</ButtonLink>
            </div>
          </div>
        </aside>
      </div>

      <footer className={styles.footer}><div><b>{getText(content, "column.footer.brand")}</b><p>{getText(content, "column.footer.notice")}</p><p>{getText(content, "column.footer.business")}</p></div><div><p>{getText(content, "column.footer.links")}</p><p>{getText(content, "column.footer.sitemap")}</p></div></footer>
      <FloatingQuickMenu content={content} compact />
      <DevEditorMount page="column" content={content} />
    </main>
  );
}
