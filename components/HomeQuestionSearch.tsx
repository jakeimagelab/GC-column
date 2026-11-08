"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { homeContent } from "@/content/site";
import styles from "./HomeQuestionSearch.module.css";

export type HomeSearchColumn = {
  slug: string;
  category: string;
  title: string;
  answer: string;
  keywords: string[];
};

type HomeQuestionSearchProps = { columns: HomeSearchColumn[] };

export function HomeQuestionSearch({ columns }: HomeQuestionSearchProps) {
  const [query, setQuery] = useState(homeContent.question.initialQuery);

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
        <div><span>{homeContent.question.eyebrow}</span><h2 id="home-question-title">{homeContent.question.title}</h2></div>
        <p>{homeContent.question.description}</p>
      </div>
      <div className={styles.inputRow}>
        <label htmlFor="ask">질문 입력</label>
        <input id="ask" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={homeContent.question.placeholder} />
        <button type="button" className={styles.clear} onClick={() => setQuery("")}>지우기</button>
        <button type="button" className={styles.ask}>질문하기</button>
      </div>
      <div className={styles.popular}>
        <span>많이 묻는 질문</span>
        {homeContent.question.popular.map((question) => <button type="button" key={question} onClick={() => setQuery(question)}>{question}</button>)}
      </div>

      {top ? (
        <div className={styles.results}>
          <Link className={styles.topResult} href={`/column/${top.slug}`}>
            <small>가장 가까운 답 · {top.category}</small>
            <b>{top.title}</b>
            <p>{top.answer}</p>
            <span>대표원장 이호 · 검토 [날짜]</span>
            <strong>칼럼 전체 읽기 →</strong>
          </Link>
          <div className={styles.otherResults}>
            <b>관련 칼럼 {Math.max(hits.length - 1, 0)}</b>
            {hits.slice(1, 4).map((column) => (
              <Link href={`/column/${column.slug}`} key={column.slug}><small>{column.category}</small><span>{column.title}</span></Link>
            ))}
          </div>
        </div>
      ) : null}

      {hasQuery && hits.length === 0 ? (
        <div className={styles.empty}>
          <div><b>아직 이 질문에 대한 칼럼이 없습니다</b><span>질문을 남겨주시면 대표원장이 칼럼으로 답합니다.</span></div>
          <button type="button">원장님께 질문 남기기</button>
        </div>
      ) : null}
    </section>
  );
}
