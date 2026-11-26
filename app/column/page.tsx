import { byPublication, concernKeys } from "@/lib/column-filters";
import type { Metadata } from "next";
import Link from "next/link";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnList } from "@/components/ColumnList";
import { ColumnSearch, type SearchColumn } from "@/components/ColumnSearch";
import { DevEditorMount } from "@/components/DevEditorMount";
import { FaqList, type FaqListItem } from "@/components/FaqList";
import { ImageSlot } from "@/components/ImageSlot";
import { JsonLd } from "@/components/JsonLd";
import { MotionGroup } from "@/components/motion/MotionGroup";
import { getPublishedColumns } from "@/content/columns";
import { columnExcerpts, columnTreatmentSearchNames } from "@/content/site";
import { getImage, getText, textEditProps } from "@/content/site-content-types";
import { getCategory, getTreatment } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, collectionNodes, formatDateKo, graph } from "@/lib/seo";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, {
    title: getText(content, "seo.column.title"),
    description: getText(content, "seo.column.description"),
    pathname: "/column",
  });
}

export default async function ColumnMainPage({ searchParams }: { searchParams: Promise<{ concern?: string | string[] }> }) {
  const [content, params] = await Promise.all([readSiteContent(), searchParams]);
  const activeConcern = concernKeys.find((key) => key === params.concern);
  const showReview = process.env.NEXT_PUBLIC_SHOW_REVIEW === "true";
  const published = getPublishedColumns().sort(byPublication);
  const featureSlug = getText(content, "column.feature.slug");
  const feature = published.find((column) => column.slug === featureSlug) ?? published[0];
  const featureImage = getImage(content, "column.feature.image");
  const searchColumns: SearchColumn[] = published.map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: columnExcerpts.main[column.slug] ?? column.summary,
    keywords: column.keywords,
    summary: column.summary,
    concerns: column.concerns,
  }));
  const faqRecords = published.flatMap((column) => column.faqs.flatMap((faq, index) => faq.a.trim() && !faq.needsReview && !faq.a.includes("[원장 확인]") ? [{
    ...faq,
    slug: column.slug,
    href: `/column/${column.slug}#faq-${index + 1}`,
  }] : []));
  const faqIndex = faqRecords.map((faq) => ({
    q: faq.q,
    keywords: published.find((column) => column.slug === faq.slug)?.keywords ?? [],
    slug: faq.slug,
    id: faq.href.split("#")[1],
  }));
  const latestFaqs = faqRecords
    .toSorted((a, b) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? ""));
  const questionItems: FaqListItem[] = latestFaqs.map((faq) => ({ ...faq, href: faq.href }));
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const answeredThisWeek = faqRecords.filter((faq) => faq.answeredAt && new Date(`${faq.answeredAt}T23:59:59+09:00`) >= sevenDaysAgo).length;
  const latestFaq = latestFaqs[0];
  const consultTitle = getText(content, "column.consult.title");
  const consultLocation = consultTitle.split("·").slice(1).join("·").trim();
  const mobileConsultTitle = getText(content, "column.detail.related.consult");
  const mobileConsultBreak = mobileConsultTitle.indexOf("대표원장이");
  const mobileConsultLead = mobileConsultBreak >= 0 ? mobileConsultTitle.slice(0, mobileConsultBreak).trim() : mobileConsultTitle;
  const mobileConsultRest = mobileConsultBreak >= 0 ? mobileConsultTitle.slice(mobileConsultBreak).trim() : "";
  const pageGraph = graph(
    content,
    collectionNodes(
      "/column",
      getText(content, "seo.column.title"),
      getText(content, "seo.column.description"),
      published,
    ),
  );

  return (
    <main className={styles.page} data-column-page>
      <ColumnHeader content={content} page="main" />
      <section className={styles.compactIntro}>
        <span>Glory&apos;s Column</span>
        <h1>진료실 질문에 원장이 직접 답합니다</h1>
        <ColumnSearch columns={searchColumns} content={content} faqIndex={faqIndex} treatments={columnTreatmentSearchNames} />
      </section>

      {feature ? (
        <section className={styles.feature} aria-labelledby="feature-heading" data-column-section-motion="feature">
          <div className={styles.featureMeta}>
            <span {...textEditProps("column.feature.eyebrow")}>{getText(content, "column.feature.eyebrow")}</span>
            <span {...textEditProps("column.feature.readMeta")}>{getText(content, "column.feature.readMeta")}</span>
          </div>
          <div className={styles.featureVisual} data-column-reveal="feature-image">
            <div className={styles.featureImageParallax} data-column-parallax="160">
              <ImageSlot className={styles.featureImage} label="" alt={featureImage.alt} editId="column.feature.image" image={featureImage} priority sizes="100vw" />
            </div>
            <div className={styles.featureShade} aria-hidden="true" />
            <div className={styles.featureTitle} data-column-reveal="feature-title">
              <span {...textEditProps("column.feature.number")}>{getText(content, "column.feature.number")}</span>
              <h2 id="feature-heading" {...textEditProps("column.feature.title")}>{getText(content, "column.feature.title")}</h2>
            </div>
          </div>
          <div
            className={styles.featureCard}
            data-column-feature-card-parallax=""
            data-column-parallax="-60"
            data-column-parallax-mobile="-32"
            data-column-parallax-after-reveal=""
          >
            <MotionGroup className={styles.featureCardMotion} scrollWorldLayer="depth">
              <article data-motion-item>
                <span className={styles.featureCardMeta} {...textEditProps("column.feature.readMeta")}>{getText(content, "column.feature.readMeta")}</span>
                <h3><Link href={`/column/${feature.slug}`}><span className={styles.desktopFeatureTitle}>{feature.title} →</span><span className={styles.mobileFeatureTitle}>{feature.slug === "xerf-vs-thermage" ? <><span>세르프(XERF)와</span><span>써마지FLX의 차이,</span><span>누구에게 맞을까요? →</span></> : feature.title}</span></Link></h3>
                <i aria-hidden="true" />
                <b {...textEditProps("column.feature.conclusion")}>{getText(content, "column.feature.conclusion")}</b>
                <p>{feature.slug === "xerf-vs-thermage" ? <>
                  세르프는 울쎄라·써마지를 합친 효과를<br className={styles.mobileBreak} /><span className={styles.desktopSpace}> </span>
                  어느 정도는 내줄 수 있지만,<br className={styles.mobileBreak} /><span className={styles.desktopSpace}> </span>
                  울쎄라의 효과를 완벽하게 따라갈 순 없습니다.
                </> : feature.summary}</p>
                <div className={styles.featureTreatments}>
                  <span {...textEditProps("column.feature.treatments")}>{getText(content, "column.feature.treatments")}</span>
                  {feature.treatmentSlugs.flatMap((slug) => {
                    const treatment = getTreatment(slug);
                    return treatment ? [<Link href={treatment.detailPath} key={slug}>{treatment.name} →</Link>] : [];
                  })}
                </div>
              </article>
            </MotionGroup>
          </div>
        </section>
      ) : null}

      <ColumnList columns={published} content={content} concernMode activeConcern={activeConcern} />

      {questionItems.length ? (
        <section className={styles.questions} aria-labelledby="questions-heading" data-column-section-motion="questions">
          <span className={styles.qaDecoration} aria-hidden="true" data-column-parallax="-110">Q&amp;A</span>
          <div className={styles.questionsInner}>
            <header className={styles.questionsHeader}>
              <h2 id="questions-heading" {...textEditProps("column.questions.title")}>{getText(content, "column.questions.title")}</h2>
              <div>
                <span {...textEditProps("column.questions.eyebrow")}>{getText(content, "column.questions.eyebrow")}</span>
                <p {...textEditProps("column.questions.description")}>{getText(content, "column.questions.description")}</p>
              </div>
            </header>
            <header className={styles.mobileQuestionsHeader}>
              <span>Q&amp;A · ISSUE 01</span>
              <h2>{getText(content, "column.questions.title")}</h2>
              <p>{getText(content, "column.questions.description")}</p>
            </header>
            <div className={styles.questionStats}>
              <div>
                <span {...textEditProps("column.questions.answered")}>{getText(content, "column.questions.answered")}</span>
                <strong>{String(faqRecords.length).padStart(2, "0")}<small>개 답변</small></strong>
                <p {...textEditProps("column.questions.answeredDesc")}>{getText(content, "column.questions.answeredDesc")}</p>
              </div>
              {answeredThisWeek ? <div>
                <span {...textEditProps("column.questions.week")}>{getText(content, "column.questions.week")}</span>
                <strong>{answeredThisWeek}<small>개 새 답변</small></strong>
                <p {...textEditProps("column.questions.weekDesc")}>{getText(content, "column.questions.weekDesc")}</p>
              </div> : null}
              {latestFaq ? <div>
                <span {...textEditProps("column.questions.latest")}>{getText(content, "column.questions.latest")}</span>
                <strong className={styles.latestQuestion}>“{latestFaq.q}”</strong>
                {latestFaq.answeredAt ? <p>최근 답변 · {formatDateKo(latestFaq.answeredAt)}</p> : null}
              </div> : null}
            </div>
            <p className={styles.mobileQuestionStats}>지금까지 <b>{faqRecords.length}개</b> 답변 · 이번 주 <b>{answeredThisWeek}개</b> 새 답변</p>
            <FaqList items={questionItems.slice(0, 3)} variant="magazine" mobileStyle="issue" firstOpen answerLabel={getText(content, "column.questions.answerLabel")} readLabel={getText(content, "column.questions.read")} showReview={showReview} useSummary />
            {questionItems.length > 3 ? <details className={styles.moreQuestions}><summary>질문 더 보기</summary><FaqList items={questionItems.slice(3)} variant="magazine" /></details> : null}
            <div className={styles.askRow}>
              <p {...textEditProps("column.questions.askCaption")}>{getText(content, "column.questions.askCaption")}</p>
              <Link href={`/column/${feature?.slug ?? published[0]?.slug}#ask-doctor`} {...textEditProps("column.questions.askAction")}>{getText(content, "column.questions.askAction")}</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.consult} data-column-section-motion="consult">
        <div>
          <span {...textEditProps("column.consult.eyebrow")}>{getText(content, "column.consult.eyebrow")}</span>
          <h2 className={styles.desktopConsultTitle} {...textEditProps("column.consult.title")}>{consultTitle}</h2>
          <h2 className={styles.mobileConsultTitle}>
            {mobileConsultLead}
            {mobileConsultRest ? <><br />{mobileConsultRest}</> : null}
          </h2>
          <p className={styles.mobileConsultLocation}>{consultLocation} · 02-6958-7525</p>
        </div>
        <div className={styles.consultActions}>
          <a href={"https://pf.kakao.com/_xkRRPG"} target="_blank" rel="noopener noreferrer" {...textEditProps("column.consult.kakao")}>{getText(content, "column.consult.kakao")}</a>
          <a href="tel:0269587525">02-6958-7525</a>
        </div>
      </section>

      <ColumnFooter content={content} />
      <nav className={styles.mobileBottomBar} aria-label="빠른 상담" data-mobile-bottom-bar="phone">
        <a href={"https://pf.kakao.com/_xkRRPG"} target="_blank" rel="noopener noreferrer"><ChatBubbleLeftEllipsisIcon aria-hidden="true" />카카오톡 상담</a>
        <a href="tel:0269587525">전화 02-6958-7525</a>
      </nav>
      <DevEditorMount page="column" content={content} />
      <JsonLd value={pageGraph} />
    </main>
  );
}
