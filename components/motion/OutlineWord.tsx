"use client";

import { useId, useMemo, useRef, type CSSProperties } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./OutlineWord.module.css";

type OutlineWordProps = {
  text: "DIRECTOR" | "VISION" | "GLORY" | "COLUMN";
  className?: string;
  fill: string;
  stroke?: string;
  scrollWorldLayer?: "depth" | "copy" | "counter";
  trackingMotion?: boolean;
  outerStroke?: boolean;
};

const widths = { DIRECTOR: 880, VISION: 610, GLORY: 610, COLUMN: 720 } as const;

export function OutlineWord({ text, className = "", fill, stroke = "#cfc2b3", scrollWorldLayer, trackingMotion = false, outerStroke = false }: OutlineWordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const maskId = `outline-mask-${useId().replaceAll(":", "")}`;
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
  const textX = trackingMotion ? "50%" : "0";
  const textAnchor = trackingMotion ? "middle" : undefined;

  return (
    <div ref={ref} className={`${styles.root} ${trackingMotion ? styles.tracking : ""} ${className}`} style={style} aria-hidden="true" data-scroll-world-layer={scrollWorldLayer}>
      <svg className={styles.svg} viewBox={`0 0 ${viewWidth} 170`} focusable="false">
        {outerStroke ? (
          <defs>
            <mask className={styles.outerMask} id={maskId} x="-4" y="-4" width={viewWidth + 8} height="178" maskUnits="userSpaceOnUse">
              <rect x="-4" y="-4" width={viewWidth + 8} height="178" fill="#fff" />
              <text className={`${styles.text} ${styles.maskCutout}`} x={textX} y="142" textAnchor={textAnchor}>{text}</text>
            </mask>
          </defs>
        ) : null}
        <text className={`${styles.text} ${outerStroke ? styles.outerStrokeText : ""}`} x={textX} y="142" textAnchor={textAnchor} mask={outerStroke ? `url(#${maskId})` : undefined}>{text}</text>
      </svg>
    </div>
  );
}
