"use client";

import { useEffect, useState } from "react";
import styles from "./ArticleToc.module.css";

export type TocItem = { id: string; label: string };

type ArticleTocProps = {
  items: TocItem[];
  title: string;
  compact?: boolean;
};

export function ArticleToc({ items, title, compact = false }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [element] : [];
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -66% 0px", threshold: [0, 0.2, 0.8] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={`${styles.toc} ${compact ? styles.compact : ""}`} aria-label="이 글의 목차">
      <b>{title}</b>
      {items.map((item) => (
        <a
          href={`#${item.id}`}
          key={item.id}
          className={activeId === item.id ? styles.active : ""}
          onClick={() => setActiveId(item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
