import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnBookmark } from "@/components/ColumnBookmark";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnList } from "@/components/ColumnList";
import { ColumnSearch, type SearchColumn } from "@/components/ColumnSearch";
import { DevEditorMount } from "@/components/DevEditorMount";
import { FaqList, type FaqListItem } from "@/components/FaqList";
import { ImageSlot } from "@/components/ImageSlot";
import { JsonLd } from "@/components/JsonLd";
import { ColumnMainMotion } from "@/components/motion/ColumnMainMotion";
import { MotionGroup } from "@/components/motion/MotionGroup";
import { getPublishedColumns } from "@/content/columns";
import { columnExcerpts, columnTreatmentSearchNames } from "@/content/site";
import { getConcernItems, getImage, getText, textEditProps } from "@/content/site-content-types";
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

export default async function ColumnMainPage() {
  const content = await readSiteContent();
  const showReview = process.env.NEXT_PUBLIC_SHOW_REVIEW === "true";
  const published = getPublishedColumns();
  const featureSlug = getText(content, "column.feature.slug");
  const feature = published.find((column) => column.slug === featureSlug) ?? published[0];
  const featureImage = getImage(content, "column.feature.image");
  const searchColumns: SearchColumn[] = published.map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: columnExcerpts.main[column.slug] ?? column.summary,
    keywords: column.keywords,
  }));
  const faqRecords = published.flatMap((column) => column.faqs.flatMap((faq, index) => faq.a.trim() && !faq.needsReview ? [{
    ...faq,
    slug: column.slug,
    href: `/column/${column.slug}#faq-${index + 1}`,
  }] : []));
  const faqIndex = faqRecords.map((faq, index) => ({
    q: faq.q,
    keywords: published.find((column) => column.slug === faq.slug)?.keywords ?? [],
    slug: faq.slug,
    id: `faq-${index + 1}`,
  }));
  const latestFaqs = faqRecords
    .toSorted((a, b) => (b.answeredAt ?? "").localeCompare(a.answeredAt ?? ""))
    .slice(0, 5);
  const questionItems: FaqListItem[] = latestFaqs.map((faq) => ({ ...faq, href: faq.href }));
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const answeredThisWeek = faqRecords.filter((faq) => faq.answeredAt && new Date(`${faq.answeredAt}T23:59:59+09:00`) >= sevenDaysAgo).length;
  const latestFaq = latestFaqs[0];
  const treatmentSlugs = [...new Set(published.flatMap((column) => column.treatmentSlugs))];
  const concernItems = getConcernItems(content);
  const concernKeys = ["sagging", "jawline", "pigment", "pores", "regeneration", "wrinkle"];
  const concernNames = new Map(concernKeys.map((key, index) => [key, concernItems[index]?.name ?? ""]));
  const coverDescription = getText(content, "column.cover.description");
  const coverDescriptionBreak = coverDescription.indexOf(". ");
  const coverDescriptionLead = coverDescriptionBreak >= 0 ? coverDescription.slice(0, coverDescriptionBreak + 1) : coverDescription;
  const coverDescriptionRest = coverDescriptionBreak >= 0 ? coverDescription.slice(coverDescriptionBreak + 2) : "";
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
      <ColumnMainMotion />
      <ColumnBookmark columns={searchColumns} content={content} faqIndex={faqIndex} treatments={columnTreatmentSearchNames} />
      <ColumnHeader content={content} variant="overlay" page="main" />
      <div className={styles.heroStage} data-column-hero>
        <section className={styles.cover}>
          <span className={styles.verticalLabel} data-column-bookmark-fade>
            <span data-column-entry="meta" {...textEditProps("column.cover.vertical")}>{getText(content, "column.cover.vertical")}</span>
          </span>
          <div className={styles.coverInner}>
            <div className={styles.coverMeta} data-column-entry="meta">
              <span {...textEditProps("column.cover.kicker")}>{getText(content, "column.cover.kicker")}</span>
              <span {...textEditProps("column.cover.issue")}>{getText(content, "column.cover.issue")}</span>
            </div>
            <h1 className={`${styles.masthead} ${styles.desktopMasthead}`} data-column-bookmark-title>
              <span className={styles.mastheadLine}><span data-column-entry="title-top" {...textEditProps("column.cover.titleTop")}>{getText(content, "column.cover.titleTop")}</span></span>
              <span className={styles.mastheadLine}><span data-column-entry="title-bottom" {...textEditProps("column.cover.titleBottom")}>{getText(content, "column.cover.titleBottom")}</span></span>
            </h1>
            <h1 className={styles.mobileMasthead} aria-label="Glory's Column">
              <span className={styles.mastheadLine}><span data-column-entry="title-top" {...textEditProps("column.cover.titleTop")}>{getText(content, "column.cover.titleTop")}</span></span>
              <span className={styles.mastheadLine}><span data-column-entry="title-bottom" {...textEditProps("column.cover.titleBottom")}>{getText(content, "column.cover.titleBottom")}</span></span>
            </h1>
            <div className={styles.descriptionFade} data-column-bookmark-fade>
              <p data-column-entry="description" {...textEditProps("column.cover.description")}>
                {coverDescriptionLead}
                {coverDescriptionRest ? <><br className={styles.mobileBreak} /><span className={styles.desktopSpace}> </span>{coverDescriptionRest}</> : null}
              </p>
            </div>
          </div>
        </section>

        <div className={styles.searchShell} data-column-entry="search" data-column-bookmark-search>
          <ColumnSearch columns={searchColumns} content={content} faqIndex={faqIndex} treatments={columnTreatmentSearchNames} />
        </div>
      </div>

      <div className={styles.issueBar} aria-label="발행 정보" data-column-section-motion="issue">
        <span {...textEditProps("column.cover.issueShort")}>{getText(content, "column.cover.issueShort")}</span>
        <i aria-hidden="true" />
        <span {...textEditProps("column.cover.kicker")}>{getText(content, "column.cover.kicker")}</span>
      </div>

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

      <ColumnList columns={published} content={content} concernMode />

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
            <p className={styles.mobileQuestionStats}>지금까지 <b>{faqRecords.length}개</b> 답변 · 이번 주 <b>{answeredThisWeek || 3}개</b> 새 답변</p>
            <FaqList items={questionItems} variant="magazine" mobileStyle="issue" firstOpen answerLabel={getText(content, "column.questions.answerLabel")} readLabel={getText(content, "column.questions.read")} showReview={showReview} useSummary />
            <div className={styles.askRow}>
              <p {...textEditProps("column.questions.askCaption")}>{getText(content, "column.questions.askCaption")}</p>
              <Link href={`/column/${feature?.slug ?? published[0]?.slug}#ask-doctor`} {...textEditProps("column.questions.askAction")}>{getText(content, "column.questions.askAction")}</Link>
            </div>
          </div>
        </section>
      ) : null}

      {treatmentSlugs.length ? (
        <section className={styles.treatments} aria-labelledby="treatments-heading" data-column-section-motion="treatments">
          <header>
            <h2 id="treatments-heading" {...textEditProps("column.treatments.sectionTitle")}>{getText(content, "column.treatments.sectionTitle")}</h2>
            <span {...textEditProps("column.treatments.eyebrow")}>{getText(content, "column.treatments.eyebrow")}</span>
          </header>
          <MotionGroup className={styles.treatmentGrid} scrollWorldLayer="copy" stagger={0.1}>
            {treatmentSlugs.flatMap((slug) => {
              const treatment = getTreatment(slug);
              if (!treatment) return [];
              const thumbnail = getImage(content, `treatments.${slug}.thumbnail`);
              const hasLocalThumbnail = thumbnail.src?.startsWith("/uploads/");
              return [<Link href={treatment.detailPath} key={slug} data-motion-item style={{ "--treatment-color": treatment.brandColor ?? "#8c7b6b" } as CSSProperties}>
                <span className={styles.treatmentVisual}>{hasLocalThumbnail ? <ImageSlot label="" alt={thumbnail.alt} image={thumbnail} sizes="150px" unoptimized priority /> : null}</span>
                <b>{treatment.name} →</b><span>{treatment.desc}</span>
              </Link>];
            })}
          </MotionGroup>
        </section>
      ) : null}

      <section className={styles.archive} aria-labelledby="archive-heading" data-column-section-motion="archive">
        <header>
          <h2 id="archive-heading" {...textEditProps("column.archive.title")}>{getText(content, "column.archive.title")}</h2>
          <span {...textEditProps("column.archive.eyebrow")}>{getText(content, "column.archive.eyebrow")}</span>
        </header>
        <MotionGroup className={styles.archiveList} scrollWorldLayer="depth" stagger={0.1}>
          {published.map((column) => (
            <Link href={`/column/${column.slug}`} key={column.slug} data-motion-item>
              <div className={styles.archiveMeta}>
                <time dateTime={column.publishedAt}>{column.publishedAt ? formatDateKo(column.publishedAt).replaceAll(". ", ".").replace(/\.$/, "") : ""}</time>
                <i aria-hidden="true">·</i>
                <span>{column.concerns.map((concern) => concernNames.get(concern)).filter(Boolean).join(" · ") || getCategory(column.categorySlug)?.name}</span>
              </div>
              <b><span className={styles.desktopArchiveTitle}>{column.title}</span><span className={styles.mobileArchiveTitle}>{column.slug === "xerf-vs-thermage" ? <><span>세르프(XERF)와</span><span>써마지FLX의 차이,</span><span>누구에게 맞을까요?</span></> : column.title}</span></b>
              <small>READ {String(column.readMinutes).padStart(2, "0")} MIN</small>
            </Link>
          ))}
        </MotionGroup>
      </section>

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
          <a href={getText(content, "home.location.kakaoUrl") || "/consultation"} target="_blank" rel="noopener noreferrer" {...textEditProps("column.consult.kakao")}>{getText(content, "column.consult.kakao")}</a>
          <a href="tel:0269587525">02-6958-7525</a>
        </div>
      </section>

      <ColumnFooter content={content} />
      <nav className={styles.mobileBottomBar} aria-label="빠른 상담" data-mobile-bottom-bar="phone">
        <a href={getText(content, "home.location.kakaoUrl") || "/consultation"} target="_blank" rel="noopener noreferrer"><ChatBubbleLeftEllipsisIcon aria-hidden="true" />카카오톡 상담</a>
        <a href="tel:0269587525">전화 02-6958-7525</a>
      </nav>
      <DevEditorMount page="column" content={content} />
      <JsonLd value={pageGraph} />
    </main>
  );
}
