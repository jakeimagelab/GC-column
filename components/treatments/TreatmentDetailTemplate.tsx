import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { ColumnHeader } from "@/components/ColumnHeader";
import { FooterPolicyLinks } from "@/components/FooterPolicyLinks";
import type { SiteContent } from "@/content/site-content-types";
import { getText } from "@/content/site-content-types";
import type { Column } from "@/content/types";
import { getCategory, getTreatmentCategoryPath } from "@/content/treatments";
import type { ReviewableValue, TreatmentDetail, TreatmentFaq } from "@/content/treatments/types";
import { getDisplayedHours } from "@/lib/site-info";
import { TreatmentHero } from "./TreatmentHero";
import { TreatmentReveal } from "./TreatmentReveal";
import styles from "./TreatmentDetailTemplate.module.css";

export type RelatedTreatmentColumn = Pick<Column, "slug" | "categorySlug" | "title" | "publishedAt" | "updatedAt">;

const showReview = process.env.NEXT_PUBLIC_SHOW_REVIEW === "true";
const REVIEW_TOKEN = /[ \t]*\[원장 확인\][ \t]*/g;

function cleanReviewText(value: string) {
  return value.replace(REVIEW_TOKEN, " ").replace(/[ \t]{2,}/g, " ").trim();
}

function Lines({ text }: { text: string }) {
  return cleanReviewText(text).split("\n").map((line, index, lines) => (
    <Fragment key={`${line}-${index}`}>{line}{index < lines.length - 1 ? <br /> : null}</Fragment>
  ));
}

function GlanceLines({ text }: { text: string }) {
  return cleanReviewText(text).split("\n").map((line, index, lines) => {
    const parts = line.split("진피층");
    return (
      <Fragment key={`${line}-${index}`}>
        {parts.map((part, partIndex) => (
          <Fragment key={`${part}-${partIndex}`}>
            {part}{partIndex < parts.length - 1 ? <strong>진피층</strong> : null}
          </Fragment>
        ))}
        {index < lines.length - 1 ? <br /> : null}
      </Fragment>
    );
  });
}

function ReviewMark({ dark = false }: { dark?: boolean }) {
  return showReview ? <span className={`${styles.reviewMark} ${dark ? styles.reviewMarkDark : ""}`}>[원장 확인]</span> : null;
}

function ReviewValue({ item, dark = false }: { item: ReviewableValue; dark?: boolean }) {
  if (item.needsReview && !showReview) return null;
  const text = cleanReviewText(item.value);
  return <>{text ? <Lines text={text} /> : null}{item.needsReview ? <ReviewMark dark={dark} /> : null}</>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: string }) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p className={styles.headingDescription}><Lines text={description} /></p> : null}
    </header>
  );
}

function VisibleFaqs({ faqs }: { faqs: TreatmentFaq[] }) {
  const visibleFaqs = faqs.filter((faq) => showReview || !faq.needsReview);
  if (!visibleFaqs.length) return null;
  return (
    <div className={styles.faqList}>
      {visibleFaqs.map((faq, index) => (
        <details key={faq.q} open={index === 0}>
          <summary>
            <span className={styles.faqNumber}>Q {String(index + 1).padStart(2, "0")}</span>
            <b>{faq.q}</b>
            <span className={styles.faqToggle} aria-hidden="true">+</span>
          </summary>
          <div className={styles.faqAnswer}><p><Lines text={faq.a} /></p>{faq.needsReview ? <ReviewMark /> : null}</div>
        </details>
      ))}
    </div>
  );
}

function CompareTable({ treatment }: { treatment: Extract<TreatmentDetail, { kind: "device" }> }) {
  if (!treatment.compare) return null;
  const rows = treatment.compare.rows.filter((row) => showReview || !row.needsReview);
  if (!rows.length) return null;
  return (
    <>
      <p className={styles.mobileScrollHint}>← 옆으로 넘겨보세요</p>
      <div className={styles.tableFrame}>
        <div className={styles.tableScroll} tabIndex={0} aria-label={`${treatment.name} 리프팅 장비 비교표`}>
          <table>
            <thead><tr>{treatment.compare.columns.map((column, index) => <th className={index === treatment.compare?.highlightColumn ? styles.highlightHead : ""} scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => <td className={index + 1 === treatment.compare?.highlightColumn ? styles.highlightCell : ""} key={`${row.label}-${index}`}>
                  {row.needsReview ? <><span>{cleanReviewText(value)}</span><ReviewMark /></> : value}
                </td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function InjectionSections({ treatment }: { treatment: Extract<TreatmentDetail, { kind: "injection" }> }) {
  const products = treatment.products?.filter((item) => showReview || !item.needsReview) ?? [];
  const areas = treatment.areas?.filter((item) => showReview || !item.needsReview) ?? [];
  const showDuration = treatment.duration && (showReview || !treatment.duration.needsReview);
  return (
    <>
      {products.length ? <TreatmentReveal className={styles.section}><section className={styles.sectionRow}><SectionHeading eyebrow="PRODUCTS" title={<>어떤 <b>제품을 쓰나요?</b></>} /><div className={styles.lineList}>{products.map((item) => <article key={item.name}><b>{item.name}</b><p>{cleanReviewText(item.desc)}</p>{item.needsReview ? <ReviewMark /> : null}</article>)}</div></section></TreatmentReveal> : null}
      {areas.length ? <TreatmentReveal className={styles.section}><section className={styles.sectionRow}><SectionHeading eyebrow="AREAS · AMOUNT" title={<>어디에, <b>얼마나 넣나요?</b></>} /><div className={styles.lineList}>{areas.map((item) => <article key={item.area}><b>{item.area}</b><p>{cleanReviewText(item.note)}</p>{item.needsReview ? <ReviewMark /> : null}</article>)}</div></section></TreatmentReveal> : null}
      {showDuration && treatment.duration ? <TreatmentReveal className={styles.section}><section className={styles.sectionRow}><SectionHeading eyebrow="DURATION" title={<>효과는 <b>얼마나 유지되나요?</b></>} /><div className={styles.largeAnswer}><ReviewValue item={treatment.duration} /></div></section></TreatmentReveal> : null}
    </>
  );
}

export function TreatmentDetailTemplate({ treatment, content, relatedColumns }: { treatment: TreatmentDetail; content: SiteContent; relatedColumns: RelatedTreatmentColumn[] }) {
  const categoryName = getCategory(treatment.category)?.name ?? treatment.category;
  const categoryPath = getTreatmentCategoryPath(treatment.category);
  const kakaoUrl = getText(content, "common.quick.kakaoUrl");
  const phone = getText(content, "common.clinic.phone");
  const address = getText(content, "common.clinic.address");
  const businessNumber = getText(content, "common.clinic.businessNumber");
  const footerNotice = getText(content, "home.footer.notice");
  const hours = getDisplayedHours(content);
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const visibleGlanceItems = treatment.glance.items.filter((item) => showReview || !item.needsReview);
  const showGlanceVideo = Boolean(treatment.glance.video?.src || (showReview && treatment.glance.video));
  const showForYou = treatment.forYou && (showReview || !treatment.forYou.needsReview) && (treatment.forYou.recommend.length || treatment.forYou.consultFirst.length);
  const visiblePain = treatment.painResult && (showReview || !treatment.painResult.pain.needsReview);
  const visibleResult = treatment.painResult && (showReview || !treatment.painResult.result.needsReview);
  const showPainResult = visiblePain || visibleResult;
  const showCare = treatment.care && (showReview || !treatment.care.needsReview) && (treatment.care.before.length || treatment.care.after.length);
  const relatedColumn = treatment.relatedColumnSlug ? relatedColumns.find((column) => column.slug === treatment.relatedColumnSlug) : relatedColumns[0];
  const theme = {
    "--tx-accent": treatment.accent,
    "--tx-accent-soft": treatment.accentSoft,
    "--tx-accent-light": treatment.accentLight,
  } as CSSProperties;
  const hero = {
    ...treatment.hero,
    chips: treatment.hero.chips.filter((chip) => showReview || !chip.needsReview),
  };

  const device = treatment.kind === "device" ? treatment : null;
  const mechanism = device?.mechanism && (showReview || !device.mechanism.needsReview) ? device.mechanism : undefined;
  const compareRows = device?.compare?.rows.filter((row) => showReview || !row.needsReview) ?? [];
  const genuine = device?.genuine
    ?.map((item, index) => ({ item, index }))
    .filter(({ item }) => showReview || !item.needsReview) ?? [];
  const showDeviceDark = Boolean(device?.handpieceTips || genuine.length);

  return (
    <main className={styles.page} style={theme}>
      <div className={styles.heroFrame}>
        <ColumnHeader content={content} variant="overlay" page="home" />
        <TreatmentHero hero={hero} categoryName={categoryName} categoryPath={categoryPath} accent={treatment.accent} accentLight={treatment.accentLight} showReview={showReview} kakaoUrl={kakaoUrl} />
      </div>

      <TreatmentReveal className={styles.section}>
        <section className={`${styles.sectionRow} ${styles.glanceSection}`} aria-labelledby="glance-title">
          <SectionHeading eyebrow="AT A GLANCE" title={<>{treatment.name},<br /><b>한눈에 보기</b></>} description={"결론부터 읽고,\n필요한 만큼 내려가 보세요."} />
          <div className={`${styles.glanceBody} ${showGlanceVideo ? styles.glanceBodyWithVideo : ""}`}>
            <div className={styles.glanceContent}>
              <div className={styles.glanceLead} id="glance-title"><GlanceLines text={treatment.glance.lead} /></div>
              {visibleGlanceItems.length ? <dl className={styles.glanceItems}>{visibleGlanceItems.map((item) => <div key={item.label}><dt>{item.label}</dt><dd><ReviewValue item={item} /></dd></div>)}</dl> : null}
            </div>
            {showGlanceVideo && treatment.glance.video ? <div className={`${styles.videoCard} ${treatment.glance.video.src ? "" : styles.videoPlaceholder}`} aria-label={treatment.glance.video.label}>
              {treatment.glance.video.src ? <video controls preload="metadata" src={treatment.glance.video.src} /> : <span className={styles.videoPlay} aria-hidden="true">▶</span>}
              <small>DOCTOR&apos;S ANSWER · 0:30</small>
              <b><Lines text={treatment.glance.video.label} /></b>
              {!treatment.glance.video.src ? <span className={styles.videoReviewNote}>[12월 촬영 · 세로 영상 · 자막 포함]</span> : null}
            </div> : null}
          </div>
        </section>
      </TreatmentReveal>

      {showForYou && treatment.forYou ? <TreatmentReveal className={`${styles.section} ${styles.softSection}`}>
        <section className={styles.sectionRow} aria-labelledby="for-you-title">
          <SectionHeading eyebrow="FOR YOU" title={<>어떤 분께<br /><b>맞나요?</b></>} />
          <div className={styles.forYouGrid} id="for-you-title">
            <div><h3>이런 분께 권합니다</h3><ul className={styles.dotList}>{treatment.forYou.recommend.map((item, index) => <li key={`${item}-${index}`}>{cleanReviewText(item)}{treatment.forYou?.needsReview ? <ReviewMark /> : null}</li>)}</ul></div>
            <div><h3>이런 경우는 먼저 상담합니다</h3><ul className={`${styles.dotList} ${styles.hollowList}`}>{treatment.forYou.consultFirst.map((item, index) => <li key={`${item}-${index}`}>{cleanReviewText(item)}{treatment.forYou?.needsReview ? <ReviewMark /> : null}</li>)}</ul></div>
          </div>
        </section>
      </TreatmentReveal> : null}

      {device && mechanism ? <TreatmentReveal className={styles.section}>
        <section className={styles.sectionRow} aria-labelledby="mechanism-title">
          <SectionHeading eyebrow="HOW IT WORKS" title={<>{treatment.name}는<br /><b>어떻게 작용하나요?</b></>} description={mechanism.lead} />
          <div className={styles.mechanismContent} id="mechanism-title">
            <TreatmentReveal mode="line" className={styles.mechanismLine}><span /></TreatmentReveal>
            <ol className={styles.mechanismSteps}>{mechanism.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p><Lines text={step} /></p>{mechanism.needsReview ? <ReviewMark /> : null}</li>)}</ol>
            {mechanism.illustration.src ? <TreatmentReveal mode="zoom" className={styles.mechanismVisual}><Image src={mechanism.illustration.src} alt={mechanism.illustration.alt} fill sizes="(max-width: 760px) 100vw, 68vw" /></TreatmentReveal> : showReview ? <TreatmentReveal mode="zoom" className={`${styles.mechanismVisual} ${styles.mechanismPlaceholder}`}>
              <p>[일러스트] 피부 단면 · 표면 쿨링 + 진피층 가열 <ReviewMark /></p>
            </TreatmentReveal> : null}
          </div>
        </section>
      </TreatmentReveal> : null}

      {device?.compare && compareRows.length ? <TreatmentReveal className={styles.section}>
        <section className={styles.sectionRow} aria-labelledby="compare-title">
          <SectionHeading eyebrow="COMPARE" title={<>다른 리프팅 장비와<br /><b>무엇이 다른가요?</b></>} />
          <div id="compare-title"><CompareTable treatment={device} />{device.compare.columnLink ? <Link className={styles.textLink} href={device.compare.columnLink.href}>{device.compare.columnLink.label}</Link> : null}</div>
        </section>
      </TreatmentReveal> : null}

      {treatment.kind === "injection" ? <InjectionSections treatment={treatment} /> : null}

      {device && showDeviceDark ? <section className={styles.deviceSection} aria-labelledby="device-title">
        <span className={styles.genuineBackdrop} aria-hidden="true">GENUINE</span>
        <div className={styles.deviceInner}>
          <div className={styles.deviceHeader}><p className={styles.darkEyebrow}>HANDPIECE · TIPS</p><h2 id="device-title">{device.handpieceTips ? <>하나의 핸드피스,<br /><b>부위에 맞춘 정품 팁</b></> : <>정품 장비와,<br /><b>확인 절차</b></>}</h2></div>
          {device.handpieceTips ? <div className={styles.handpieceLayout}>
            <TreatmentReveal mode="clip" className={styles.handpieceFeature}>
              <div className={styles.handpieceGlow}>{device.handpieceTips.handpiece.src ? <Image src={device.handpieceTips.handpiece.src} alt={device.handpieceTips.handpiece.alt} width={230} height={355} /> : null}</div>
              <h3>{device.handpieceTips.handpiece.title}</h3><p><Lines text={device.handpieceTips.handpiece.desc} /></p>
            </TreatmentReveal>
            <div className={styles.tipGrid}>{device.handpieceTips.tips.map((tip, index) => <TreatmentReveal mode="clip" delay={index * .08} className={styles.tipCard} key={`${tip.name}-${tip.size}`}>
              <div>{tip.src ? <Image src={tip.src} alt={`${tip.name} ${tip.size}`} width={210} height={190} /> : null}</div><h3>{tip.name}</h3><b>{tip.size}</b><p>{tip.area}</p>
            </TreatmentReveal>)}</div>
          </div> : null}
          {device.handpieceTips?.note && (showReview || !device.handpieceTips.noteNeedsReview) ? <p className={styles.deviceNote}>{cleanReviewText(device.handpieceTips.note)}{device.handpieceTips.noteNeedsReview ? <ReviewMark dark /> : null}</p> : null}
          {genuine.length ? <div className={styles.genuineGrid}>{genuine.map(({ item, index }) => <article key={item.title}><small>{["GENUINE", "ONE TIP", "CERTIFICATE"][index] ?? `CHECK ${index + 1}`}</small><h3>{item.title}</h3><p>{cleanReviewText(item.desc)}</p>{item.needsReview ? <ReviewMark dark /> : null}</article>)}</div> : null}
        </div>
      </section> : null}

      <TreatmentReveal className={styles.section}>
        <section className={styles.sectionRow} aria-labelledby="process-title">
          <SectionHeading eyebrow="PROCESS" title={<>시술은<br /><b>어떻게 진행되나요?</b></>} />
          <div className={styles.processContent} id="process-title">
            {showReview || !treatment.totalTime.needsReview ? <p className={styles.totalTime}>전체 소요 시간 <ReviewValue item={treatment.totalTime} /></p> : null}
            <ol className={styles.processTimeline}>{treatment.process.map((step) => <li className={step.step === 1 || step.step === 4 ? styles.activeStep : ""} key={step.step}><i /><span>{String(step.step).padStart(2, "0")}</span><b>{step.title}</b></li>)}</ol>
          </div>
        </section>
      </TreatmentReveal>

      {showPainResult && treatment.painResult ? <TreatmentReveal className={`${styles.section} ${styles.softSection}`}>
        <section className={styles.sectionRow} aria-labelledby="pain-title">
          <SectionHeading eyebrow="PAIN · RESULT" title={<>가장 많이<br /><b>묻는 두 가지</b></>} />
          <div className={styles.painGrid} id="pain-title">
            {visiblePain ? <article><h3><Lines text={treatment.painResult.pain.label} /></h3><p><ReviewValue item={treatment.painResult.pain} /></p></article> : null}
            {visibleResult ? <article><h3><Lines text={treatment.painResult.result.label} /></h3><p><ReviewValue item={treatment.painResult.result} /></p></article> : null}
          </div>
        </section>
      </TreatmentReveal> : null}

      <TreatmentReveal className={styles.promiseSection}>
        <section className={styles.promiseInner} aria-labelledby="promise-title">
          <span className={styles.quoteMark} aria-hidden="true">“</span>
          <h2 id="promise-title"><Lines text={treatment.promise.quote} /></h2>
          <p>{treatment.promise.signature}</p>
          <div className={styles.promiseGrid}>{treatment.promise.items.map((item, index) => <article key={item}><small>PROMISE {String(index + 1).padStart(2, "0")}</small><p><Lines text={item} /></p></article>)}</div>
        </section>
      </TreatmentReveal>

      {showCare && treatment.care ? <TreatmentReveal className={`${styles.section} ${styles.softSection}`}>
        <section className={styles.sectionRow} aria-labelledby="care-title">
          <SectionHeading eyebrow="BEFORE · AFTER" title={<>시술 전후,<br /><b>무엇을 지켜야 하나요?</b></>} />
          <div className={styles.careGrid} id="care-title">
            <div><h3>시술 전</h3><ul className={styles.dotList}>{treatment.care.before.map((item, index) => <li key={`${item}-${index}`}>{cleanReviewText(item)}{treatment.care?.needsReview ? <ReviewMark /> : null}</li>)}</ul></div>
            <div><h3>시술 후</h3><ul className={styles.dotList}>{treatment.care.after.map((item, index) => <li key={`${item}-${index}`}>{cleanReviewText(item)}{treatment.care?.needsReview ? <ReviewMark /> : null}</li>)}</ul></div>
          </div>
        </section>
      </TreatmentReveal> : null}

      {treatment.faq.some((faq) => showReview || !faq.needsReview) ? <TreatmentReveal className={styles.section}>
        <section className={styles.sectionRow} aria-labelledby="faq-title">
          <SectionHeading eyebrow="FAQ" title={<>{treatment.name},<br /><b>자주 묻는 질문</b></>} description="답변이 있는 질문만 노출합니다." />
          <div id="faq-title"><VisibleFaqs faqs={treatment.faq} /></div>
        </section>
      </TreatmentReveal> : null}

      {(relatedColumn || treatment.relatedConcerns.length) ? <section className={styles.relatedSection}>
        <div className={styles.relatedInner}>
          {relatedColumn ? <Link className={styles.relatedColumn} href={`/column/${relatedColumn.slug}`}><span className={styles.relatedImage}><Image src="/uploads/glory-column-editorial-campaign-01.png" alt="글로리의원 원장 칼럼 대표 이미지" fill sizes="(max-width: 760px) 100vw, 280px" /></span><span><small>RELATED COLUMN</small><b>{relatedColumn.title}</b><i>칼럼 읽기 →</i></span></Link> : null}
          {treatment.relatedConcerns.length ? <div className={styles.relatedConcerns}><small>RELATED CONCERN</small><div>{treatment.relatedConcerns.map((item) => <Link href={item.href} key={item.label}>{item.label} →</Link>)}</div></div> : null}
        </div>
      </section> : null}

      <section className={styles.consultBand}><div><p>상담부터 시술까지,<br /><b>대표원장이 직접 진행합니다</b></p><div><a href={kakaoUrl} target="_blank" rel="noreferrer">카카오톡 상담</a><a href={telHref}>{phone}</a></div></div></section>

      <footer className={styles.footer}><div className={styles.footerInner}><div><b>G 글로리의원</b><p>{address} · {treatment.doctor.title} {treatment.doctor.name} · {phone}</p><p>{hours}</p>{businessNumber ? <p>사업자등록번호 {businessNumber}</p> : null}<p>{footerNotice}</p></div><FooterPolicyLinks content={content} /></div></footer>
    </main>
  );
}
