import type { Metadata } from "next";
import Link from "next/link";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { JsonLd } from "@/components/JsonLd";
import { getPublishedColumns } from "@/content/columns";
import { SITE_URL } from "@/content/site";
import { readSiteContent } from "@/lib/contentStore";
import { graph } from "@/lib/seo";
import styles from "./seo-pages.module.css";

export const metadata: Metadata = { title: "페이지를 찾을 수 없습니다 | 글로리의원", robots: { index: false, follow: false } };

export default async function NotFound() {
  const content = await readSiteContent();
  const popular = getPublishedColumns().slice(0, 3);
  const pageGraph = graph(content, [{ "@type": "WebPage", "@id": `${SITE_URL}/404#webpage`, name: "페이지를 찾을 수 없습니다", url: `${SITE_URL}/404`, inLanguage: "ko-KR" }]);
  return (
    <main className="pageFrame">
      <ColumnHeader content={content} />
      <JsonLd value={pageGraph} />
      <section className={styles.notFound}>
        <span className={styles.eyebrow}>404</span><h1>페이지를 찾을 수 없습니다</h1><p>주소를 다시 확인하거나 원장 칼럼에서 궁금한 내용을 검색해 주세요.</p>
        <form className={styles.search} action="/column"><label className="srOnly" htmlFor="not-found-search">칼럼 검색</label><input id="not-found-search" type="search" name="q" placeholder="예: 세르프, 써마지, 리프팅" /><button type="submit">검색</button></form>
        <div className={styles.popular}>{popular.map((column) => <Link href={`/column/${column.slug}`} key={column.slug}>{column.title}</Link>)}</div>
        <Link href="/">홈으로 돌아가기 →</Link>
      </section>
      <ColumnFooter content={content} />
    </main>
  );
}
