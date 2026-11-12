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

  return (
    <main className="pageFrame">
      <ColumnHeader content={content} page="detail" />
      <section className={styles.hero}>
        <span>PRE-VISIT GUIDE</span>
        <h1>{getText(content, "consultation.hero.title")}</h1>
        <p>{getText(content, "consultation.hero.description")}</p>
        <div><b>정보 제공</b><span>진단·처방 아님</span><span>입력 내용 저장 안 함</span></div>
      </section>
      <ConsultationGuide content={content} treatments={guide.treatments} reviewRequired={guide.status !== "published"} />
      <ColumnFooter content={content} />
      <FloatingQuickMenu content={content} compact />
    </main>
  );
}
