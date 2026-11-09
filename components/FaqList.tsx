"use client";

import { useState } from "react";
import type { ColumnFaq } from "@/content/types";
import styles from "./FaqList.module.css";

type FaqListProps = {
  items: (ColumnFaq & { editId?: string; id?: string })[];
};

export function FaqList({ items }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.list}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const questionId = item.id ?? `faq-${index + 1}`;
        const answerId = `${questionId}-answer`;
        return (
          <div className={styles.item} key={item.q}>
            <button
              type="button"
              id={questionId}
              className={styles.question}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>
                Q. {item.editId ? <span data-edit-id={item.editId} data-edit-type="text">{item.q}</span> : item.q}
              </span>
              <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div id={answerId} className={styles.answer} hidden={!isOpen}>
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
