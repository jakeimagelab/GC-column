"use client";

import { useEffect, useRef, useState } from "react";
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
  const progressRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = items.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [element] : [];
    });
    const article = mobileBar ? document.querySelector<HTMLElement>("[data-article-body]") : null;
    const media = window.matchMedia("(max-width: 640px)");
    let frame = 0;
    let enabled = mobileBar ? media.matches : !media.matches;
    let needsMeasure = true;
    let positions:Array<{ id:string; top:number }> = [];
    let articleStart = 0;
    let articleEnd = 1;
    let lastProgress = -1;
    const measure = () => {
      const scrollY = window.scrollY;
      positions = elements.map((element) => ({ id:element.id, top:element.getBoundingClientRect().top+scrollY }));
      if (article) {
        articleStart = article.getBoundingClientRect().top+scrollY;
        articleEnd = Math.max(articleStart+1,articleStart+article.offsetHeight-window.innerHeight);
      }
      needsMeasure = false;
    };
    const update = () => {
      frame = 0;
      if (!enabled) return;
      if (needsMeasure) measure();
      const activationPoint = window.scrollY+window.innerHeight*.35;
      let current = positions[0]?.id ?? "";
      for (const position of positions) {
        if (position.top > activationPoint) break;
        current = position.id;
      }
      if (current) setActiveId((previous) => previous === current ? previous : current);
      if (article && progressRef.current) {
        const progress = Math.max(0,Math.min(1,(window.scrollY-articleStart)/(articleEnd-articleStart)));
        if (Math.abs(progress-lastProgress) >= .001) {
          progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
          lastProgress = progress;
        }
      }
    };
    const schedule = () => {
      if (!enabled) return;
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    const scheduleMeasure = () => {
      needsMeasure = true;
      schedule();
    };
    const handleMediaChange = () => {
      enabled = mobileBar ? media.matches : !media.matches;
      if (enabled) scheduleMeasure();
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    elements.forEach((element) => resizeObserver.observe(element));
    if (article) resizeObserver.observe(article);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    media.addEventListener("change",handleMediaChange);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleMeasure);
      media.removeEventListener("change",handleMediaChange);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items, mobileBar]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const selectSection = (id: string) => {
    setActiveId(id);
    setOpen(false);
  };

  if (mobileBar) {
    const activeLabel = items.find((item) => item.id === activeId)?.label ?? items[0]?.label ?? "";
    return (
      <div className={styles.mobileToc}>
        <span className={styles.progress} aria-hidden="true"><i ref={progressRef} /></span>
        <button type="button" aria-expanded={open} aria-controls="mobile-column-toc" onClick={() => setOpen((value) => !value)}>
          <span>목차 보기</span><b>{activeLabel}</b><ChevronDownIcon aria-hidden="true" />
        </button>
        <nav id="mobile-column-toc" className={open ? styles.mobileSheetOpen : styles.mobileSheet} aria-label="이 글의 목차">
          {items.map((item) => (
            <a
              href={`#${item.id}`}
              key={item.id}
              className={activeId === item.id ? styles.active : ""}
              onClick={() => selectSection(item.id)}
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
          onClick={() => selectSection(item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
