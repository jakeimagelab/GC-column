import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnSearch, type SearchColumn } from "@/components/ColumnSearch";
import { DevEditorMount } from "@/components/DevEditorMount";
import { FaqList } from "@/components/FaqList";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { ImageSlot } from "@/components/ImageSlot";
import { getColumns, mainCardSlugs, mainSearchSlugs } from "@/content/columns";
import { getImage, getText, textEditProps } from "@/content/site-content-types";
import { columnExcerpts, columnSearchFaqIndex, columnTreatmentSearchNames } from "@/content/site";
import { categories, getCategory, getTreatment, mainTreatmentOrder } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "원장 칼럼 | 언주역 글로리의원",
  description: "원장 칼럼 | 언주역 글로리의원",
};

export default async function ColumnMainPage() {
  const content = await readSiteContent();
  const searchColumns: SearchColumn[] = getColumns(mainSearchSlugs).map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: columnExcerpts.main[column.slug] ?? column.summary,
    keywords: column.keywords,
  }));
  const cards = getColumns(mainCardSlugs);
  const treatmentCards = mainTreatmentOrder.flatMap((slug) => {
    const treatment = getTreatment(slug);
    if (!treatment) return [];
    return [{ ...treatment, displayName: treatment.categorySlug === "filler" ? "스페셜필러" : treatment.name }];
  });
  const mainFaqs = [0, 1, 2, 3, 4].map((index) => ({
    q: getText(content, `column.faq.question.${index}`),
    a: "[본문]",
    editId: `column.faq.question.${index}`,
  }));
  const principles = [0, 1, 2].map((index) => ({
    no: String(index + 1).padStart(2, "0"),
    titleId: `column.principles.${index}.title`,
    descriptionId: `column.principles.${index}.description`,
  }));

  return (
    <main className="pageFrame">
      <section className={styles.hero}>
        <ImageSlot className={styles.heroImage} label="" alt="" variant="dark" align="end" editId="column.hero.background" image={getImage(content, "column.hero.background")} />
        <div className={styles.heroShade} />
        <ColumnHeader content={content} variant="overlay" page="main" />
        <div className={styles.heroContent}>
          <h1><strong {...textEditProps("column.hero.title")}>{getText(content, "column.hero.title")}</strong> <span {...textEditProps("column.hero.titleSub")}>{getText(content, "column.hero.titleSub")}</span></h1>
          <p {...textEditProps("column.hero.description")}>{getText(content, "column.hero.description")}</p>
          <ColumnSearch columns={searchColumns} content={content} faqIndex={columnSearchFaqIndex} treatments={columnTreatmentSearchNames} />
        </div>
      </section>

      <section className={styles.doctorSection}>
        <div className={`${styles.outlineTitle} outlineWord`} aria-hidden="true">COLUMN</div>
        <div className={styles.doctorBackdrop} />
        <div className={styles.doctorInner}>
          <ImageSlot className={styles.doctorPhoto} label="" alt="" editId="column.doctor.photo" image={getImage(content, "column.doctor.photo")} />
          <div className={styles.doctorCopy}>
            <h2 {...textEditProps("column.doctor.title")}>{getText(content, "column.doctor.title")}</h2>
            <p {...textEditProps("column.doctor.description")}>{getText(content, "column.doctor.description")}</p>
            <div className={styles.doctorTags}>{[0, 1, 2].map((index) => { const id = `column.doctor.tag.${index}`; return <span key={id} {...textEditProps(id)}>{getText(content, id)}</span>; })}</div>
            <div className={styles.doctorLinks}>
              <Link href="/" {...textEditProps("column.doctor.more")}>{getText(content, "column.doctor.more")}</Link>
              <span className={styles.doctorSignature}><span {...textEditProps("column.doctor.titleLabel")}>{getText(content, "column.doctor.titleLabel")}</span><ImageSlot className={styles.doctorSignatureImage} label="" alt="" editId="column.doctor.signatureImage" image={getImage(content, "column.doctor.signatureImage")} /></span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.categorySection}>
        <h2 {...textEditProps("column.category.title")}>{getText(content, "column.category.title")}</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <Link href={`/column?category=${category.slug}`} key={category.slug}>
              <span>{category.nameEn}</span><b>{category.name}</b><small {...textEditProps("column.category.count")}>{getText(content, "column.category.count")}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.latestSection}>
        <div className={styles.sectionHeading}><h2 {...textEditProps("column.latest.title")}>{getText(content, "column.latest.title")}</h2><Link href="/column" {...textEditProps("column.latest.all")}>{getText(content, "column.latest.all")}</Link></div>
        <div className={styles.latestGrid}>
          {cards.map((column) => (
            <Link href={`/column/${column.slug}`} className={styles.columnCard} key={column.slug}>
              <ImageSlot className={styles.cardPhoto} label="[원장님 사진]" alt={`${column.title} 대표 사진`} />
              <span>{getCategory(column.categorySlug)?.name}</span>
              <b>{column.title}</b>
              <p>{column.summary}</p>
              <small {...textEditProps("column.latest.authorDate")}>{getText(content, "column.latest.authorDate")}</small>
            </Link>
          ))}
        </div>
        <div className={styles.pagination}><b>1</b><span>2</span><span>3</span><span {...textEditProps("column.latest.pageNext")}>{getText(content, "column.latest.pageNext")}</span></div>
      </section>

      <section className={styles.faqBand}>
        <div>
          <h2 {...textEditProps("column.faq.title")}>{getText(content, "column.faq.title")}</h2>
          <p {...textEditProps("column.faq.description")}>{getText(content, "column.faq.description")}</p>
        </div>
        <FaqList items={mainFaqs} />
      </section>

      <section className={styles.treatmentsSection}>
        <h2 {...textEditProps("column.treatments.title")}>{getText(content, "column.treatments.title")}</h2>
        <div className={styles.treatmentGrid}>
          {treatmentCards.map((treatment) => (
            <div key={treatment.slug}>
              <b>{treatment.displayName}</b>
              <span {...textEditProps("column.treatments.description")}>{getText(content, "column.treatments.description")}</span>
              <small {...textEditProps("column.treatments.links")}>{getText(content, "column.treatments.links")}</small>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.principlesSection}>
        <ImageSlot className={styles.loungePhoto} label="" alt="" editId="column.principles.photo" image={getImage(content, "column.principles.photo")} />
        <div>
          <h2 {...textEditProps("column.principles.title")}>{getText(content, "column.principles.title")}</h2>
          <ol>{principles.map((principle) => <li key={principle.no}><b>{principle.no} <span className={styles.principleTitle} {...textEditProps(principle.titleId)}>{getText(content, principle.titleId)}</span></b><span {...textEditProps(principle.descriptionId)}>{getText(content, principle.descriptionId)}</span></li>)}</ol>
        </div>
      </section>

      <section className={styles.infoSection} id="location">
        <ImageSlot className={styles.map} label="" alt="" variant="light" editId="column.location.map" image={getImage(content, "column.location.map")} />
        <div>
          <h2 {...textEditProps("column.location.title")}>{getText(content, "column.location.title")}</h2>
          <p {...textEditProps("common.clinic.address")}>{getText(content, "common.clinic.address")}</p>
          <p {...textEditProps("column.location.hours")}>{getText(content, "column.location.hours")}</p>
          <a className={styles.phone} href="tel:0269587525" {...textEditProps("common.clinic.phone")}>{getText(content, "common.clinic.phone")}</a>
          <div className={styles.infoButtons}><ButtonLink href="#" variant="taupe"><span {...textEditProps("column.location.reserve")}>{getText(content, "column.location.reserve")}</span></ButtonLink><ButtonLink href="#" variant="outline"><span {...textEditProps("column.location.kakao")}>{getText(content, "column.location.kakao")}</span></ButtonLink></div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><b {...textEditProps("column.footer.brand")}>{getText(content, "column.footer.brand")}</b><p {...textEditProps("column.footer.notice")}>{getText(content, "column.footer.notice")}</p><p {...textEditProps("column.footer.business")}>{getText(content, "column.footer.business")}</p></div>
        <div><p {...textEditProps("column.footer.links")}>{getText(content, "column.footer.links")}</p><p {...textEditProps("column.footer.sitemap")}>{getText(content, "column.footer.sitemap")}</p></div>
      </footer>

      <FloatingQuickMenu content={content} compact />
      <DevEditorMount page="column" content={content} />
    </main>
  );
}
