import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ClinicOpenStatus } from "@/components/ClinicOpenStatus";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnSearch, type SearchColumn } from "@/components/ColumnSearch";
import { DevEditorMount } from "@/components/DevEditorMount";
import { EditableRichText } from "@/components/EditableRichText";
import { FaqList } from "@/components/FaqList";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { ImageSlot } from "@/components/ImageSlot";
import { KakaoMap } from "@/components/KakaoMap";
import { JsonLd } from "@/components/JsonLd";
import { DoctorReveal } from "@/components/motion/DoctorReveal";
import { MotionGroup } from "@/components/motion/MotionGroup";
import { OutlineWord } from "@/components/motion/OutlineWord";
import { SignatureMotion } from "@/components/motion/SignatureMotion";
import { containsPlaceholder, getColumns, getVisibleColumns, mainCardSlugs, mainSearchSlugs } from "@/content/columns";
import { getImage, getText, textEditProps } from "@/content/site-content-types";
import { columnExcerpts, columnTreatmentSearchNames } from "@/content/site";
import { categories, getCategory, getTreatment, mainTreatmentOrder } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, collectionNodes, formatDateKo, graph } from "@/lib/seo";
import { getClinicAddress, getDisplayedHours } from "@/lib/site-info";
import { TREATMENT_PAGES_READY } from "@/lib/config";
import { extractFirstNumber } from "@/lib/motion";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, { title: getText(content, "seo.column.title"), description: getText(content, "seo.column.description"), pathname: "/column" });
}

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
    if (!treatment || containsPlaceholder(treatment)) return [];
    return [{ ...treatment, displayName: treatment.categorySlug === "filler" ? "스페셜필러" : treatment.name }];
  });
  const mainFaqs = getVisibleColumns().flatMap((column) => column.faqs.map((faq, index) => ({ ...faq, id: `faq-${column.slug}-${index + 1}` }))).slice(0, 5);
  const principles = [0, 1, 2].map((index) => ({
    no: String(index + 1).padStart(2, "0"),
    titleId: `column.principles.${index}.title`,
    descriptionId: `column.principles.${index}.description`,
  }));
  const locationLat = getText(content, "home.location.lat");
  const locationLng = getText(content, "home.location.lng");
  const collectionColumns = getVisibleColumns();
  const faqIndex = collectionColumns.flatMap((column) => column.faqs.map((faq, index) => ({ q: faq.q, keywords: column.keywords, slug: column.slug, id: `faq-${index + 1}` })));
  const pageGraph = graph(content, collectionNodes("/column", getText(content, "seo.column.title"), getText(content, "seo.column.description"), collectionColumns));

  return (
    <main className="pageFrame">
      <section className={styles.hero} data-scroll-world-scene>
        <ImageSlot className={styles.heroImage} label="" alt="" variant="dark" align="end" editId="column.hero.background" image={getImage(content, "column.hero.background")} scrollWorldLayer="depth" />
        <div className={styles.heroShade} />
        <ColumnHeader content={content} variant="overlay" page="main" />
        <div className={styles.heroContent} data-scroll-world-layer="copy">
          <h1><EditableRichText id="column.hero.title" value={getText(content, "column.hero.title")} /></h1>
          <p {...textEditProps("column.hero.description")}>{getText(content, "column.hero.description")}</p>
          <ColumnSearch columns={searchColumns} content={content} faqIndex={faqIndex} treatments={columnTreatmentSearchNames} />
        </div>
      </section>

      <DoctorReveal className={styles.doctorSection} scrollWorldScene>
        <OutlineWord className={styles.outlineTitle} text="COLUMN" fill="#fff" scrollWorldLayer="counter" />
        <div className={styles.doctorBackdrop} data-scroll-world-layer="counter" />
        <div className={styles.doctorInner}>
          <ImageSlot className={styles.doctorPhoto} label="" alt="" editId="column.doctor.photo" image={getImage(content, "column.doctor.photo")} motionRole="doctor-photo" scrollWorldLayer="depth" />
          <div className={styles.doctorCopy} data-scroll-world-layer="copy">
            <h2 {...textEditProps("column.doctor.title")}>{getText(content, "column.doctor.title")}</h2>
            <p data-motion-count={extractFirstNumber(getText(content, "column.doctor.description"))} {...textEditProps("column.doctor.description")}>{getText(content, "column.doctor.description")}</p>
            <div className={styles.doctorTags}>{[0, 1, 2].map((index) => { const id = `column.doctor.tag.${index}`; return <span data-motion-career key={id} {...textEditProps(id)}>{getText(content, id)}</span>; })}</div>
            <div className={styles.doctorLinks}>
              <Link href="/doctor/lee-ho" {...textEditProps("column.doctor.more")}>{getText(content, "column.doctor.more")}</Link>
              <span className={styles.doctorSignature}><span {...textEditProps("column.doctor.titleLabel")}>{getText(content, "column.doctor.titleLabel")}</span><SignatureMotion className={styles.doctorSignatureImage} editId="column.doctor.signatureImage" image={getImage(content, "column.doctor.signatureImage")} /></span>
            </div>
          </div>
        </div>
      </DoctorReveal>

      <section className={styles.categorySection} data-scroll-world-scene data-scroll-world-strength="subtle">
        <h2 data-scroll-world-layer="copy" {...textEditProps("column.category.title")}>{getText(content, "column.category.title")}</h2>
        <div className={styles.categoryGrid} data-scroll-world-layer="depth">
          {categories.map((category) => (
            <Link href={`/column/category/${category.slug}`} key={category.slug}>
              <span>{category.nameEn}</span><b>{category.name}</b><small>{collectionColumns.filter((column) => column.categorySlug === category.slug).length ? `칼럼 ${collectionColumns.filter((column) => column.categorySlug === category.slug).length}편` : getText(content, "column.category.count")}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.latestSection} data-scroll-world-scene data-scroll-world-strength="subtle">
        <div className={styles.sectionHeading} data-scroll-world-layer="copy"><h2 {...textEditProps("column.latest.title")}>{getText(content, "column.latest.title")}</h2><Link href="/column/all" {...textEditProps("column.latest.all")}>{getText(content, "column.latest.all")}</Link></div>
        <MotionGroup className={styles.latestGrid} scrollWorldLayer="depth">
          {cards.map((column) => (
            <article className={styles.columnCard} data-motion-item key={column.slug}>
              <Link href={`/column/${column.slug}`} className={styles.columnCardLink}>
                <ImageSlot className={styles.cardPhoto} label="대표원장 칼럼 사진" alt={`${column.title} 대표 이미지`} />
                <span>{getCategory(column.categorySlug)?.name}</span>
                <b>{column.title}</b>
                <p>{column.summary}</p>
              </Link>
              <small><Link href="/doctor/lee-ho">{column.author}</Link>{column.publishedAt ? <> · <time dateTime={column.publishedAt}>{formatDateKo(column.publishedAt)}</time></> : null}</small>
            </article>
          ))}
        </MotionGroup>
        <div className={styles.pagination}><b>1</b><span>2</span><span>3</span><span {...textEditProps("column.latest.pageNext")}>{getText(content, "column.latest.pageNext")}</span></div>
      </section>

      <section className={styles.faqBand} data-scroll-world-scene data-scroll-world-strength="subtle">
        <div data-scroll-world-layer="copy">
          <h2 {...textEditProps("column.faq.title")}>{getText(content, "column.faq.title")}</h2>
          <p {...textEditProps("column.faq.description")}>{getText(content, "column.faq.description")}</p>
        </div>
        <FaqList items={mainFaqs} scrollWorldLayer="depth" />
      </section>

      <section className={styles.treatmentsSection} data-scroll-world-scene data-scroll-world-strength="subtle">
        <h2 data-scroll-world-layer="copy" {...textEditProps("column.treatments.title")}>{getText(content, "column.treatments.title")}</h2>
        <div className={styles.treatmentGrid} data-scroll-world-layer="depth">
          {treatmentCards.map((treatment) => (
            TREATMENT_PAGES_READY ? <Link href={treatment.detailPath} key={treatment.slug}>
              <b>{treatment.displayName}</b><span {...textEditProps("column.treatments.description")}>{getText(content, "column.treatments.description")}</span><small {...textEditProps("column.treatments.links")}>{getText(content, "column.treatments.links")}</small>
            </Link> : <div key={treatment.slug} role="link" aria-disabled="true">
              <b>{treatment.displayName}</b><span {...textEditProps("column.treatments.description")}>{getText(content, "column.treatments.description")}</span><small>시술 안내 준비 중</small>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.principlesSection} data-scroll-world-scene data-scroll-world-strength="subtle">
        <ImageSlot className={styles.loungePhoto} label="" alt="" editId="column.principles.photo" image={getImage(content, "column.principles.photo")} scrollWorldLayer="depth" />
        <div data-scroll-world-layer="copy">
          <h2 {...textEditProps("column.principles.title")}>{getText(content, "column.principles.title")}</h2>
          <ol>{principles.map((principle) => <li key={principle.no}><b>{principle.no} <span className={styles.principleTitle} {...textEditProps(principle.titleId)}>{getText(content, principle.titleId)}</span></b><span {...textEditProps(principle.descriptionId)}>{getText(content, principle.descriptionId)}</span></li>)}</ol>
        </div>
      </section>

      <section className={styles.infoSection} id="location" data-scroll-world-scene data-scroll-world-strength="subtle">
        <KakaoMap className={styles.map} apiKey={process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? ""} address={getText(content, "clinic.address.street")} lat={locationLat} lng={locationLng} fallbackEditId="column.location.map" fallbackImage={getImage(content, "column.location.map")} scrollWorldLayer="depth" />
        <div data-scroll-world-layer="copy">
          <h2 {...textEditProps("column.location.title")}>{getText(content, "column.location.title")}</h2>
          <p>{getClinicAddress(content)}</p>
          <p>{getDisplayedHours(content)} <ClinicOpenStatus content={content} /></p>
          <a className={styles.phone} href="tel:0269587525" {...textEditProps("common.clinic.phone")}>{getText(content, "common.clinic.phone")}</a>
          <div className={styles.infoButtons}><ButtonLink href="#" variant="taupe"><span {...textEditProps("column.location.reserve")}>{getText(content, "column.location.reserve")}</span></ButtonLink><ButtonLink href="#" variant="outline"><span {...textEditProps("column.location.kakao")}>{getText(content, "column.location.kakao")}</span></ButtonLink></div>
        </div>
      </section>

      <footer className={styles.footer} data-scroll-world-scene data-scroll-world-strength="soft">
        <div data-scroll-world-layer="copy"><b {...textEditProps("column.footer.brand")}>{getText(content, "column.footer.brand")}</b><p {...textEditProps("column.footer.notice")}>{getText(content, "column.footer.notice")}</p><p {...textEditProps("column.footer.business")}>{getText(content, "column.footer.business")}</p></div>
        <div data-scroll-world-layer="counter"><p {...textEditProps("column.footer.links")}>{getText(content, "column.footer.links")}</p><p {...textEditProps("column.footer.sitemap")}>{getText(content, "column.footer.sitemap")}</p></div>
      </footer>

      <FloatingQuickMenu content={content} compact />
      <DevEditorMount page="column" content={content} />
      <JsonLd value={pageGraph} />
    </main>
  );
}
