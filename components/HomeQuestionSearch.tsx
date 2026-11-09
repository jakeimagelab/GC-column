"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import styles from "./HomeQuestionSearch.module.css";

export type HomeSearchColumn = {
  slug: string;
  category: string;
  title: string;
  answer: string;
  keywords: string[];
};

type HomeQuestionSearchProps = { columns: HomeSearchColumn[]; content: SiteContent };

export function HomeQuestionSearch({ columns, content }: HomeQuestionSearchProps) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popular = [0, 1, 2, 3].map((index) => ({ id: `home.question.popular.${index}`, value: getText(content, `home.question.popular.${index}`) }));

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

  const hits = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return [];
    return columns
      .map((column) => ({
        column,
        score: column.keywords.filter((keyword) => q.includes(keyword.toLowerCase())).length +
          (column.title.toLowerCase().includes(q) ? 2 : 0),
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.column);
  }, [columns, searchQuery]);

  const top = hits[0];
  const chooseQuery = (value: string) => {
    setQuery(value);
    runSearch(value);
    inputRef.current?.focus();
  };

  return (
    <section className={styles.panel} aria-labelledby="home-question-title">
      <div className={styles.heading}>
        <div><span {...textEditProps("home.question.eyebrow")}>{getText(content, "home.question.eyebrow")}</span><h2 id="home-question-title" {...textEditProps("home.question.title")}>{getText(content, "home.question.title")}</h2></div>
        <p {...textEditProps("home.question.description")}>{getText(content, "home.question.description")}</p>
      </div>
      <div className={styles.inputRow}>
        <label htmlFor="ask">{getText(content, "home.question.inputLabel")}</label>
        <input
          ref={inputRef}
          id="ask"
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
          placeholder={getText(content, "home.question.placeholder")}
          data-edit-control
        />
        <button type="button" className={styles.clear} onClick={() => chooseQuery("")} data-edit-control>{getText(content, "home.question.clear")}</button>
        <button type="button" className={styles.ask} onClick={() => runSearch(query)} data-edit-control>{getText(content, "home.question.ask")}</button>
      </div>
      <div className={styles.popular}>
        <span>{getText(content, "home.question.popularLabel")}</span>
        {popular.map((question) => <button type="button" key={question.id} onClick={() => chooseQuery(question.value)} data-edit-control>{question.value}</button>)}
      </div>

      {searchQuery ? (
        <div className={`${styles.resultRegion} ${resultsVisible ? styles.resultRegionVisible : ""}`} aria-live="polite">
          {top ? (
            <div className={styles.results}>
              <Link className={styles.topResult} href={`/column/${top.slug}`}>
                <small><span {...textEditProps("home.question.closest")}>{getText(content, "home.question.closest")}</span> · {top.category}</small>
                <b>{top.title}</b>
                <p>{top.answer}</p>
                <span {...textEditProps("home.question.reviewed")}>{getText(content, "home.question.reviewed")}</span>
                <strong {...textEditProps("home.question.read")}>{getText(content, "home.question.read")}</strong>
              </Link>
              <div className={styles.otherResults}>
                <b><span {...textEditProps("home.question.related")}>{getText(content, "home.question.related")}</span> {Math.max(hits.length - 1, 0)}</b>
                {hits.slice(1, 4).map((column) => (
                  <Link href={`/column/${column.slug}`} key={column.slug}><small>{column.category}</small><span>{column.title}</span></Link>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <div><b {...textEditProps("home.question.noResult")}>{getText(content, "home.question.noResult")}</b><span {...textEditProps("home.question.emptyDescription")}>{getText(content, "home.question.emptyDescription")}</span></div>
              <button type="button" data-edit-control>{getText(content, "home.question.emptyAction")}</button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
