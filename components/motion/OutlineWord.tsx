"use client";

import { useId, useMemo, useRef, type CSSProperties } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./OutlineWord.module.css";

type OutlineWordProps = {
  text: "DIRECTOR" | "VISION" | "COLUMN";
  className?: string;
  fill: string;
  stroke?: string;
};

const widths = { DIRECTOR: 880, VISION: 610, COLUMN: 720 } as const;

export function OutlineWord({ text, className = "", fill, stroke = "#cfc2b3" }: OutlineWordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const options = useMemo(() => ({
    threshold: 0.22,
    onPlay: (element: HTMLDivElement) => {
      window.setTimeout(() => {
        element.classList.remove(styles.armed, styles.playing);
      }, 2_900);
    },
  }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);
  const filterId = useId().replace(/:/g, "");
  const viewWidth = widths[text];
  const style = {
    "--outline-ratio": viewWidth / 170,
    "--outline-fill": fill,
    "--outline-stroke": stroke,
    "--outline-length": text === "DIRECTOR" ? 700 : text === "VISION" ? 560 : 620,
  } as CSSProperties;

  return (
    <div ref={ref} className={`${styles.root} ${className}`} style={style} aria-hidden="true">
      <svg className={styles.svg} viewBox={`0 0 ${viewWidth} 170`} focusable="false">
        <defs>
          <filter id={`${filterId}-pencil`}><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="1" seed="4" /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
          <filter id={`${filterId}-pencil2`}><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="1" seed="11" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
        </defs>
        <text className={`${styles.text} ${styles.secondary}`} x="4" y="146" filter={`url(#${filterId}-pencil2)`}>{text}</text>
        <text className={`${styles.text} ${styles.primary}`} x="0" y="142" filter={`url(#${filterId}-pencil)`}>{text}</text>
      </svg>
    </div>
  );
}
