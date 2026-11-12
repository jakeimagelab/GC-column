"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./OutlineWord.module.css";

type OutlineWordProps = {
  text: "DIRECTOR" | "VISION" | "COLUMN";
  className?: string;
  fill: string;
  stroke?: string;
  scrollWorldLayer?: "depth" | "copy" | "counter";
};

const widths = { DIRECTOR: 880, VISION: 610, COLUMN: 720 } as const;

export function OutlineWord({ text, className = "", fill, stroke = "#cfc2b3", scrollWorldLayer }: OutlineWordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const options = useMemo(() => ({
    threshold: 0.22,
    onPlay: (element: HTMLDivElement) => {
      window.setTimeout(() => {
        element.classList.remove(styles.armed, styles.playing);
      }, 1_700);
    },
  }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);
  const viewWidth = widths[text];
  const style = {
    "--outline-ratio": viewWidth / 170,
    "--outline-fill": fill,
    "--outline-stroke": stroke,
  } as CSSProperties;

  return (
    <div ref={ref} className={`${styles.root} ${className}`} style={style} aria-hidden="true" data-scroll-world-layer={scrollWorldLayer}>
      <svg className={styles.svg} viewBox={`0 0 ${viewWidth} 170`} focusable="false">
        <text className={styles.text} x="0" y="142">{text}</text>
      </svg>
    </div>
  );
}
