"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popular = [0, 1, 2, 3, 4].map((index) => ({ id: `column.search.popular.${index}`, value: getText(content, `column.search.popular.${index}`) }));

  const runSearch = (nextQuery: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const trimmed = nextQuery.trim();
    if (trimmed) {
      setSearchQuery(trimmed);
      requestAnimationFrame(() => setResultsVisible(true));
      return;
    }
    setResultsVisible(false);
    hideTimer.current = setTimeout(() => setSearchQuery(""), 200);
  };

  useEffect(() => {
    if (composing.current) return;
    const timer = setTimeout(() => runSearch(query), 100);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const results = useMemo(() => {
    const q = searchQuery.toLowerCase();
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
  }, [columns, faqIndex, searchQuery, treatments]);

  const isEmpty = results.matchedColumns.length === 0 && results.faqs.length === 0;
  const chooseQuery = (value: string) => {
    setQuery(value);
    runSearch(value);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.search} id="search">
      <div className={styles.inputRow}>
        <label htmlFor="column-search" {...textEditProps("column.search.label")}>{getText(content, "column.search.label")}</label>
        <input
          ref={inputRef}
          id="column-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(event) => {
            composing.current = false;
            setQuery(event.currentTarget.value);
            runSearch(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !composing.current) runSearch(query);
          }}
          placeholder={getText(content, "column.search.placeholder")}
          data-edit-control
        />
        <button type="button" className={styles.clear} aria-label="검색어 지우기" onClick={() => chooseQuery("")} data-edit-control>{getText(content, "column.search.clear")}</button>
        <button type="button" className={styles.submit} onClick={() => runSearch(query)} data-edit-control>{getText(content, "column.search.submit")}</button>
      </div>

      {searchQuery ? (
        <div className={`${styles.resultRegion} ${resultsVisible ? styles.resultRegionVisible : ""}`} aria-live="polite">
          {!isEmpty ? (
            <div className={styles.results}>
              <div className={styles.related}>
                <b {...textEditProps("column.search.relatedKeywords")}>{getText(content, "column.search.relatedKeywords")}</b>
                <div>{results.related.map((keyword) => <button type="button" onClick={() => chooseQuery(keyword)} key={keyword} data-edit-control>{keyword}</button>)}</div>
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
                <div className={styles.treatmentLine}><span {...textEditProps("column.search.treatmentLink")}>{getText(content, "column.search.treatmentLink")}</span> <b>{results.matchedTreatments.length ? results.matchedTreatments.join(" · ") : getText(content, "column.search.allTreatments")}</b></div>
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <div><b><span {...textEditProps("column.search.emptyPrefix")}>{getText(content, "column.search.emptyPrefix")}</span> &apos;{searchQuery}&apos;<span {...textEditProps("column.search.emptySuffix")}>{getText(content, "column.search.emptySuffix")}</span></b><span {...textEditProps("column.search.emptyDescription")}>{getText(content, "column.search.emptyDescription")}</span></div>
              <button type="button" data-edit-control>{getText(content, "column.search.emptyAction")}</button>
            </div>
          )}
        </div>
      ) : null}

      <div className={styles.popular}>
        <span>{getText(content, "column.search.popularLabel")}</span>
        {popular.map((keyword) => <button type="button" onClick={() => chooseQuery(keyword.value)} key={keyword.id} data-edit-control>{keyword.value}</button>)}
      </div>
    </div>
  );
}
