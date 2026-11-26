"use client";

import { createElement, type ReactNode } from "react";
import styles from "./DoctorReveal.module.css";

type DoctorRevealProps = {
  as?: "section" | "div";
  id?: string;
  className?: string;
  children: ReactNode;
  scrollWorldScene?: boolean;
};

export function DoctorReveal({ as = "section", id, className = "", children, scrollWorldScene = false }: DoctorRevealProps) {

  return createElement(as, {
    id,
    className: `${styles.root} ${className}`,
    "data-scroll-world-scene": scrollWorldScene ? "" : undefined,
  }, children);
}
