"use client";

import { createElement, type ReactNode } from "react";
import type { MotionReveal } from "@/lib/motion";
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
  columnParallax,
}: MotionGroupProps) {
  return createElement(as, {
    className: `${styles.group} ${className}`,
    "data-reveal": reveal,
    "data-column-parallax": columnParallax,
    "data-scroll-world-layer": scrollWorldLayer,
    ...(label ? { "aria-label": label } : {}),
  }, children);
}
