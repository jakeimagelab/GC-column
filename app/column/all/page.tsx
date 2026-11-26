import type { Metadata } from "next";
import Link from "next/link";
import { ColumnFooter } from "@/components/ColumnFooter";
import { ColumnHeader } from "@/components/ColumnHeader";
import { ColumnList } from "@/components/ColumnList";
import { FloatingQuickMenu } from "@/components/FloatingQuickMenu";
import { JsonLd } from "@/components/JsonLd";
import { getVisibleColumns } from "@/content/columns";
import { getText } from "@/content/site-content-types";
import { readSiteContent } from "@/lib/contentStore";
import { buildMetadata, collectionNodes, graph } from "@/lib/seo";
import { filterColumns } from "@/lib/column-filters";
import { getTreatment } from "@/content/treatments";
import styles from "@/app/seo-pages.module.css";

const PER_PAGE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, { title: getText(content, "seo.all.title"), description: getText(content, "seo.all.description"), pathname: "/column/all" });
}

export default async function AllColumnsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const content = await readSiteContent();
  const params = await searchParams;
  const read = (key: string) => typeof params[key] === "string" ? params[key].trim() : "";
  const q = read("q");
  const concern = read("concern");
  const treatment = read("treatment");
  const allColumns = filterColumns(getVisibleColumns(), q, concern, treatment);
  const requestedPage = Number(read("page") || "1");
  const conditions = [q, read("label") || concern, getTreatment(treatment)?.name ?? treatment].filter(Boolean);
  const pageHref = (page: number) => `/column/all?${new URLSearchParams({ ...(q && { q }), ...(concern && { concern }), ...(read("label") && { label: read("label") }), ...(treatment && { treatment }), page: String(page) })}`;
  const totalPages = Math.max(1, Math.ceil(allColumns.length / PER_PAGE));
  const currentPage = Number.isInteger(requestedPage) ? Math.min(totalPages, Math.max(1, requestedPage)) : 1;
  const columns = allColumns.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const pageGraph = graph(content, collectionNodes("/column/all", getText(content, "seo.all.title"), getText(content, "seo.all.description"), allColumns));

  return (
    <main className="pageFrame">
      <ColumnHeader content={content} />
      <JsonLd value={pageGraph} />
      <section className={styles.hero} data-scroll-world-scene data-scroll-world-strength="subtle"><span className={styles.eyebrow} data-scroll-world-layer="counter">ALL COLUMNS</span><h1 data-scroll-world-layer="copy">원장 칼럼 전체 보기</h1><p data-scroll-world-layer="copy">{getText(content, "seo.all.description")}</p></section>
      <div className={styles.content}>
        <section>
          <p>{conditions.join(" · ") || "최신 발행순"} · {allColumns.length}건</p>
          {columns.length ? <ColumnList columns={columns} /> : <p>조건에 맞는 칼럼이 없습니다.</p>}
          {conditions.length ? <Link href="/column/all">전체 칼럼 보기 →</Link> : null}
          {totalPages > 1 ? <nav className={styles.pagination} aria-label="칼럼 페이지">{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => page === currentPage ? <span aria-current="page" key={page}>{page}</span> : <Link href={pageHref(page)} key={page}>{page}</Link>)}</nav> : null}
        </section>
      </div>
      <ColumnFooter content={content} />
      <FloatingQuickMenu content={content} compact />
    </main>
  );
}
