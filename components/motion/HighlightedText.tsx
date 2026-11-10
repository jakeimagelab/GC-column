"use client";

import { Fragment, useMemo, useRef } from "react";
import { splitHighlights } from "@/lib/motion";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./HighlightedText.module.css";

export function HighlightedParagraph({ value }: { value: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const hasHighlight = value.includes("==");
  const options = useMemo(() => ({ threshold: 0.35 }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  return (
    <p ref={ref} className={hasHighlight ? styles.paragraph : undefined}>
      {splitHighlights(value).map((part, index) => part.highlighted
        ? <mark key={`${index}-${part.value}`}>{part.value}</mark>
        : <Fragment key={`${index}-${part.value}`}>{part.value}</Fragment>)}
    </p>
  );
}
