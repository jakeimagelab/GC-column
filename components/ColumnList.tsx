"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getConcernItems, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import type { Column } from "@/content/types";
import { getCategory } from "@/content/treatments";
import { getColumnCover } from "@/lib/column-cover";
import { MotionGroup } from "./motion/MotionGroup";
import styles from "./ColumnList.module.css";

const concernKeys = ["sagging", "jawline", "pigment", "pores", "regeneration", "wrinkle"] as const;

function ArticleCard({ column, editorial = false }: { column: Column; editorial?: boolean }) {
  const category = getCategory(column.categorySlug);
  const mobileTitle = column.slug === "xerf-vs-thermage"
    ? ["세르프(XERF)와", "써마지FLX의 차이,", "누구에게 맞을까요?"]
    : [column.title];
  return (
    <article className={editorial ? styles.editorialCard : styles.card} data-motion-item>
      <Link href={`/column/${column.slug}`} className={styles.imageLink}>
        <Image src={getColumnCover(column)} alt={`${column.title} 대표 이미지`} fill sizes={editorial ? "200px" : "(max-width: 720px) 100vw, 33vw"} />
      </Link>
      <div className={styles.cardCopy}>
        <span className={styles.category}>{category?.name ?? "칼럼"} · 비교</span>
        <h3><Link href={`/column/${column.slug}`}><span className={styles.desktopTitle}>{column.title}</span><span className={styles.mobileTitle}>{mobileTitle.map((line) => <span key={line}>{line}</span>)}</span></Link></h3>
        <p><b>핵심 답 —</b> {column.summary}</p>
        <small>READ {String(column.readMinutes).padStart(2, "0")} MIN</small>
      </div>
    </article>
  );
}

type ColumnListProps = {
  columns: Column[];
  content?: SiteContent;
  concernMode?: boolean;
};

export function ColumnList({ columns, content, concernMode = false }: ColumnListProps) {
  const [activeConcern, setActiveConcern] = useState<(typeof concernKeys)[number]>("sagging");
  const activeColumns = columns.filter((column) => column.concerns.includes(activeConcern));

  if (concernMode && content) {
    const concerns = getConcernItems(content);
    return (
      <section className={styles.concernExplorer} aria-labelledby="concern-list-title" data-column-section-motion="concerns">
        <aside className={styles.concernRail}>
          <span className={styles.eyebrow} {...textEditProps("column.concerns.eyebrow")}>{getText(content, "column.concerns.eyebrow")}</span>
          <h2 id="concern-list-title" {...textEditProps("column.concerns.title")}>{getText(content, "column.concerns.title")}</h2>
          <div className={styles.concernButtons} role="tablist" aria-label="피부 고민">
            {concerns.map((concern, index) => {
              const key = concernKeys[index];
              const selected = activeConcern === key;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? styles.activeConcern : ""}
                  onClick={() => setActiveConcern(key)}
                  key={concern.num}
                  data-column-stagger-item
                >
                  <span {...textEditProps(`home.concern.items.${concern.num}.num`)}>{concern.num}</span>
                  <span><b {...textEditProps(`home.concern.items.${concern.num}.name`)}>{concern.name}</b><small {...textEditProps(`home.concern.items.${concern.num}.desc`)}>{concern.desc}</small></span>
                  <i aria-hidden="true">→</i>
                </button>
              );
            })}
          </div>
        </aside>

        <div className={styles.concernResults} role="tabpanel">
          <header>
            <b>{concerns[concernKeys.indexOf(activeConcern)]?.name} 칼럼</b>
            <Link href={concerns[concernKeys.indexOf(activeConcern)]?.link || "/column"}>고민 페이지 →</Link>
          </header>
          {activeColumns.length ? (
            <MotionGroup className={styles.editorialList} scrollWorldLayer="depth">
              {activeColumns.map((column) => <ArticleCard column={column} editorial key={column.slug} />)}
            </MotionGroup>
          ) : (
            <p className={styles.empty} {...textEditProps("column.concerns.empty")}>{getText(content, "column.concerns.empty")}</p>
          )}
        </div>
      </section>
    );
  }

  if (!columns.length) return null;
  return <MotionGroup className={styles.grid} scrollWorldLayer="depth">{columns.map((column) => <ArticleCard column={column} key={column.slug} />)}</MotionGroup>;
}
