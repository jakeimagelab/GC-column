"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { columnMainContent } from "@/content/site";
import styles from "./ColumnSearch.module.css";

export type SearchColumn = {
  slug: string;
  category: string;
  title: string;
  answer: string;
  keywords: string[];
};

type ColumnSearchProps = { columns: SearchColumn[] };

export function ColumnSearch({ columns }: ColumnSearchProps) {
  const [query, setQuery] = useState(columnMainContent.hero.initialQuery);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hit = (keywords: string[], title: string) => q.length > 0 && (
      keywords.some((keyword) => keyword.toLowerCase().includes(q) || q.includes(keyword.toLowerCase())) ||
      title.toLowerCase().includes(q)
    );
    const matchedColumns = columns.filter((column) => hit(column.keywords, column.title));
    const faqs = columnMainContent.faqIndex.filter((faq) => hit(faq.keywords, faq.q));
    const matchedTreatments = columnMainContent.treatSearch.filter((treatment) =>
      treatment.toLowerCase().includes(q) ||
      (q.length > 1 && matchedColumns.some((column) => column.keywords.some((keyword) => treatment.includes(keyword)))),
    );
    const seen = new Set<string>();
    const related: string[] = [];
    matchedColumns.forEach((column) => column.keywords.forEach((keyword) => {
      if (!seen.has(keyword) && keyword.toLowerCase() !== q && related.length < 8) {
        seen.add(keyword);
        related.push(keyword);
      }
    }));
    return { q, matchedColumns, faqs, matchedTreatments, related };
  }, [columns, query]);

  const hasQuery = results.q.length > 0;
  const isEmpty = results.matchedColumns.length === 0 && results.faqs.length === 0;

  return (
    <div className={styles.search} id="search">
      <div className={styles.inputRow}>
        <label htmlFor="column-search">칼럼 검색</label>
        <input id="column-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 울쎄라, 세르프, 붓기, 리쥬란" />
        <button type="button" className={styles.clear} aria-label="검색어 지우기" onClick={() => setQuery("")}>지우기</button>
        <button type="button" className={styles.submit}>검색</button>
      </div>

      {hasQuery && !isEmpty ? (
        <div className={styles.results}>
          <div className={styles.related}>
            <b>관련 키워드</b>
            <div>{results.related.map((keyword) => <button type="button" onClick={() => setQuery(keyword)} key={keyword}>{keyword}</button>)}</div>
            <small>누르면 그 키워드로 다시 찾습니다</small>
          </div>
          <div className={styles.resultContent}>
            <div className={styles.columnResults}>
              <b>관련 칼럼 {results.matchedColumns.length}</b>
              {results.matchedColumns.slice(0, 3).map((column) => (
                <Link href={`/column/${column.slug}`} key={column.slug}>
                  <small>{column.category}</small><strong>{column.title}</strong><span>{column.answer}</span>
                </Link>
              ))}
            </div>
            <div className={styles.faqResults}>
              <b>관련 질문 {results.faqs.length}</b>
              {results.faqs.slice(0, 3).map((faq) => <Link href="/column/xerf-vs-thermage#precautions" key={faq.q}>Q. {faq.q}</Link>)}
            </div>
            <div className={styles.treatmentLine}>시술 안내 바로가기: <b>{results.matchedTreatments.length ? results.matchedTreatments.join(" · ") : "전체 시술 안내"}</b></div>
          </div>
        </div>
      ) : null}

      {hasQuery && isEmpty ? (
        <div className={styles.empty}>
          <div><b>아직 &apos;{query}&apos;에 대한 칼럼이 없습니다</b><span>질문을 남겨주시면 대표원장이 칼럼으로 답합니다.</span></div>
          <button type="button">질문 남기기</button>
        </div>
      ) : null}

      <div className={styles.popular}>
        <span>많이 찾는 키워드</span>
        {columnMainContent.hero.popular.map((keyword) => <button type="button" onClick={() => setQuery(keyword)} key={keyword}>{keyword}</button>)}
      </div>
    </div>
  );
}
