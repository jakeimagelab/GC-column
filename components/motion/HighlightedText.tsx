"use client";

import { Fragment, type ReactNode } from "react";
import styles from "./HighlightedText.module.css";

const INLINE_TOKEN = /(==[^=\n]+==|\*\*[^*\n]+\*\*|\[(?:광고 검토|원장 확인)\])/g;

function textWithDesktopBreaks(value: string, keyPrefix: string): ReactNode[] {
  return value.split("\n").flatMap((line, index) => [
    ...(index ? [<Fragment key={`${keyPrefix}-break-${index}`}><br className="br-d" />{" "}</Fragment>] : []),
    <Fragment key={`${keyPrefix}-line-${index}`}>{line}</Fragment>,
  ]);
}

function inlineParts(value: string, showReview: boolean, desktopBreaks: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];

  value.split(INLINE_TOKEN).forEach((part, index) => {
    if (!part) return;
    if (part.startsWith("==") && part.endsWith("==")) {
      nodes.push(<mark key={`${index}-${part}`}>{part.slice(2, -2)}</mark>);
      return;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>);
      return;
    }
    if (part === "[광고 검토]" || part === "[원장 확인]") {
      if (showReview) {
        nodes.push(<span className={styles.reviewBadge} key={`${index}-${part}`}>{part.slice(1, -1)}</span>);
      }
      return;
    }
    if (desktopBreaks) {
      nodes.push(...textWithDesktopBreaks(part, `${index}-${part}`));
      return;
    }
    nodes.push(<Fragment key={`${index}-${part}`}>{part}</Fragment>);
  });

  return nodes;
}

export function InlineRichText({ value, showReview = false, desktopBreaks = false }: { value: string; showReview?: boolean; desktopBreaks?: boolean }) {
  return <>{inlineParts(value, showReview, desktopBreaks)}</>;
}

export function HighlightedParagraph({ value, lead, showReview = false, desktopBreaks = false, className }: { value: string; lead?: string; showReview?: boolean; desktopBreaks?: boolean; className?: string }) {
  const hasHighlight = value.includes("==") || Boolean(lead?.includes("=="));

  return (
    <p className={[hasHighlight ? styles.paragraph : "", desktopBreaks ? styles.desktopBreakParagraph : "", className ?? ""].filter(Boolean).join(" ")}>
      {lead ? <><strong>{inlineParts(lead, showReview, desktopBreaks)}</strong>{value ? " " : null}</> : null}
      {inlineParts(value, showReview, desktopBreaks)}
    </p>
  );
}
