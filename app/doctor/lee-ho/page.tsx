import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnList } from "@/components/ColumnList";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { ImageSlot } from "@/components/ImageSlot";
import { JsonLd } from "@/components/JsonLd";
import { getVisibleColumns } from "@/content/columns";
import { getImage, getText } from "@/content/site-content-types";
import { SITE_URL } from "@/content/site";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, graph } from "@/lib/seo";
import { getClinicAddress, splitLines } from "@/lib/site-info";
import styles from "@/app/seo-pages.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, { title: getText(content, "seo.doctor.title"), description: getText(content, "seo.doctor.description"), pathname: "/doctor/lee-ho" });
}

export default async function DoctorProfilePage() {
  const content = await readSiteContent();
  const phone = getText(content, "common.clinic.phone");
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;
  const columns = getVisibleColumns().filter((column) => column.author.includes(getText(content, "doctor.name")));
  const careers = splitLines(getText(content, "doctor.careers"));
  const education = splitLines(getText(content, "doctor.education"));
  const associations = splitLines(getText(content, "doctor.associations"));
  const licenses = splitLines(getText(content, "doctor.licenses"));
  const specialties = splitLines(getText(content, "doctor.specialties"));
  const pageGraph = graph(content, [{ "@type": "ProfilePage", "@id": `${SITE_URL}/doctor/lee-ho#profile`, name: getText(content, "seo.doctor.title"), description: getText(content, "seo.doctor.description"), url: `${SITE_URL}/doctor/lee-ho`, inLanguage: "ko-KR", mainEntity: { "@id": `${SITE_URL}/doctor/lee-ho#physician` }, isPartOf: { "@id": `${SITE_URL}/#website` } }]);

  return (
    <main className="pageFrame">
      <ColumnHeader content={content} />
      <JsonLd value={pageGraph} />
      <div className={styles.content}>
        <section className={styles.profile}>
          <ImageSlot className={styles.doctorPhoto} label="대표원장 이호 프로필 사진" alt="글로리의원 대표원장 이호" image={getImage(content, "home.doctor.photo")} sizes="(max-width: 820px) 100vw, 440px" />
          <div className={styles.profileCopy}>
            <span className={styles.eyebrow}>ABOUT THE DIRECTOR</span>
            <h1><small>{getText(content, "doctor.jobTitle")}</small>{getText(content, "doctor.name")}</h1>
            <p>{getText(content, "doctor.philosophy")}</p>
            <div className={styles.infoGrid}>
              <div><h2>주요 경력</h2><ul>{careers.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h2>학력</h2><ul>{education.map((item) => <li key={item}>{item}</li>)}</ul></div>
              {associations.length ? <div><h2>학회</h2><ul>{associations.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
              {licenses.length ? <div><h2>자격·면허</h2><ul>{licenses.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
            </div>
            <div><h2>전문 분야</h2><div className={styles.tags}>{specialties.map((item) => <span key={item}>{item}</span>)}</div></div>
          </div>
        </section>

        <section><span className={styles.eyebrow}>DOCTOR&apos;S COLUMN</span><h2>원장이 쓴 칼럼</h2><ColumnList columns={columns} /></section>

        <section className={styles.clinic}>
          <div><h2>글로리의원 진료 안내</h2><p>{getClinicAddress(content)}</p><p>{phone}</p></div>
          <div className={styles.buttons}><ButtonLink href={phoneHref} variant="taupe">전화 예약</ButtonLink><ButtonLink href="/#location" variant="lightOutline">오시는 길</ButtonLink></div>
        </section>
      </div>
      <ColumnFooter content={content} />
      <FloatingQuickMenu content={content} compact />
    </main>
  );
}
