"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState(getText(content, "home.question.initialQuery"));
  const popular = [0, 1, 2, 3].map((index) => ({ id: `home.question.popular.${index}`, value: getText(content, `home.question.popular.${index}`) }));

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
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
  }, [columns, query]);

  const hasQuery = query.trim().length > 0;
  const top = hits[0];

  return (
    <section className={styles.panel} aria-labelledby="home-question-title">
      <div className={styles.heading}>
        <div><span {...textEditProps("home.question.eyebrow")}>{getText(content, "home.question.eyebrow")}</span><h2 id="home-question-title" {...textEditProps("home.question.title")}>{getText(content, "home.question.title")}</h2></div>
        <p {...textEditProps("home.question.description")}>{getText(content, "home.question.description")}</p>
      </div>
      <div className={styles.inputRow}>
        <label htmlFor="ask" {...textEditProps("home.question.inputLabel")}>{getText(content, "home.question.inputLabel")}</label>
        <input id="ask" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={getText(content, "home.question.placeholder")} data-edit-id="home.question.initialQuery" data-edit-type="text" />
        <button type="button" className={styles.clear} onClick={() => setQuery("")} {...textEditProps("home.question.clear")}>{getText(content, "home.question.clear")}</button>
        <button type="button" className={styles.ask} {...textEditProps("home.question.ask")}>{getText(content, "home.question.ask")}</button>
      </div>
      <div className={styles.popular}>
        <span {...textEditProps("home.question.popularLabel")}>{getText(content, "home.question.popularLabel")}</span>
        {popular.map((question) => <button type="button" key={question.id} onClick={() => setQuery(question.value)} {...textEditProps(question.id)}>{question.value}</button>)}
      </div>

      {top ? (
        <div className={styles.results}>
          <Link className={styles.topResult} href={`/column/${top.slug}`}>
            <small><span {...textEditProps("home.question.closest")}>{getText(content, "home.question.closest")}</span> · {top.category}</small>
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
      ) : null}

      {hasQuery && hits.length === 0 ? (
        <div className={styles.empty}>
          <div><b {...textEditProps("home.question.noResult")}>{getText(content, "home.question.noResult")}</b><span {...textEditProps("home.question.emptyDescription")}>{getText(content, "home.question.emptyDescription")}</span></div>
          <button type="button" {...textEditProps("home.question.emptyAction")}>{getText(content, "home.question.emptyAction")}</button>
        </div>
      ) : null}
    </section>
  );
}
