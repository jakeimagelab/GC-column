"use client";

import { createElement, useMemo, useRef, type ReactNode } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./DoctorReveal.module.css";

type DoctorRevealProps = {
  as?: "section" | "div";
  id?: string;
  className?: string;
  children: ReactNode;
};

function countToFinal(root: HTMLElement) {
  const target = root.querySelector<HTMLElement>("[data-motion-count]");
  if (!target) return;
  const finalValue = Number(target.dataset.motionCount ?? "0");
  if (!Number.isFinite(finalValue) || finalValue <= 0) return;
  const original = target.textContent ?? String(finalValue);
  const startedAt = performance.now();
  const duration = 1100;

  const frame = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    target.textContent = original.replace(/\d+/, String(Math.round(finalValue * eased)));
    if (progress < 1) requestAnimationFrame(frame);
    else target.textContent = original;
  };
  target.textContent = original.replace(/\d+/, "0");
  requestAnimationFrame(frame);
}

export function DoctorReveal({ as = "section", id, className = "", children }: DoctorRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const options = useMemo(() => ({ threshold: 0.2, onPlay: countToFinal }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  return createElement(as, { ref, id, className: `${styles.root} ${className}` }, children);
}
