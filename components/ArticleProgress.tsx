"use client";

import { useEffect, useState } from "react";
import styles from "./ArticleProgress.module.css";

export function ArticleProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
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
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className={styles.track} aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>;
}
