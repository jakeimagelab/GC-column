"use client";

import { createElement, useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./MotionGroup.module.css";

type MotionGroupProps = {
  as?: "div" | "section";
  children: ReactNode;
  className?: string;
  label?: string;
  scrollWorldLayer?: "depth" | "copy" | "counter";
};

export function MotionGroup({ as = "div", children, className = "", label, scrollWorldLayer }: MotionGroupProps) {
  const ref = useRef<HTMLElement>(null);
  const options = useMemo(() => ({ threshold: 0.18 }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>("[data-motion-item]").forEach((item, index) => {
      item.style.setProperty("--motion-delay", `${index * 0.12}s`);
    });
  }, [children]);

  return createElement(as, {
    ref,
    className: `${styles.group} ${className}`,
    "data-scroll-world-layer": scrollWorldLayer,
    ...(label ? { "aria-label": label } : {}),
  }, children);
}
