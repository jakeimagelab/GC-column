"use client";

import { useEffect, useRef } from "react";
import styles from "./ArticleProgress.module.css";

export function ArticleProgress() {
  const progressRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches) return;
    const article = document.querySelector<HTMLElement>("[data-article-body]");
    if (!article) return;
    let frame = 0;
    let needsMeasure = true;
    let start = 0;
    let end = 1;
    let lastProgress = -1;
    const measure = () => {
      start = article.getBoundingClientRect().top+window.scrollY;
      end = Math.max(start+1,start+article.offsetHeight-window.innerHeight);
      needsMeasure = false;
    };
    const update = () => {
      frame = 0;
      if (needsMeasure) measure();
      const progress = end <= start ? 1 : Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
      if (Math.abs(progress-lastProgress) < .001) return;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      lastProgress = progress;
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    const scheduleMeasure = () => {
      needsMeasure = true;
      schedule();
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(article);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleMeasure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return <div className={styles.track} aria-hidden="true"><span ref={progressRef} /></div>;
}
