import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnSearch, type SearchColumn } from "@/components/ColumnSearch";
import { FaqList } from "@/components/FaqList";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { ImageSlot } from "@/components/ImageSlot";
import { getColumns, mainCardSlugs, mainSearchSlugs } from "@/content/columns";
import { clinic, columnMainContent, doctor } from "@/content/site";
import { categories, getCategory, getTreatment, mainTreatmentOrder } from "@/content/treatments";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "원장 칼럼 | 언주역 글로리의원",
  description: "원장 칼럼 | 언주역 글로리의원",
};

export default function ColumnMainPage() {
  const searchColumns: SearchColumn[] = getColumns(mainSearchSlugs).map((column) => ({
    slug: column.slug,
    category: getCategory(column.categorySlug)?.name ?? "",
    title: column.title,
    answer: column.summary,
    keywords: column.keywords,
  }));
  const cards = getColumns(mainCardSlugs);
  const treatmentCards = mainTreatmentOrder.flatMap((slug) => {
    const treatment = getTreatment(slug);
    return treatment ? [treatment] : [];
  });
  const mainFaqs = columnMainContent.mainFaqs.map((q) => ({ q, a: "[본문]" }));

  return (
    <main className="pageFrame">
      <section className={styles.hero}>
        <ImageSlot
          className={styles.heroImage}
          label={columnMainContent.hero.image}
          alt="글로리의원 대표원장 상담 또는 시술 장면"
          variant="dark"
          align="end"
        />
        <div className={styles.heroShade} />
        <ColumnHeader variant="overlay" />
        <div className={styles.heroContent}>
          <h1><strong>{columnMainContent.hero.title}</strong> <span>{columnMainContent.hero.titleSub}</span></h1>
          <p>{columnMainContent.hero.description}</p>
          <ColumnSearch columns={searchColumns} />
        </div>
      </section>

      <section className={styles.doctorSection}>
        <div className={`${styles.outlineTitle} outlineWord`} aria-hidden="true">COLUMN</div>
        <div className={styles.doctorBackdrop} />
        <div className={styles.doctorInner}>
          <ImageSlot className={styles.doctorPhoto} label="[사진] 대표원장 프로필 (시술 중 또는 상담 장면)" alt="대표원장 이호 프로필" />
          <div className={styles.doctorCopy}>
            <h2>{columnMainContent.doctor.title}</h2>
            <p>{columnMainContent.doctor.description}</p>
            <div className={styles.doctorTags}><span>[전문 분야]</span><span>[학회·자격]</span><span>[주요 경력]</span></div>
            <div className={styles.doctorLinks}>
              <Link href="/">의료진 소개 자세히 →</Link>
              <span>{doctor.title} <b>[서명]</b></span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.categorySection}>
        <h2>{columnMainContent.categoryTitle}</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <Link href={`/column?category=${category.slug}`} key={category.slug}>
              <span>{category.nameEn}</span><b>{category.name}</b><small>칼럼 [N]편</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.latestSection}>
        <div className={styles.sectionHeading}><h2>최신 칼럼</h2><Link href="/column">전체 칼럼 보기 →</Link></div>
        <div className={styles.latestGrid}>
          {cards.map((column) => (
            <Link href={`/column/${column.slug}`} className={styles.columnCard} key={column.slug}>
              <ImageSlot className={styles.cardPhoto} label="[원장님 사진]" alt={`${column.title} 대표 사진`} />
              <span>{getCategory(column.categorySlug)?.name}</span>
              <b>{column.title}</b>
              <p>{column.summary}</p>
              <small>{column.author} · [발행일]</small>
            </Link>
          ))}
        </div>
        <div className={styles.pagination}><b>1</b><span>2</span><span>3</span><span>다음 →</span></div>
      </section>

      <section className={styles.faqBand}>
        <div>
          <h2>{columnMainContent.faqTitle}</h2>
          <p>{columnMainContent.faqDescription}</p>
        </div>
        <FaqList items={mainFaqs} />
      </section>

      <section className={styles.treatmentsSection}>
        <h2>시술별로 읽어보기</h2>
        <div className={styles.treatmentGrid}>
          {treatmentCards.map((treatment) => (
            <div key={treatment.slug}>
              <b>{treatment.name}</b>
              <span>한 줄 설명 · 이런 분께</span>
              <small>관련 칼럼 [N] · 시술 안내 →</small>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.principlesSection}>
        <ImageSlot className={styles.loungePhoto} label="[사진] 호텔식 라운지·상담실" alt="글로리의원 라운지와 상담실" />
        <div>
          <h2>글로리의원은 이렇게 진료합니다</h2>
          <ol>
            {columnMainContent.principles.map((principle) => (
              <li key={principle.no}><b>{principle.no} {principle.title}</b><span>{principle.desc}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.infoSection} id="location">
        <ImageSlot className={styles.map} label={clinic.mapLabel} alt="글로리의원 위치 지도" variant="light" />
        <div>
          <h2>오시는 길</h2>
          <p>{clinic.address}</p>
          <p>진료 시간 [확인 필요] · 발레 주차</p>
          <a className={styles.phone} href="tel:0269587525">{clinic.phone}</a>
          <div className={styles.infoButtons}><ButtonLink href="#" variant="taupe">예약·상담</ButtonLink><ButtonLink href="#" variant="outline">카카오톡 상담</ButtonLink></div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><b>G 글로리의원</b><p>본 칼럼은 의료법을 준수하여 작성되었으며, 시술 결과는 개인에 따라 다를 수 있습니다.</p><p>[사업자 정보] · 대표원장 이호</p></div>
        <div><p>홈페이지 · 블로그 · 인스타그램 · 유튜브</p><p>RSS · 사이트맵</p></div>
      </footer>

      <FloatingQuickMenu compact />
    </main>
  );
}
