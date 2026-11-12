import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ClinicOpenStatus } from "@/components/ClinicOpenStatus";
import { DevEditorMount } from "@/components/DevEditorMount";
import { EditableRichText } from "@/components/EditableRichText";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import { FacilityGallery } from "@/components/FacilityGallery";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { HomeQuestionSearch, type HomeSearchColumn } from "@/components/HomeQuestionSearch";
import { HomeHero } from "@/components/HomeHero";
import { ImageSlot } from "@/components/ImageSlot";
import { KakaoMap } from "@/components/KakaoMap";
import { JsonLd } from "@/components/JsonLd";
import { DoctorReveal } from "@/components/motion/DoctorReveal";
import { MotionGroup } from "@/components/motion/MotionGroup";
import { OutlineWord } from "@/components/motion/OutlineWord";
import { SignatureMotion } from "@/components/motion/SignatureMotion";
import { getColumns, homeLatestSlugs, homeSearchSlugs } from "@/content/columns";
import { getEquipmentItems, getHeroSlides, getImage, getText, textEditProps } from "@/content/site-content-types";
import { columnExcerpts, SITE_URL } from "@/content/site";
import { getCategory } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, formatDateKo, graph } from "@/lib/seo";
import { getClinicAddress, getDisplayedHours, getMapUrls } from "@/lib/site-info";
import { extractFirstNumber } from "@/lib/motion";
import { nanumPenScript } from "./fonts";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, { title: getText(content, "seo.home.title"), description: getText(content, "seo.home.description"), pathname: "/" });
}

export default async function HomePage() {
  const content = await readSiteContent();
  const searchColumns: HomeSearchColumn[] = getColumns(homeSearchSlugs).map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: columnExcerpts.home[column.slug] ?? column.summary,
    keywords: column.keywords,
    faqs: column.faqs.map((faq, index) => ({ q: faq.q, id: `faq-${index + 1}` })),
  }));
  const latestColumns = getColumns(homeLatestSlugs);
  const slides = getHeroSlides(content);
  const equipment = getEquipmentItems(content);
  const careers = [0, 1, 2, 3, 4, 5].map((index) => ({ id: `home.doctor.career.${index}`, value: getText(content, `home.doctor.career.${index}`) }));
  const address = getClinicAddress(content);
  const lat = getText(content, "home.location.lat");
  const lng = getText(content, "home.location.lng");
  const { naver: naverUrl, kakao: kakaoUrl, google: googleUrl } = getMapUrls(content);
  const instagramUrl = getText(content, "clinic.sameAs.instagram");
  const youtubeUrl = getText(content, "clinic.sameAs.youtube");
  const pageGraph = graph(content, [{ "@type": "WebPage", "@id": `${SITE_URL}/#webpage`, url: SITE_URL, name: getText(content, "seo.home.title"), description: getText(content, "seo.home.description"), inLanguage: "ko-KR", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#clinic` } }]);

  return (
    <main className="pageFrame">
      <section className={styles.hero} id="home-hero" data-scroll-world-scene>
        <HomeHero slides={slides} />
        <ColumnHeader content={content} variant="overlay" page="home" />
      </section>

      <HomeQuestionSearch columns={searchColumns} content={content} />

      <DoctorReveal className={styles.doctorSection} id="doctor" scrollWorldScene>
        <OutlineWord className={styles.directorOutline} text="DIRECTOR" fill="#fff" scrollWorldLayer="counter" />
        <div className={styles.doctorPhotoWrap} data-scroll-world-layer="depth"><div /><ImageSlot className={styles.doctorPhoto} label="" alt="" align="end" editId="home.doctor.photo" image={getImage(content, "home.doctor.photo")} motionRole="doctor-photo" /></div>
        <div className={styles.doctorCopy} data-scroll-world-layer="copy">
          <span {...textEditProps("home.doctor.eyebrow")}>{getText(content, "home.doctor.eyebrow")}</span><h2><EditableRichText id="home.doctor.title" value={getText(content, "home.doctor.title")} /></h2>
          <div className={styles.years}><EditableRichText id="home.doctor.years" value={getText(content, "home.doctor.years")} countValue={extractFirstNumber(getText(content, "home.doctor.years"))} /></div>
          <div className={styles.careers}>{careers.map((career) => <span key={career.id} data-motion-career {...textEditProps(career.id)}>{career.value}</span>)}</div>
          <div className={styles.doctorButtons}><ButtonLink href="/doctor/lee-ho" variant="dark"><span {...textEditProps("home.doctor.profileAction")}>{getText(content, "home.doctor.profileAction")}</span></ButtonLink><ButtonLink href="/column/all" variant="outline"><span {...textEditProps("home.doctor.columnAction")}>{getText(content, "home.doctor.columnAction")}</span></ButtonLink></div>
        </div>
      </DoctorReveal>

      <section className={styles.vision} id="vision" data-scroll-world-scene>
        <OutlineWord text="VISION" fill="var(--paper)" scrollWorldLayer="counter" trackingMotion />
        <div data-scroll-world-layer="copy"><span {...textEditProps("home.vision.eyebrow")}>{getText(content, "home.vision.eyebrow")}</span><h2><EditableRichText id="home.vision.title" value={getText(content, "home.vision.title")} /></h2><p><EditableRichText id="home.vision.description" value={getText(content, "home.vision.description")} /></p><div className={styles.signature}><span {...textEditProps("home.vision.signatureTitle")}>{getText(content, "home.vision.signatureTitle")}</span><b className={nanumPenScript.className} {...textEditProps("home.vision.signatureName")}>{getText(content, "home.vision.signatureName")}</b><SignatureMotion className={styles.signatureImage} editId="home.vision.signatureImage" image={getImage(content, "home.vision.signatureImage")} /></div></div>
      </section>

      <EquipmentCarousel items={equipment} content={content} />

      <section className={styles.latestSection} id="latest-column" data-scroll-world-scene>
        <OutlineWord className={styles.columnOutline} text="COLUMN" fill="#fff" scrollWorldLayer="counter" />
        <div className={styles.latestHeading} data-scroll-world-layer="copy"><div><span {...textEditProps("home.latest.eyebrow")}>{getText(content, "home.latest.eyebrow")}</span><h2><EditableRichText id="home.latest.title" value={getText(content, "home.latest.title")} /></h2></div><Link href="/column/all" {...textEditProps("home.latest.all")}>{getText(content, "home.latest.all")}</Link></div>
        <MotionGroup className={styles.latestGrid} scrollWorldLayer="depth">{latestColumns.map((column) => <article data-motion-item key={column.slug}><Link className={styles.latestCardLink} href={`/column/${column.slug}`}><ImageSlot className={styles.latestPhoto} label="대표원장 칼럼 사진" alt={`${column.title} 대표 이미지`} align="end" /><span>{getCategory(column.categorySlug)?.name}</span><b>{column.title}</b><p>{columnExcerpts.home[column.slug] ?? column.summary}</p></Link><small><Link href="/doctor/lee-ho">{column.author}</Link>{column.publishedAt ? <> · <time dateTime={column.publishedAt}>{formatDateKo(column.publishedAt)}</time></> : null}</small></article>)}</MotionGroup>
      </section>

      <FacilityGallery content={content} />

      <section className={styles.location} id="location" data-scroll-world-scene>
        <KakaoMap className={styles.map} apiKey={process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? ""} address={getText(content, "clinic.address.street")} lat={lat} lng={lng} fallbackEditId="home.location.map" fallbackImage={getImage(content, "home.location.map")} scrollWorldLayer="depth" />
        <div data-scroll-world-layer="copy"><span {...textEditProps("home.location.eyebrow")}>{getText(content, "home.location.eyebrow")}</span><h2><EditableRichText id="home.location.title" value={getText(content, "home.location.title")} /></h2><dl><div><dt {...textEditProps("home.location.addressLabel")}>{getText(content, "home.location.addressLabel")}</dt><dd>{address}</dd></div><div><dt {...textEditProps("home.location.subwayLabel")}>{getText(content, "home.location.subwayLabel")}</dt><dd {...textEditProps("home.location.subway")}>{getText(content, "home.location.subway")}</dd></div><div><dt {...textEditProps("home.location.hoursLabel")}>{getText(content, "home.location.hoursLabel")}</dt><dd>{getDisplayedHours(content)} <ClinicOpenStatus content={content} /></dd></div><div><dt {...textEditProps("home.location.parkingLabel")}>{getText(content, "home.location.parkingLabel")}</dt><dd {...textEditProps("home.location.parking")}>{getText(content, "home.location.parking")}</dd></div><div><dt {...textEditProps("home.location.phoneLabel")}>{getText(content, "home.location.phoneLabel")}</dt><dd><a href="tel:0269587525" {...textEditProps("common.clinic.phone")}>{getText(content, "common.clinic.phone")}</a></dd></div></dl><div className={styles.mapButtons}><ButtonLink href={naverUrl} editId="home.location.naverUrl" target="_blank" rel="noopener noreferrer"><span {...textEditProps("home.location.naver")}>{getText(content, "home.location.naver")}</span></ButtonLink><ButtonLink href={kakaoUrl} editId="home.location.kakaoUrl" target="_blank" rel="noopener noreferrer" variant="outline"><span {...textEditProps("home.location.kakao")}>{getText(content, "home.location.kakao")}</span></ButtonLink><ButtonLink href={googleUrl} editId="home.location.googleUrl" target="_blank" rel="noopener noreferrer" variant="outline"><span {...textEditProps("home.location.google")}>{getText(content, "home.location.google")}</span></ButtonLink></div></div>
      </section>

      <footer className={styles.footer} data-scroll-world-scene data-scroll-world-strength="soft"><div data-scroll-world-layer="copy"><div className={styles.footerLogo}><span>G</span><b {...textEditProps("common.brand.name")}>{getText(content, "common.brand.name")}</b></div><p><EditableRichText id="home.footer.businessInfo" value={getText(content, "home.footer.businessInfo")} /></p><p {...textEditProps("home.footer.policy")}>{getText(content, "home.footer.policy")}</p><p {...textEditProps("home.footer.notice")}>{getText(content, "home.footer.notice")}</p></div><nav aria-label="푸터 메뉴" data-scroll-world-layer="counter"><div><Link href="/column">원장 칼럼</Link>{instagramUrl ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer">인스타그램</a> : null}{youtubeUrl ? <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">유튜브</a> : null}</div><div><a href="/rss.xml">RSS</a><a href="/sitemap.xml">사이트맵</a></div></nav></footer>

      <JsonLd value={pageGraph} />
      <FloatingQuickMenu content={content} />
      <DevEditorMount page="home" content={content} />
    </main>
  );
}
