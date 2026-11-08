import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import { FacilityGallery } from "@/components/FacilityGallery";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { HomeQuestionSearch, type HomeSearchColumn } from "@/components/HomeQuestionSearch";
import { ImageSlot } from "@/components/ImageSlot";
import { getColumns, homeLatestSlugs, homeSearchSlugs } from "@/content/columns";
import { clinic, doctor, homeContent } from "@/content/site";
import { getCategory, getTreatment, homeEquipmentOrder } from "@/content/treatments";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "글로리의원 | 언주역 글로리의원",
  description: homeContent.hero.description,
};

function Flag({ locale }: { locale: "KR" | "EN" | "CN" }) {
  if (locale === "KR") return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff" /><path d="M6.5 7a3.5 3.5 0 0 1 7 0z" fill="#CD2E3A" /><path d="M6.5 7a3.5 3.5 0 0 0 7 0z" fill="#0047A0" /></svg>;
  if (locale === "EN") return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff" /><rect width="20" height="2" fill="#B22234" /><rect y="4" width="20" height="2" fill="#B22234" /><rect y="8" width="20" height="2" fill="#B22234" /><rect y="12" width="20" height="2" fill="#B22234" /><rect width="9" height="8" fill="#3C3B6E" /></svg>;
  return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#DE2910" /><polygon points="4,2 4.9,4.6 7.6,4.6 5.4,6.2 6.2,8.8 4,7.2 1.8,8.8 2.6,6.2 0.4,4.6 3.1,4.6" fill="#FFDE00" /></svg>;
}

export default function HomePage() {
  const searchColumns: HomeSearchColumn[] = getColumns(homeSearchSlugs).map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: column.summary.split(". ")[0] + (column.summary.includes(". ") ? "." : ""),
    keywords: column.keywords,
  }));
  const latestColumns = getColumns(homeLatestSlugs);
  const equipment = homeEquipmentOrder.flatMap((slug) => {
    const item = getTreatment(slug);
    return item ? [{ slug: item.slug, name: item.name.replace("울쎄라 프라임", "울쎄라피 프라임").replace("티타늄", "소프라노 티타늄"), desc: item.equipmentType ?? item.desc }] : [];
  });

  return (
    <main className="pageFrame">
      <section className={styles.hero}>
        <ImageSlot className={styles.heroMedia} label={homeContent.hero.media} alt="글로리의원 브랜딩 영상" variant="dark" />
        <div className={styles.heroShade} />
        <header className={styles.header}>
          <Link className={styles.logo} href="/"><span>G</span><span><b>글로리의원</b><small>GLORY CLINIC</small></span></Link>
          <nav aria-label="주 메뉴"><Link href="#doctor">병원소개</Link><Link href="/column?category=lifting">리프팅</Link><Link href="/column?category=pigment">색소·모공</Link><Link href="/column?category=injection">주사시술</Link><Link href="/column?category=filler">스페셜필러</Link><Link href="/column"><b>원장 칼럼</b></Link></nav>
          <div className={styles.locales}>{(["KR", "EN", "CN"] as const).map((locale) => <Link href={locale === "KR" ? "/" : locale === "EN" ? "/en" : "/zh"} aria-label={locale === "KR" ? "한국어" : locale === "EN" ? "English" : "中文"} key={locale}><Flag locale={locale} />{locale}</Link>)}</div>
        </header>
        <div className={styles.heroCopy}><span>{homeContent.hero.eyebrow}</span><h1>{homeContent.hero.title}<br /><b>{homeContent.hero.titleStrong}</b></h1><p>{homeContent.hero.description}</p></div>
        <div className={styles.heroPager}><b>01</b><span><i /></span><em>03</em></div>
      </section>

      <HomeQuestionSearch columns={searchColumns} />

      <section className={styles.doctorSection} id="doctor">
        <div className={`${styles.directorOutline} outlineWord`} aria-hidden="true">DIRECTOR</div>
        <div className={styles.doctorPhotoWrap}><div /><ImageSlot className={styles.doctorPhoto} label="[사진] 대표원장 이호 프로필 (재촬영본)" alt="글로리의원 대표원장 이호 프로필 사진" align="end" /></div>
        <div className={styles.doctorCopy}>
          <span>ABOUT THE DIRECTOR</span><h2>{doctor.title} <b>{doctor.name}</b></h2>
          <div className={styles.years}><strong>13</strong><span>년<br />피부 진료 경험</span></div>
          <div className={styles.careers}>{doctor.careers.map((career) => <span key={career}>{career}</span>)}</div>
          <div className={styles.doctorButtons}><ButtonLink href="#" variant="dark">원장 프로필 보기</ButtonLink><ButtonLink href="/column" variant="outline">원장이 쓴 칼럼 [N]편 →</ButtonLink></div>
        </div>
      </section>

      <section className={styles.vision}>
        <div className="outlineWord" aria-hidden="true">VISION</div>
        <div><span>{homeContent.vision.eyebrow}</span><h2>{homeContent.vision.title}<br /><b>{homeContent.vision.titleStrong}</b></h2><p>{homeContent.vision.description}<br />{homeContent.vision.description2}</p><div className={styles.signature}><span>글로리의원 대표원장</span><b>이 호</b><small>[실제 서명 이미지로 교체]</small></div></div>
      </section>

      <EquipmentCarousel items={equipment} eyebrow={homeContent.equipment.eyebrow} title={homeContent.equipment.title} titleStrong={homeContent.equipment.titleStrong} guide={homeContent.equipment.guide} />

      <section className={styles.latestSection}>
        <div className={`${styles.columnOutline} outlineWord`} aria-hidden="true">COLUMN</div>
        <div className={styles.latestHeading}><div><span>{homeContent.latest.eyebrow}</span><h2>{homeContent.latest.title} <b>{homeContent.latest.titleStrong}</b></h2></div><Link href="/column">전체 칼럼 보기 →</Link></div>
        <div className={styles.latestGrid}>{latestColumns.map((column) => <Link href={`/column/${column.slug}`} key={column.slug}><ImageSlot className={styles.latestPhoto} label="[사진] 원장 실제 사진" alt={`${column.title} 원장 사진`} align="end" /><span>{getCategory(column.categorySlug)?.name}</span><b>{column.title}</b><p>{column.summary.split(". ")[0]}{column.summary.includes(". ") ? "." : ""}</p><small>{column.author} · [게시일]</small></Link>)}</div>
      </section>

      <FacilityGallery rooms={homeContent.rooms} />

      <section className={styles.location} id="location">
        <ImageSlot className={styles.map} label={clinic.mapLabel} alt="글로리의원 위치 지도" variant="light" />
        <div><span>LOCATION</span><h2>오시는 <b>길</b></h2><dl><div><dt>주소</dt><dd>{clinic.address}</dd></div><div><dt>지하철</dt><dd>{homeContent.location.subway}</dd></div><div><dt>진료시간</dt><dd>{homeContent.location.hours}</dd></div><div><dt>주차</dt><dd>{homeContent.location.parking}</dd></div><div><dt>전화</dt><dd><a href="tel:0269587525">{clinic.phone}</a></dd></div></dl><div className={styles.mapButtons}><ButtonLink href="#">네이버 지도</ButtonLink><ButtonLink href="#" variant="outline">카카오맵</ButtonLink><ButtonLink href="#" variant="outline">구글 지도</ButtonLink></div></div>
      </section>

      <footer className={styles.footer}><div><div className={styles.footerLogo}><span>G</span><b>글로리의원</b></div><p>{clinic.address} · 대표원장 이호 · {clinic.businessNumber} · {clinic.phone}</p><p>개인정보처리방침 · 비급여 진료비 안내 · 환자의 권리와 의무</p><p>시술 결과는 개인에 따라 다를 수 있으며, 부작용이 발생할 수 있습니다. © 글로리의원</p></div><div><span>원장 칼럼 · 블로그 · 인스타그램 · 유튜브</span><span>사이트맵</span></div></footer>

      <FloatingQuickMenu />
    </main>
  );
}
