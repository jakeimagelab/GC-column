import Link from "next/link";
import type { Column } from "@/content/types";
import { getCategory } from "@/content/treatments";
import { formatDateKo } from "@/lib/seo";
import { ImageSlot } from "./ImageSlot";
import styles from "./ColumnList.module.css";

export function ColumnList({ columns }: { columns: Column[] }) {
  if (!columns.length) return <p className={styles.empty}>공개된 칼럼을 준비하고 있습니다.</p>;
  return (
    <div className={styles.grid}>
      {columns.map((column) => (
        <article className={styles.card} key={column.slug}>
          {column.status === "draft" ? <span className={styles.draft}>비공개 초안</span> : null}
          <Link href={`/column/${column.slug}`} className={styles.imageLink}><ImageSlot className={styles.image} label="대표원장 칼럼 이미지" alt={`${column.title} 대표 이미지`} height={190} /></Link>
          <Link className={styles.category} href={`/column/category/${column.categorySlug}`}>{getCategory(column.categorySlug)?.name}</Link>
          <h2><Link href={`/column/${column.slug}`}>{column.title}</Link></h2>
          <p>{column.summary}</p>
          <small><Link href="/doctor/lee-ho">{column.author}</Link>{column.publishedAt ? <> · <time dateTime={column.publishedAt}>{formatDateKo(column.publishedAt)}</time></> : null}</small>
        </article>
      ))}
    </div>
  );
}
