"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import styles from "./ArticleToc.module.css";

export type TocItem = { id: string; label: string };

type ArticleTocProps = {
  items: TocItem[];
  title: string;
  compact?: boolean;
  mobileBar?: boolean;
};

export function ArticleToc({ items, title, compact = false, mobileBar = false }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const elements = items.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [element] : [];
    });
    let frame = 0;
    const update = () => {
      frame = 0;
      const activationLine = mobileBar ? 132 : window.innerHeight * 0.22;
      let current = elements[0]?.id ?? "";
      for (const element of elements) {
        if (element.getBoundingClientRect().top > activationLine) break;
        current = element.id;
      }
      if (current) setActiveId((previous) => previous === current ? previous : current);
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items, mobileBar]);

  useEffect(() => {
    if (!mobileBar) return;
    const update = () => {
      const article = document.querySelector<HTMLElement>("[data-article-body]");
      if (!article) return;
      const start = article.getBoundingClientRect().top + window.scrollY;
      const end = start + article.offsetHeight - window.innerHeight;
      setProgress(end <= start ? 1 : Math.max(0, Math.min(1, (window.scrollY - start) / (end - start))));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mobileBar]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (mobileBar) {
    const activeLabel = items.find((item) => item.id === activeId)?.label ?? items[0]?.label ?? "";
    return (
      <div className={styles.mobileToc}>
        <span className={styles.progress} aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></span>
        <button type="button" aria-expanded={open} aria-controls="mobile-column-toc" onClick={() => setOpen((value) => !value)}>
          <span>목차</span><b>{activeLabel}</b><ChevronDownIcon aria-hidden="true" />
        </button>
        <nav id="mobile-column-toc" className={open ? styles.mobileSheetOpen : styles.mobileSheet} aria-label="이 글의 목차">
          {items.map((item) => (
            <a
              href={`#${item.id}`}
              key={item.id}
              className={activeId === item.id ? styles.active : ""}
              onClick={() => { setActiveId(item.id); setOpen(false); }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    );
  }

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
