import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { ArticleProgress } from "@/components/ArticleProgress";
import { ArticleToc, type TocItem } from "@/components/ArticleToc";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { DevEditorMount } from "@/components/DevEditorMount";
import { FaqList, type FaqListItem } from "@/components/FaqList";
import { ImageSlot } from "@/components/ImageSlot";
import { JsonLd } from "@/components/JsonLd";
import { LayerDiagram } from "@/components/LayerDiagram";
import { HighlightedParagraph, InlineRichText } from "@/components/motion/HighlightedText";
import { MotionGroup } from "@/components/motion/MotionGroup";
import { QuestionForm } from "@/components/QuestionForm";
import { ShareButtons } from "@/components/ShareButtons";
import { columns, getColumn, getPublishedColumns, getVisibleColumn, isPublishable } from "@/content/columns";
import { getImage, getText, textEditProps } from "@/content/site-content-types";
import { SITE_URL } from "@/content/site";
import { getCategory, getTreatment } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import { readPublishedQuestions } from "@/lib/questionStore";
import { articleGraph, buildMetadata, formatDateKo, sentenceDescription } from "@/lib/seo";
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
    title: column.metaTitle ?? `${column.title} | 언주역 글로리의원`,
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

function pointColor(name: string) {
  if (name.includes("세르프")) return "#e2897e";
  if (name.includes("써마지")) return "#4a2878";
  if (name.includes("울쎄라")) return "#f2c12e";
  return "#8c7b6b";
}

function panelParts(value: string) {
  const [eyebrow, ...title] = value.split("/");
  return { eyebrow: eyebrow.trim(), title: title.join("/").trim() };
}

function relatedColor(slug: string, fallback?: string) {
  return slug === "thermage-flx" ? "#9c7fc8" : fallback ?? "#8c7b6b";
}

function isReviewOnly(value: string) {
  return value.includes("[원장 확인]");
}

function visibleReviewText(value: string, showReview: boolean) {
  return showReview ? value : value.replace(/\s*\[(?:원장 확인|광고 검토)\]/g, "").trim();
}

export default async function ColumnDetailPage({ params }: ColumnDetailPageProps) {
  const { slug } = await params;
  const column = getVisibleColumn(slug);
  if (!column || !isPublishable(column)) notFound();
  const [content, readerQuestions] = await Promise.all([
    readSiteContent(),
    readPublishedQuestions(column.slug),
  ]);
  const category = getCategory(column.categorySlug);
  if (!category) notFound();
  const showReview = process.env.NEXT_PUBLIC_SHOW_REVIEW === "true";
  const pageUrl = `${SITE_URL}/column/${column.slug}`;
  const primaryTreatment = column.primaryTreatment ? getTreatment(column.primaryTreatment) : undefined;
  const relatedTreatments = column.treatmentSlugs.flatMap((treatmentSlug) => {
    const treatment = getTreatment(treatmentSlug);
    return treatment ? [treatment] : [];
  });
  const hasJudgement = column.judgement.recommend.length > 0 || column.judgement.notRecommend.length > 0;
  const hasPrecautions = column.precautions.length > 0;
  const tocItems: TocItem[] = [
    { id: "a30", label: "핵심 요약" },
    ...(column.shortAnswer ? [{ id: "ans", label: "한 줄 답 · 차이는 깊이" }] : []),
    ...column.sections.flatMap((section) => section.kind === "image"
      ? []
      : [{ id: section.id, label: `${section.no} ${section.heading.replace(/\n/g, " ")}` }]),
    ...(hasJudgement ? [{ id: "judgement", label: getText(content, "column.detail.judgement.title") }] : []),
    ...(hasPrecautions ? [{ id: "precautions", label: getText(content, "column.detail.precautions.title") }] : []),
    { id: "qa", label: column.faqTitle ?? "자주 묻는 질문" },
  ];
  const rawFaqItems: FaqListItem[] = [
    ...column.faqs.flatMap((faq, index) => faq.a.trim() && (showReview || !faq.needsReview) ? [{ ...faq, id: `faq-${index + 1}` }] : []),
    ...readerQuestions.flatMap((question) => question.answer ? [{ q: question.question, a: question.answer, id: `reader-${question.id}` }] : []),
  ];
  const seenQuestions = new Set<string>();
  const faqItems = rawFaqItems.filter((item) => {
    const normalized = item.q.replace(/\s+/g, "").replace(/[?？]/g, "");
    if (seenQuestions.has(normalized)) return false;
    seenQuestions.add(normalized);
    return true;
  });
  const structured = articleGraph(content, column, category.name, readerQuestions);
  const articleStyle = {
    "--brand": primaryTreatment?.brandColor ?? "#8c7b6b",
    "--brand-strong": column.primaryTreatment === "xerf" ? "#e2897e" : primaryTreatment?.brandColor ?? "#8c7b6b",
    "--brand-label": column.primaryTreatment === "xerf" ? "#c8665c" : primaryTreatment?.brandColor ?? "#8c7b6b",
    "--brand-soft": column.primaryTreatment === "xerf" ? "#fdf0ee" : "#f2ede6",
    "--brand-highlight": column.primaryTreatment === "xerf" ? "#fbd5cf" : "#eee3d8",
    "--article-cover-image": `url(${JSON.stringify(column.heroImage || "/uploads/glory-column-editorial-campaign-01.png")})`,
    "--article-overlay": column.heroOverlay ?? "linear-gradient(90deg, rgba(58,48,40,.97) 0%, rgba(58,48,40,.88) 38%, rgba(58,48,40,.45) 70%, rgba(58,48,40,.3) 100%)",
  } as CSSProperties;
  const [titleLead, ...titleRest] = column.title.split(",");
  const recommendPanel = panelParts(getText(content, "column.detail.judgement.recommend"));
  const consultPanel = panelParts(getText(content, "column.detail.judgement.consult"));
  const readNext = (column.readNext ?? []).filter((item) => Boolean(getColumn(item.slug)));
  const relatedConsultText = getText(content, "column.detail.related.consult");
  const relatedConsultBreak = relatedConsultText.indexOf("대표원장이");
  const relatedConsultLead = relatedConsultBreak >= 0 ? relatedConsultText.slice(0, relatedConsultBreak).trim() : relatedConsultText;
  const relatedConsultRest = relatedConsultBreak >= 0 ? relatedConsultText.slice(relatedConsultBreak).trim() : "";

  return (
    <main className={styles.page} style={articleStyle}>
      <ArticleProgress />
      <JsonLd value={structured} />
      <ArticleToc items={tocItems} title={getText(content, "column.detail.toc.eyebrow")} mobileBar />

      <section className={styles.articleCover}>
        <ColumnHeader content={content} variant="overlay" page="detail" />
        <div className={styles.articleCoverInner}>
          <nav className={styles.breadcrumb} aria-label="현재 위치">
            <Link href="/column">원장 칼럼</Link><span>›</span><span {...textEditProps("column.detail.breadcrumb.concern")}>{getText(content, "column.detail.breadcrumb.concern")}</span><span>›</span><span aria-current="page" {...textEditProps("column.detail.breadcrumb.title")}>{getText(content, "column.detail.breadcrumb.title")}</span>
          </nav>
          <span className={styles.issueLabel} {...textEditProps("column.detail.issueLabel")}>{getText(content, "column.detail.issueLabel")}</span>
          <h1 className={styles.desktopHeroTitle}>{titleRest.length ? <>{titleLead},<br />{titleRest.join(",").trim()}</> : column.title}</h1>
          <h1 className={styles.mobileHeroTitle}>
            {column.slug === "xerf-vs-thermage" ? <><span>세르프(XERF)와</span><span>써마지FLX의 차이,</span><span>누구에게 맞을까요?</span></> : column.title}
          </h1>
          <div className={styles.bylineRow}>
            <div className={styles.byline}>
              <ImageSlot className={styles.avatar} label="" alt={getImage(content, "home.doctor.photo").alt} image={getImage(content, "home.doctor.photo")} sizes="52px" />
              <div>
                <b {...textEditProps("column.detail.byline")}>{getText(content, "column.detail.byline")}</b>
                <span>
                  {column.publishedAt ? <span className={styles.publishMeta}>게시 <time dateTime={column.publishedAt}>{formatDateKo(column.publishedAt)}</time></span> : null}
                  {column.reviewedAt ? <span className={styles.reviewMeta}> · 최종 검토 <time dateTime={column.reviewedAt}>{formatDateKo(column.reviewedAt)}</time></span> : null}
                  {!column.reviewedAt && column.reviewedAtNeedsReview && showReview ? <span className={styles.reviewMeta}> · 최종 검토 <em className={styles.reviewPill}>원장 확인</em></span> : null}
                  <span className={styles.readMeta}> · {column.readMinutes}분 읽기</span>
                </span>
              </div>
            </div>
            <ShareButtons content={content} title={column.title} summary={column.summary} url={pageUrl} image={`${pageUrl}/opengraph-image`} kakaoKey={process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ""} variant="dark" />
          </div>
        </div>
      </section>

      <div className={styles.bodyLayout}>
        <article className={styles.article} data-article-body>
          <nav className={styles.depthNav} aria-label={getText(content, "column.detail.depthLabel")}>
            <span {...textEditProps("column.detail.depthLabel")}>{getText(content, "column.detail.depthLabel")}</span>
            <div>
              <a className={styles.depthActive} href="#a30">30초 · 핵심 답</a>
              <a href="#difference">3분 · 차이와 기준</a>
              <a href="#xerf-alone">전체 · 원장 판단</a>
            </div>
          </nav>

          <section className={`${styles.quickAnswer} ${column.video?.src || showReview ? styles.quickAnswerWithMedia : ""}`} id="a30">
            {column.video?.src ? (
              <div className={styles.videoColumn}>
                <video controls poster={column.video.poster} preload="metadata"><source src={column.video.src} /></video>
                <details><summary {...textEditProps("column.detail.transcript")}>{getText(content, "column.detail.transcript")}</summary><p>{column.video.transcript}</p></details>
              </div>
            ) : showReview ? (
              <div className={`${styles.videoColumn} ${styles.videoPlaceholder}`} aria-label="30초 원장 답변 영상 촬영 예정">
                <span className={styles.videoPlay} aria-hidden="true">▶</span>
                <div>
                  <small>DOCTOR&apos;S ANSWER</small>
                  <b>&quot;세르프와 써마지,<br />뭐가 다르냐면요…&quot;</b>
                  <span>[12월 촬영 · 세로 9:16 · 자막 포함]</span>
                </div>
              </div>
            ) : null}
            <div className={styles.quickCopy}>
              <span>핵심 요약 · 원장이 직접 답합니다</span>
              <ul className={styles.quickPoints} id="summary">
                {column.keyPoints.map((point, index) => <li key={index}><InlineRichText value={visibleReviewText(point, showReview)} showReview={showReview} /></li>)}
              </ul>
              {showReview && !column.video?.src ? <details className={styles.mobileTranscript}><summary>{getText(content, "column.detail.transcript")} <b>＋</b></summary></details> : null}
            </div>
          </section>

          {column.shortAnswer ? (
            <section className={styles.shortAnswer} id="ans">
              <span>{column.shortAnswer.eyebrow}</span>
              <h2>{column.shortAnswer.title}</h2>
              {column.shortAnswer.body.map((paragraph) => <HighlightedParagraph key={paragraph} value={paragraph} showReview={showReview} />)}
              {column.shortAnswer.note ? <small>{column.shortAnswer.note}</small> : null}
            </section>
          ) : null}

          <MotionGroup className={styles.sections} scrollWorldLayer="copy">
            {column.sections.map((section, sectionIndex) => {
              if (section.kind === "image") {
                return (
                  <figure className={`${styles.imageOnly} ${section.ratio === "4/5" ? styles.imageOnlyPortrait : ""}`} key={`${section.src}-${sectionIndex}`} data-motion-item>
                    <div className={styles.imageOnlyMedia}>
                      <Image src={section.src} alt={section.alt} fill sizes="(max-width: 1000px) 100vw, 788px" unoptimized loading="eager" />
                    </div>
                    <figcaption>{section.caption}</figcaption>
                  </figure>
                );
              }
              const numberedSectionIndex = column.sections
                .slice(0, sectionIndex)
                .filter((candidate) => candidate.kind !== "image").length;
              const visibleBody = section.body.filter((paragraph) => showReview || !isReviewOnly(paragraph));
              return (
                <section className={styles.articleSection} id={section.id} key={section.id} data-motion-item>
                  <div className={styles.sectionMarker}>
                    <span>{section.no}</span>
                    <b>{section.en ?? getText(content, `column.detail.section.${numberedSectionIndex}.eyebrow`)}</b>
                  </div>
                  <h2>{section.heading}</h2>
                  {section.lead ? <p className={styles.sectionLead}><strong><InlineRichText value={section.lead} showReview={showReview} /></strong></p> : null}
                  {visibleBody.map((paragraph) => <HighlightedParagraph key={paragraph} value={visibleReviewText(paragraph, showReview)} showReview={showReview} />)}

                  {sectionIndex === 0 && showReview && column.reviewNotes ? (
                    <details className={styles.reviewNotes}>
                      <summary>{column.reviewNotes.label}</summary>
                      <ul>{column.reviewNotes.lines.map((line) => <li key={line}>{line}</li>)}</ul>
                    </details>
                  ) : null}

                  {section.figure?.kind === "layers" ? <LayerDiagram caption={section.figure.caption} showReview={showReview && section.figure.needsReview} /> : null}

                  {section.figure?.kind === "image" ? (
                    <figure className={styles.comparisonGraphic}>
                      <Image src={section.figure.src} alt={section.figure.alt} width={4096} height={2304} sizes="(max-width: 640px) 100vw, 788px" />
                      <figcaption>{section.figure.caption}</figcaption>
                    </figure>
                  ) : null}

                  {section.table ? (
                    <div className={styles.tableViewport}>
                      <span className={styles.tableHint} {...textEditProps("column.detail.table.scrollHint")}>{getText(content, "column.detail.table.scrollHint")}</span>
                      <div className={styles.tableScroll}>
                        <table>
                          <caption>{section.table.caption ?? section.heading}</caption>
                          <thead><tr>{section.table.head.map((cell, index) => <th className={cell.includes(primaryTreatment?.name ?? "__") ? styles.primaryCell : ""} key={cell} scope="col">{index > 0 ? <i style={{ background: pointColor(cell) }} /> : null}{cell}</th>)}</tr></thead>
                          <tbody>{section.table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row">{cell}</th> : <td className={section.table?.head[index]?.includes(primaryTreatment?.name ?? "__") ? styles.primaryCell : ""} key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

                  {section.callout ? (
                    <aside className={styles.callout}>
                      <span>{section.callout.eyebrow}</span>
                      <h3>{section.callout.title}</h3>
                      <p><InlineRichText value={visibleReviewText(section.callout.body, showReview)} showReview={showReview} /></p>
                    </aside>
                  ) : null}

                  {section.twoCol ? (
                    <div className={styles.twoCol}>
                      {section.twoCol.items.map((item) => (
                        <article key={item.eyebrow}>
                          <span>{item.eyebrow}</span>
                          <h3>{item.title}</h3>
                          <p><InlineRichText value={visibleReviewText(item.body, showReview)} showReview={showReview} /></p>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </MotionGroup>

          {hasJudgement ? (
            <section className={styles.judgement} id="judgement">
              <div className={styles.sectionMarker}><span>03</span><b {...textEditProps("column.detail.judgement.eyebrow")}>{getText(content, "column.detail.judgement.eyebrow")}</b></div>
              <h2 {...textEditProps("column.detail.judgement.title")}>{getText(content, "column.detail.judgement.title")}</h2>
              <div className={styles.judgementGrid}>
                <div><b {...textEditProps("column.detail.judgement.recommend")}>{recommendPanel.eyebrow}</b><h3>{recommendPanel.title}</h3><ul>{column.judgement.recommend.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><b {...textEditProps("column.detail.judgement.consult")}>{consultPanel.eyebrow}</b><h3>{consultPanel.title}</h3><ul>{column.judgement.notRecommend.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
            </section>
          ) : null}

          {hasPrecautions ? (
            <section className={styles.precautions} id="precautions">
              <div className={styles.sectionMarker}><span>04</span><b {...textEditProps("column.detail.precautions.eyebrow")}>{getText(content, "column.detail.precautions.eyebrow")}</b></div>
              <h2 {...textEditProps("column.detail.precautions.title")}>{getText(content, "column.detail.precautions.title")}</h2>
              <ul>{column.precautions.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          ) : null}

          {readNext.length ? (
            <section className={styles.readNext} aria-labelledby="read-next-title">
              <span>READ NEXT</span>
              <h2 id="read-next-title">함께 읽으면 좋은 글</h2>
              <div>
                {readNext.map((item) => (
                  <Link href={`/column/${item.slug}`} key={item.slug}>
                    <small>{item.label}</small>
                    <b>{item.title}</b>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles.shareBox} id="share-actions">
            <div><h2 {...textEditProps("column.detail.share.title")}>{getText(content, "column.detail.share.title")}</h2><p {...textEditProps("column.detail.share.description")}>{getText(content, "column.detail.share.description")}</p></div>
            <ShareButtons content={content} title={column.title} summary={column.summary} url={pageUrl} image={`${pageUrl}/opengraph-image`} kakaoKey={process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ""} />
          </section>
        </article>

        <aside className={styles.sidebar}>
          <div className={styles.stickySidebar}>
            <ArticleToc items={tocItems} title={getText(content, "column.detail.toc.eyebrow")} />
            <div id="ask-doctor"><QuestionForm content={content} columnSlug={column.slug} sidebar idSuffix="desktop" /></div>
          </div>
        </aside>
      </div>

      {faqItems.length ? (
        <section className={styles.faqBand} id="qa" aria-labelledby="detail-faq-heading">
          <div className={styles.faqBandInner}>
            <header><div><span {...textEditProps("column.detail.faq.eyebrow")}>{getText(content, "column.detail.faq.eyebrow")}</span><h2 id="detail-faq-heading">{column.faqTitle ?? getText(content, "column.detail.faq.title")}</h2></div><b className={styles.faqMeta} {...textEditProps("column.detail.faq.meta")}>{getText(content, "column.detail.faq.meta")}</b></header>
            <FaqList items={faqItems} variant="magazine" firstOpen answerLabel={getText(content, "column.detail.faq.answerLabel")} showReview={showReview} />
          </div>
        </section>
      ) : null}

      <section className={styles.mobileQuestionForm} id="ask-doctor-mobile">
        <span>ASK THE DOCTOR</span>
        <QuestionForm content={content} columnSlug={column.slug} sidebar idSuffix="mobile" />
      </section>

      <section className={styles.visitPrep}>
        <div className={styles.visitHeading}><span {...textEditProps("column.detail.visit.eyebrow")}>{getText(content, "column.detail.visit.eyebrow")}</span><h2 {...textEditProps("column.detail.visit.title")}>{getText(content, "column.detail.visit.title")}</h2></div>
        <MotionGroup className={styles.visitGrid} scrollWorldLayer="counter">
          {[0, 1, 2].map((index) => <div key={index} data-motion-item><span>{String(index + 1).padStart(2, "0")}</span><b {...textEditProps(`column.detail.visit.${index}`)}>{getText(content, `column.detail.visit.${index}`)}</b></div>)}
        </MotionGroup>
      </section>

      <section className={styles.authorBox}>
        <ImageSlot className={styles.authorPhoto} label="" alt={getImage(content, "home.doctor.photo").alt} image={getImage(content, "home.doctor.photo")} sizes="96px" priority />
        <div><span {...textEditProps("column.detail.author.eyebrow")}>{getText(content, "column.detail.author.eyebrow")}</span><h2 {...textEditProps("column.detail.author.title")}>{getText(content, "column.detail.author.title")}</h2>{column.authorGreeting ? <p className={styles.authorGreeting}>{column.authorGreeting}</p> : null}<p className={styles.desktopCareer} {...textEditProps("column.detail.author.career")}>{getText(content, "column.detail.author.career")}</p><div className={styles.mobileCareer}>{getText(content, "column.detail.author.career").split(" · ").map((career) => <span key={career}>{career}</span>)}</div></div>
        <Link className={styles.authorAction} href="/doctor/lee-ho" {...textEditProps("column.detail.author.action")}>{getText(content, "column.detail.author.action")}</Link>
      </section>

      <section className={styles.relatedBand}>
        <div>
          <span {...textEditProps("column.detail.related.eyebrow")}>{getText(content, "column.detail.related.eyebrow")}</span>
          <h2 {...textEditProps("column.detail.related.title")}>{getText(content, "column.detail.related.title")}</h2>
          <div className={styles.relatedChips}>{relatedTreatments.map((treatment) => { const color = relatedColor(treatment.slug, treatment.brandColor); return <Link href={treatment.detailPath} key={treatment.slug} style={{ borderColor: color }}><i style={{ background: color }} />{treatment.name} →</Link>; })}</div>
        </div>
        <div className={styles.relatedConsult}><p {...textEditProps("column.detail.related.consult")}><span>{relatedConsultLead}</span>{relatedConsultRest ? <><br className={styles.mobileConsultBreak} /><span className={styles.desktopConsultSpace}> </span><span>{relatedConsultRest}</span></> : null}</p><div className={styles.relatedActions}><a href={getText(content, "home.location.kakaoUrl") || "/consultation"} target="_blank" rel="noopener noreferrer">{getText(content, "column.consult.kakao")}</a><a href="tel:0269587525">02-6958-7525</a></div></div>
      </section>

      <ColumnFooter content={content} legal={getText(content, "column.detail.legal")} />
      <nav className={styles.mobileBottomBar} aria-label="칼럼 빠른 메뉴">
        <a href="#share-actions">공유</a>
        <a href="#ask-doctor-mobile">질문하기</a>
        <a href={getText(content, "home.location.kakaoUrl") || "/consultation"} target="_blank" rel="noopener noreferrer"><ChatBubbleLeftEllipsisIcon aria-hidden="true" />카카오톡 상담</a>
      </nav>
      <DevEditorMount page="column" content={content} />
    </main>
  );
}
