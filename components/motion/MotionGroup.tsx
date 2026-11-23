"use client";

import { createElement, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { MotionReveal } from "@/lib/motion";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./MotionGroup.module.css";

type MotionGroupProps = {
  as?: "div" | "section";
  children: ReactNode;
  className?: string;
  label?: string;
  scrollWorldLayer?: "depth" | "copy" | "counter";
  reveal?: MotionReveal;
  delay?: number;
  stagger?: number;
  threshold?: number;
  rootMargin?: string;
  columnParallax?: number;
};

export function MotionGroup({
  as = "div",
  children,
  className = "",
  label,
  scrollWorldLayer,
  reveal = "up",
  delay = 0,
  stagger = 0.1,
  threshold = 0.06,
  rootMargin = "0px 0px -6% 0px",
  columnParallax,
}: MotionGroupProps) {
  const ref = useRef<HTMLElement>(null);
  const options = useMemo(() => ({ threshold, rootMargin, armBeforePlay: true }), [rootMargin, threshold]);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>("[data-motion-item]").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${delay + index * stagger}s`);
    });
  }, [children, delay, stagger]);

  return createElement(as, {
    ref,
    className: `${styles.group} ${className}`,
    "data-reveal": reveal,
    "data-column-parallax": columnParallax,
    "data-scroll-world-layer": scrollWorldLayer,
    ...(label ? { "aria-label": label } : {}),
  }, children);
}
