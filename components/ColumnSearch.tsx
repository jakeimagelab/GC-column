"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import styles from "./ColumnSearch.module.css";

export type SearchColumn = {
  slug: string;
  category: string;
  title: string;
  answer: string;
  keywords: string[];
};

type SearchFaq = { q: string; keywords: string[] };
type ColumnSearchProps = { columns: SearchColumn[]; content: SiteContent; faqIndex: SearchFaq[]; treatments: string[] };

export function ColumnSearch({ columns, content, faqIndex, treatments }: ColumnSearchProps) {
  const [query, setQuery] = useState(getText(content, "column.search.initialQuery"));
  const popular = [0, 1, 2, 3, 4].map((index) => ({ id: `column.search.popular.${index}`, value: getText(content, `column.search.popular.${index}`) }));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hit = (keywords: string[], title: string) => q.length > 0 && (
      keywords.some((keyword) => keyword.toLowerCase().includes(q) || q.includes(keyword.toLowerCase())) ||
      title.toLowerCase().includes(q)
    );
    const matchedColumns = columns.filter((column) => hit(column.keywords, column.title));
    const faqs = faqIndex.filter((faq) => hit(faq.keywords, faq.q));
    const matchedTreatments = treatments.filter((treatment) =>
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
  }, [columns, faqIndex, query, treatments]);

  const hasQuery = results.q.length > 0;
  const isEmpty = results.matchedColumns.length === 0 && results.faqs.length === 0;

  return (
    <div className={styles.search} id="search">
      <div className={styles.inputRow}>
        <label htmlFor="column-search" {...textEditProps("column.search.label")}>{getText(content, "column.search.label")}</label>
        <input id="column-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={getText(content, "column.search.placeholder")} data-edit-id="column.search.initialQuery" data-edit-type="text" />
        <button type="button" className={styles.clear} aria-label="검색어 지우기" onClick={() => setQuery("")} {...textEditProps("column.search.clear")}>{getText(content, "column.search.clear")}</button>
        <button type="button" className={styles.submit} {...textEditProps("column.search.submit")}>{getText(content, "column.search.submit")}</button>
      </div>

      {hasQuery && !isEmpty ? (
        <div className={styles.results}>
          <div className={styles.related}>
            <b {...textEditProps("column.search.relatedKeywords")}>{getText(content, "column.search.relatedKeywords")}</b>
            <div>{results.related.map((keyword) => <button type="button" onClick={() => setQuery(keyword)} key={keyword}>{keyword}</button>)}</div>
            <small {...textEditProps("column.search.relatedGuide")}>{getText(content, "column.search.relatedGuide")}</small>
          </div>
          <div className={styles.resultContent}>
            <div className={styles.columnResults}>
              <b><span {...textEditProps("column.search.relatedColumns")}>{getText(content, "column.search.relatedColumns")}</span> {results.matchedColumns.length}</b>
              {results.matchedColumns.slice(0, 3).map((column) => (
                <Link href={`/column/${column.slug}`} key={column.slug}>
                  <small>{column.category}</small><strong>{column.title}</strong><span>{column.answer}</span>
                </Link>
              ))}
            </div>
            <div className={styles.faqResults}>
              <b><span {...textEditProps("column.search.relatedQuestions")}>{getText(content, "column.search.relatedQuestions")}</span> {results.faqs.length}</b>
              {results.faqs.slice(0, 3).map((faq) => <Link href="/column/xerf-vs-thermage#precautions" key={faq.q}>Q. {faq.q}</Link>)}
            </div>
            <div className={styles.treatmentLine}><span {...textEditProps("column.search.treatmentLink")}>{getText(content, "column.search.treatmentLink")}</span> <b>{results.matchedTreatments.length ? results.matchedTreatments.join(" · ") : getText(content, "column.search.allTreatments")}</b></div>
          </div>
        </div>
      ) : null}

      {hasQuery && isEmpty ? (
        <div className={styles.empty}>
          <div><b><span {...textEditProps("column.search.emptyPrefix")}>{getText(content, "column.search.emptyPrefix")}</span> &apos;{query}&apos;<span {...textEditProps("column.search.emptySuffix")}>{getText(content, "column.search.emptySuffix")}</span></b><span {...textEditProps("column.search.emptyDescription")}>{getText(content, "column.search.emptyDescription")}</span></div>
          <button type="button" {...textEditProps("column.search.emptyAction")}>{getText(content, "column.search.emptyAction")}</button>
        </div>
      ) : null}

      <div className={styles.popular}>
        <span {...textEditProps("column.search.popularLabel")}>{getText(content, "column.search.popularLabel")}</span>
        {popular.map((keyword) => <button type="button" onClick={() => setQuery(keyword.value)} key={keyword.id} {...textEditProps(keyword.id)}>{keyword.value}</button>)}
      </div>
    </div>
  );
}
