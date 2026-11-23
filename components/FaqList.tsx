"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColumnFaq } from "@/content/types";
import { InlineRichText } from "./motion/HighlightedText";
import styles from "./FaqList.module.css";

export type FaqListItem = ColumnFaq & {
  id?: string;
  href?: string;
};

type FaqListProps = {
  items: FaqListItem[];
  variant?: "default" | "magazine";
  firstOpen?: boolean;
  answerLabel?: string;
  readLabel?: string;
  showReview?: boolean;
  mobileStyle?: "issue" | "detail";
  useSummary?: boolean;
  desktopBreaks?: boolean;
};

function answerParts(value: string) {
  const match = value.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  return match ? { first: match[1], rest: match[2] } : { first: value, rest: "" };
}

export function FaqList({
  items,
  variant = "default",
  firstOpen = false,
  answerLabel = "결론부터",
  readLabel = "전문 보기 →",
  showReview = false,
  mobileStyle = "detail",
  useSummary = false,
  desktopBreaks = false,
}: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(firstOpen && items.length ? 0 : null);

  return (
    <div className={`${styles.list} ${variant === "magazine" ? styles.magazine : ""}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const answer = useSummary && item.summary
          ? { first: `${item.summary}${item.summaryNeedsReview ? " [원장 확인]" : ""}`, rest: item.a }
          : answerParts(item.a);
        return (
          <article className={`${styles.item} ${isOpen ? styles.open : ""} ${mobileStyle === "issue" ? styles.issueItem : ""}`} id={item.id} key={`${item.q}-${index}`} data-faq-item>
            <button
              type="button"
              className={styles.summary}
              aria-expanded={isOpen}
              aria-controls={`${item.id ?? `faq-${index + 1}`}-answer`}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.question}>{item.q}</span>
              <span className={styles.toggle} aria-hidden="true">+</span>
            </button>
            <div
              className={styles.answerWrap}
              id={`${item.id ?? `faq-${index + 1}`}-answer`}
              aria-hidden={!isOpen}
            >
              <div className={styles.answer}>
                <span>{answerLabel}</span>
                <p>
                  <strong className={styles.firstSentence}><InlineRichText value={answer.first} showReview={showReview} desktopBreaks={desktopBreaks} /></strong>
                  {answer.rest ? <span className={styles.answerRest}> <InlineRichText value={answer.rest} showReview={showReview} desktopBreaks={desktopBreaks} /></span> : null}
                </p>
                {item.href ? <Link href={item.href} tabIndex={isOpen ? undefined : -1}>{readLabel}</Link> : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
