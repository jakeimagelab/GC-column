"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { textEditProps } from "@/content/site-content-types";
import styles from "./ColumnTransitionOverlay.module.css";

type ColumnNavigateDetail = { href?: string };

const TRANSITION_DURATION = 800;

type ColumnTransitionOverlayProps = {
  columnLabel: string;
  gloryLabel: string;
};

export function ColumnTransitionOverlay({ columnLabel, gloryLabel }: ColumnTransitionOverlayProps) {
  const router = useRouter();
  const [href, setHref] = useState("");
  const timerRef = useRef<number | null>(null);
  const transitioningRef = useRef(false);

  useEffect(() => {
    router.prefetch("/column");

    const start = (nextHref: string) => {
      if (transitioningRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(nextHref);
        return;
      }

      transitioningRef.current = true;
      document.documentElement.dataset.columnTransition = "active";
      setHref(nextHref);
      timerRef.current = window.setTimeout(() => router.push(nextHref), TRANSITION_DURATION);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (document.body.classList.contains("devEditActive")) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/column")) return;
      event.preventDefault();
      start(`${url.pathname}${url.search}${url.hash}`);
    };

    const onNavigate = (event: Event) => {
      const transitionEvent = event as CustomEvent<ColumnNavigateDetail>;
      const nextHref = transitionEvent.detail?.href;
      if (!nextHref?.startsWith("/column")) return;
      transitionEvent.preventDefault();
      start(nextHref);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("glory:column-navigate", onNavigate);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("glory:column-navigate", onNavigate);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      delete document.documentElement.dataset.columnTransition;
    };
  }, [router]);

  if (!href || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.layer} role="status" aria-live="polite" aria-label="원장 칼럼으로 이동 중">
      <div className={styles.dimmer} />
      <div className={styles.cover}>
        <div className={styles.masthead} aria-hidden="true"><strong {...textEditProps("home.transition.glory")}>{gloryLabel}</strong><i>/</i><span {...textEditProps("home.transition.column")}>{columnLabel}</span></div>
      </div>
    </div>,
    document.body,
  );
}
