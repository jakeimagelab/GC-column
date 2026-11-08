import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { ButtonLink } from "@/components/ButtonLink";
import { DevEditorMount } from "@/components/DevEditorMount";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import { FacilityGallery } from "@/components/FacilityGallery";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { HomeQuestionSearch, type HomeSearchColumn } from "@/components/HomeQuestionSearch";
import { ImageSlot } from "@/components/ImageSlot";
import { getColumns, homeLatestSlugs, homeSearchSlugs } from "@/content/columns";
import { getImage, getText, textEditProps } from "@/content/site-content-types";
import { columnExcerpts } from "@/content/site";
import { getCategory, getTreatment, homeEquipmentOrder } from "@/content/treatments";
import { readSiteContent } from "@/lib/contentStore";
import { nanumPenScript } from "./fonts";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return { title: "글로리의원 | 언주역 글로리의원", description: getText(content, "home.hero.description") };
}

function Flag({ locale }: { locale: "KR" | "EN" | "CN" }) {
  if (locale === "KR") return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff" /><path d="M6.5 7a3.5 3.5 0 0 1 7 0z" fill="#CD2E3A" /><path d="M6.5 7a3.5 3.5 0 0 0 7 0z" fill="#0047A0" /></svg>;
  if (locale === "EN") return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff" /><rect width="20" height="2" fill="#B22234" /><rect y="4" width="20" height="2" fill="#B22234" /><rect y="8" width="20" height="2" fill="#B22234" /><rect y="12" width="20" height="2" fill="#B22234" /><rect width="9" height="8" fill="#3C3B6E" /></svg>;
  return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#DE2910" /><polygon points="4,2 4.9,4.6 7.6,4.6 5.4,6.2 6.2,8.8 4,7.2 1.8,8.8 2.6,6.2 0.4,4.6 3.1,4.6" fill="#FFDE00" /></svg>;
}

export default async function HomePage() {
  const content = await readSiteContent();
  const searchColumns: HomeSearchColumn[] = getColumns(homeSearchSlugs).map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: columnExcerpts.home[column.slug] ?? column.summary,
    keywords: column.keywords,
  }));
  const latestColumns = getColumns(homeLatestSlugs);
  const equipment = homeEquipmentOrder.flatMap((slug) => {
    const item = getTreatment(slug);
    return item ? [{ slug: item.slug, name: item.name.replace("울쎄라 프라임", "울쎄라피 프라임").replace("써마지 FLX", "써마지FLX").replace("티타늄", "소프라노 티타늄"), desc: item.equipmentType ?? item.desc }] : [];
  });
  const careers = [0, 1, 2, 3, 4, 5].map((index) => ({ id: `home.doctor.career.${index}`, value: getText(content, `home.doctor.career.${index}`) }));

  return (
    <main className="pageFrame">
      <section className={styles.hero}>
        <ImageSlot className={styles.heroMedia} label="" alt="" variant="dark" align="end" editId="home.hero.background" image={getImage(content, "home.hero.background")} />
        <div className={styles.heroShade} />
        <header className={styles.header}>
          <Link className={styles.logo} href="/"><BrandMark image={getImage(content, "common.header.logo")} name={getText(content, "common.brand.name")} nameEn={getText(content, "common.brand.nameEn")} /></Link>
          <nav aria-label="주 메뉴"><Link href="#doctor" {...textEditProps("home.header.about")}>{getText(content, "home.header.about")}</Link><Link href="/column?category=lifting">리프팅</Link><Link href="/column?category=pigment">색소·모공</Link><Link href="/column?category=injection">주사시술</Link><Link href="/column?category=filler">스페셜필러</Link><Link href="/column"><b {...textEditProps("home.header.column")}>{getText(content, "home.header.column")}</b></Link></nav>
          <div className={styles.locales}>{(["KR", "EN", "CN"] as const).map((locale) => { const id = `home.header.locale.${locale.toLowerCase()}`; return <Link href={locale === "KR" ? "/" : locale === "EN" ? "/en" : "/zh"} aria-label={locale === "KR" ? "한국어" : locale === "EN" ? "English" : "中文"} key={locale}><Flag locale={locale} /><span {...textEditProps(id)}>{getText(content, id)}</span></Link>; })}</div>
        </header>
        <div className={styles.heroCopy}><span {...textEditProps("home.hero.eyebrow")}>{getText(content, "home.hero.eyebrow")}</span><h1><span {...textEditProps("home.hero.title")}>{getText(content, "home.hero.title")}</span><br /><b {...textEditProps("home.hero.titleStrong")}>{getText(content, "home.hero.titleStrong")}</b></h1><p {...textEditProps("home.hero.description")}>{getText(content, "home.hero.description")}</p></div>
        <div className={styles.heroPager}><b>01</b><span><i /></span><em>03</em></div>
      </section>

      <HomeQuestionSearch columns={searchColumns} content={content} />

      <section className={styles.doctorSection} id="doctor">
        <div className={`${styles.directorOutline} outlineWord`} aria-hidden="true">DIRECTOR</div>
        <div className={styles.doctorPhotoWrap}><div /><ImageSlot className={styles.doctorPhoto} label="" alt="" align="end" editId="home.doctor.photo" image={getImage(content, "home.doctor.photo")} /></div>
        <div className={styles.doctorCopy}>
          <span {...textEditProps("home.doctor.eyebrow")}>{getText(content, "home.doctor.eyebrow")}</span><h2><span {...textEditProps("home.doctor.title")}>{getText(content, "home.doctor.title")}</span> <b {...textEditProps("home.doctor.name")}>{getText(content, "home.doctor.name")}</b></h2>
          <div className={styles.years}><strong {...textEditProps("home.doctor.yearsNumber")}>{getText(content, "home.doctor.yearsNumber")}</strong><span {...textEditProps("home.doctor.yearsLabel")}>{getText(content, "home.doctor.yearsLabel")}</span></div>
          <div className={styles.careers}>{careers.map((career) => <span key={career.id} {...textEditProps(career.id)}>{career.value}</span>)}</div>
          <div className={styles.doctorButtons}><ButtonLink href="#" variant="dark"><span {...textEditProps("home.doctor.profileAction")}>{getText(content, "home.doctor.profileAction")}</span></ButtonLink><ButtonLink href="/column" variant="outline"><span {...textEditProps("home.doctor.columnAction")}>{getText(content, "home.doctor.columnAction")}</span></ButtonLink></div>
        </div>
      </section>

      <section className={styles.vision}>
        <div className="outlineWord" aria-hidden="true">VISION</div>
        <div><span {...textEditProps("home.vision.eyebrow")}>{getText(content, "home.vision.eyebrow")}</span><h2><span {...textEditProps("home.vision.title")}>{getText(content, "home.vision.title")}</span><br /><b {...textEditProps("home.vision.titleStrong")}>{getText(content, "home.vision.titleStrong")}</b></h2><p><span {...textEditProps("home.vision.description")}>{getText(content, "home.vision.description")}</span><br /><span {...textEditProps("home.vision.description2")}>{getText(content, "home.vision.description2")}</span></p><div className={styles.signature}><span {...textEditProps("home.vision.signatureTitle")}>{getText(content, "home.vision.signatureTitle")}</span><b className={nanumPenScript.className} {...textEditProps("home.vision.signatureName")}>{getText(content, "home.vision.signatureName")}</b><ImageSlot className={styles.signatureImage} label="" alt="" editId="home.vision.signatureImage" image={getImage(content, "home.vision.signatureImage")} /></div></div>
      </section>

      <EquipmentCarousel items={equipment} content={content} />

      <section className={styles.latestSection}>
        <div className={`${styles.columnOutline} outlineWord`} aria-hidden="true">COLUMN</div>
        <div className={styles.latestHeading}><div><span {...textEditProps("home.latest.eyebrow")}>{getText(content, "home.latest.eyebrow")}</span><h2><span {...textEditProps("home.latest.title")}>{getText(content, "home.latest.title")}</span> <b {...textEditProps("home.latest.titleStrong")}>{getText(content, "home.latest.titleStrong")}</b></h2></div><Link href="/column" {...textEditProps("home.latest.all")}>{getText(content, "home.latest.all")}</Link></div>
        <div className={styles.latestGrid}>{latestColumns.map((column) => <Link href={`/column/${column.slug}`} key={column.slug}><ImageSlot className={styles.latestPhoto} label="[사진] 원장 실제 사진" alt={`${column.title} 원장 사진`} align="end" /><span>{getCategory(column.categorySlug)?.name}</span><b>{column.title}</b><p>{columnExcerpts.home[column.slug] ?? column.summary}</p><small>{column.author} · [게시일]</small></Link>)}</div>
      </section>

      <FacilityGallery content={content} />

      <section className={styles.location} id="location">
        <ImageSlot className={styles.map} label="" alt="" variant="light" editId="home.location.map" image={getImage(content, "home.location.map")} />
        <div><span {...textEditProps("home.location.eyebrow")}>{getText(content, "home.location.eyebrow")}</span><h2><span {...textEditProps("home.location.title")}>{getText(content, "home.location.title")}</span> <b {...textEditProps("home.location.titleStrong")}>{getText(content, "home.location.titleStrong")}</b></h2><dl><div><dt {...textEditProps("home.location.addressLabel")}>{getText(content, "home.location.addressLabel")}</dt><dd {...textEditProps("common.clinic.address")}>{getText(content, "common.clinic.address")}</dd></div><div><dt {...textEditProps("home.location.subwayLabel")}>{getText(content, "home.location.subwayLabel")}</dt><dd {...textEditProps("home.location.subway")}>{getText(content, "home.location.subway")}</dd></div><div><dt {...textEditProps("home.location.hoursLabel")}>{getText(content, "home.location.hoursLabel")}</dt><dd {...textEditProps("home.location.hours")}>{getText(content, "home.location.hours")}</dd></div><div><dt {...textEditProps("home.location.parkingLabel")}>{getText(content, "home.location.parkingLabel")}</dt><dd {...textEditProps("home.location.parking")}>{getText(content, "home.location.parking")}</dd></div><div><dt {...textEditProps("home.location.phoneLabel")}>{getText(content, "home.location.phoneLabel")}</dt><dd><a href="tel:0269587525" {...textEditProps("common.clinic.phone")}>{getText(content, "common.clinic.phone")}</a></dd></div></dl><div className={styles.mapButtons}><ButtonLink href="#"><span {...textEditProps("home.location.naver")}>{getText(content, "home.location.naver")}</span></ButtonLink><ButtonLink href="#" variant="outline"><span {...textEditProps("home.location.kakao")}>{getText(content, "home.location.kakao")}</span></ButtonLink><ButtonLink href="#" variant="outline"><span {...textEditProps("home.location.google")}>{getText(content, "home.location.google")}</span></ButtonLink></div></div>
      </section>

      <footer className={styles.footer}><div><div className={styles.footerLogo}><span>G</span><b {...textEditProps("common.brand.name")}>{getText(content, "common.brand.name")}</b></div><p><span {...textEditProps("common.clinic.address")}>{getText(content, "common.clinic.address")}</span> · <span {...textEditProps("home.footer.representative")}>{getText(content, "home.footer.representative")}</span> · <span {...textEditProps("common.clinic.businessNumber")}>{getText(content, "common.clinic.businessNumber")}</span> · <span {...textEditProps("common.clinic.phone")}>{getText(content, "common.clinic.phone")}</span></p><p {...textEditProps("home.footer.policy")}>{getText(content, "home.footer.policy")}</p><p {...textEditProps("home.footer.notice")}>{getText(content, "home.footer.notice")}</p></div><div><span {...textEditProps("home.footer.links")}>{getText(content, "home.footer.links")}</span><span {...textEditProps("home.footer.sitemap")}>{getText(content, "home.footer.sitemap")}</span></div></footer>

      <FloatingQuickMenu content={content} />
      <DevEditorMount page="home" content={content} />
    </main>
  );
}
