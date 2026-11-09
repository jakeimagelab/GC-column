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
import styles from "@/app/seo-pages.module.css";

const PER_PAGE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  return buildMetadata(content, { title: getText(content, "seo.all.title"), description: getText(content, "seo.all.description"), pathname: "/column/all" });
}

export default async function AllColumnsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const content = await readSiteContent();
  const allColumns = getVisibleColumns();
  const requestedPage = Number((await searchParams).page ?? "1");
  const totalPages = Math.max(1, Math.ceil(allColumns.length / PER_PAGE));
  const currentPage = Number.isInteger(requestedPage) ? Math.min(totalPages, Math.max(1, requestedPage)) : 1;
  const columns = allColumns.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const pageGraph = graph(content, collectionNodes("/column/all", getText(content, "seo.all.title"), getText(content, "seo.all.description"), allColumns));

  return (
    <main className="pageFrame">
      <ColumnHeader content={content} />
      <JsonLd value={pageGraph} />
      <section className={styles.hero}><span className={styles.eyebrow}>ALL COLUMNS</span><h1>원장 칼럼 전체 보기</h1><p>{getText(content, "seo.all.description")}</p></section>
      <div className={styles.content}>
        <section><ColumnList columns={columns} />{totalPages > 1 ? <nav className={styles.pagination} aria-label="칼럼 페이지">{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => page === currentPage ? <span aria-current="page" key={page}>{page}</span> : <Link href={`/column/all?page=${page}`} key={page}>{page}</Link>)}</nav> : null}</section>
      </div>
      <ColumnFooter content={content} />
      <FloatingQuickMenu content={content} compact />
    </main>
  );
}
