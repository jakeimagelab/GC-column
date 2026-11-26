import Link from "next/link";
import type { Treatment } from "@/content/types";
import { FooterPolicyLinks } from "@/components/FooterPolicyLinks";
import { ImageSlot } from "@/components/ImageSlot";
import { getImage, getText, type SiteContent } from "@/content/site-content-types";
import { getDisplayedHours } from "@/lib/site-info";
import { TreatmentHeader } from "./TreatmentHeader";
import styles from "./TreatmentPreviewPage.module.css";

export function TreatmentPreviewPage({ treatment, categoryName, content }: { treatment: Treatment; categoryName: string; content: SiteContent }) {
  const phone = getText(content, "common.clinic.phone");
  const address = getText(content, "common.clinic.address");
  const thumbnail = getImage(content, `treatments.${treatment.slug}.thumbnail`);
  const safeThumbnail = { ...thumbnail, src: thumbnail.src?.startsWith("/uploads/") ? thumbnail.src : null };

  return (
    <main className={styles.page}>
      <TreatmentHeader content={content} />
      <nav className={styles.breadcrumb} aria-label="현재 위치">
        <Link href="/">홈</Link><span>›</span><span>{categoryName}</span><span>›</span><span aria-current="page">{treatment.name}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <ImageSlot
            className={styles.image}
            label={`${treatment.name} 이미지`}
            alt={`${treatment.name} 시술 이미지`}
            editId={`treatments.${treatment.slug}.thumbnail`}
            image={safeThumbnail}
            sizes="(max-width: 860px) 100vw, 56vw"
          />
          <div className={styles.copy}>
            <p>{categoryName}</p>
            <h1>{treatment.name}</h1>
            <strong>{treatment.desc}</strong>
            <span>상세 시술 안내는 원장 검수 후 순차 공개됩니다.</span>
            <div className={styles.actions}>
              <Link href="/consultation">내원 전 가이드</Link>
              <Link href="tel:0269587525">{phone}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.notice}>
        <small>GLORY CLINIC · TREATMENT GUIDE</small>
        <h2>시술 이름보다 현재의 고민을 먼저 살핍니다.</h2>
        <p>대표원장이 직접 상담하고, 피부 상태에 맞는 선택 기준을 안내합니다.</p>
      </section>

      <footer className={styles.footer}>
        <div><b>GLORY</b><p>{address}</p><p>{getDisplayedHours(content)}</p></div>
        <FooterPolicyLinks content={content} />
      </footer>
    </main>
  );
}
