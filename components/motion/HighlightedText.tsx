"use client";

import { Fragment, type ReactNode, useMemo, useRef } from "react";
import { useMotionOnce } from "./useMotionOnce";
import styles from "./HighlightedText.module.css";

const INLINE_TOKEN = /(==[^=\n]+==|\*\*[^*\n]+\*\*|\[(?:광고 검토|원장 확인)\])/g;

function textWithDesktopBreaks(value: string, keyPrefix: string): ReactNode[] {
  return value.split("\n").flatMap((line, index) => [
    ...(index ? [<Fragment key={`${keyPrefix}-break-${index}`}><br className="br-d" />{" "}</Fragment>] : []),
    <Fragment key={`${keyPrefix}-line-${index}`}>{line}</Fragment>,
  ]);
}

function inlineParts(value: string, showReview: boolean, desktopBreaks: boolean): ReactNode[] {
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
    return desktopBreaks
      ? textWithDesktopBreaks(part, `${index}-${part}`)
      : [<Fragment key={`${index}-${part}`}>{part}</Fragment>];
  });
}

export function InlineRichText({ value, showReview = false, desktopBreaks = false }: { value: string; showReview?: boolean; desktopBreaks?: boolean }) {
  return <>{inlineParts(value, showReview, desktopBreaks)}</>;
}

export function HighlightedParagraph({ value, lead, showReview = false, desktopBreaks = false, className }: { value: string; lead?: string; showReview?: boolean; desktopBreaks?: boolean; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const hasHighlight = value.includes("==") || Boolean(lead?.includes("=="));
  const options = useMemo(() => ({ threshold: 0.06, rootMargin: "0px 0px -6% 0px", armBeforePlay: true }), []);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  return (
    <p ref={ref} className={[hasHighlight ? styles.paragraph : "", desktopBreaks ? styles.desktopBreakParagraph : "", className ?? ""].filter(Boolean).join(" ")}>
      {lead ? <><strong>{inlineParts(lead, showReview, desktopBreaks)}</strong>{value ? " " : null}</> : null}
      {inlineParts(value, showReview, desktopBreaks)}
    </p>
  );
}
