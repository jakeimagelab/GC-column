"use client";

import { Fragment, type ReactNode, useMemo, useRef } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./HighlightedText.module.css";

const INLINE_TOKEN = /(==[^=\n]+==|\*\*[^*\n]+\*\*|\[(?:광고 검토|원장 확인)\])/g;

function inlineParts(value: string, showReview: boolean): ReactNode[] {
  return value.split(INLINE_TOKEN).flatMap((part, index) => {
    if (!part) return [];
    if (part.startsWith("==") && part.endsWith("==")) {
      return [<mark key={`${index}-${part}`}>{part.slice(2, -2)}</mark>];
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return [<strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>];
    }
    if (part === "[광고 검토]" || part === "[원장 확인]") {
      return showReview
        ? [<span className={styles.reviewBadge} key={`${index}-${part}`}>{part.slice(1, -1)}</span>]
        : [];
    }
    return [<Fragment key={`${index}-${part}`}>{part}</Fragment>];
  });
}

export function InlineRichText({ value, showReview = false }: { value: string; showReview?: boolean }) {
  return <>{inlineParts(value, showReview)}</>;
}

export function HighlightedParagraph({ value, showReview = false, className }: { value: string; showReview?: boolean; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const hasHighlight = value.includes("==");
  const options = useMemo(() => ({ threshold: 0.35 }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  return (
    <p ref={ref} className={[hasHighlight ? styles.paragraph : "", className ?? ""].filter(Boolean).join(" ")}>
      {inlineParts(value, showReview)}
    </p>
  );
}
