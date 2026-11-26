import type { Metadata } from "next";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ConsultationGuide } from "@/components/ConsultationGuide";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { getText } from "@/content/site-content-types";
import { readConsultationGuide } from "@/lib/consultationStore";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, {
    title: getText(content, "consultation.seo.title"),
    description: getText(content, "consultation.seo.description"),
    pathname: "/consultation",
    noIndex: true,
  });
}

export default async function ConsultationPage() {
  const [content, guide] = await Promise.all([readSiteContent(), readConsultationGuide()]);

  const publicTreatments = guide.status === "published"
    ? guide.treatments.filter((treatment) => Boolean(treatment.doctorApprovedAt))
    : [];

  return (
    <main className="pageFrame">
      <ColumnHeader content={content} page="detail" />
      <section className={styles.hero}>
        <span>PRE-VISIT GUIDE</span>
        <h1>{getText(content, "consultation.hero.title")}</h1>
        <p>{getText(content, "consultation.hero.description")}</p>
        <p>정보 제공용이며 입력 내용은 저장하지 않습니다.</p>
      </section>
      <ConsultationGuide content={content} treatments={publicTreatments} />
      <ColumnFooter content={content} />
      <FloatingQuickMenu content={content} compact />
    </main>
  );
}
