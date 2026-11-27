"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useDesktopMotion } from "@/components/motion/useDesktopMotion";
import styles from "./TreatmentDetailTemplate.module.css";

type RevealMode = "default" | "line" | "zoom" | "clip";

export function TreatmentReveal({ children, className = "", mode = "default", delay = 0 }: { children: ReactNode; className?: string; mode?: RevealMode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const desktop = useDesktopMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!desktop || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: .2 },
    );
    const observedElement = mode === "clip" ? (element.parentElement ?? element) : element;
    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [desktop, mode]);

  return (
    <div
      ref={ref}
      className={`${desktop ? styles.reveal : ""} ${visible ? styles.revealVisible : ""} ${className}`}
      data-reveal={mode}
      style={{ "--d": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
