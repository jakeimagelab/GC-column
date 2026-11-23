"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { textEditProps } from "@/content/site-content-types";
import styles from "./ColumnTransitionOverlay.module.css";

type ColumnNavigateDetail = { href?: string };
type TransitionDirection = "toColumn" | "toHome";
type TransitionPhase = "idle" | "entering" | "covered" | "leaving";

const ENTER_DURATION = 1280;
const COVER_HOLD_DURATION = 180;
const EXIT_DURATION = 1080;
const ROUTE_TIMEOUT = 2800;

type ColumnTransitionOverlayProps = {
  columnLabel: string;
  gloryLabel: string;
};

export function ColumnTransitionOverlay({ columnLabel, gloryLabel }: ColumnTransitionOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [href, setHref] = useState("");
  const [direction, setDirection] = useState<TransitionDirection>("toColumn");
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const navigationTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const routeTimeoutRef = useRef<number | null>(null);
  const transitioningRef = useRef(false);

  const clearTimers = useCallback(() => {
    [navigationTimerRef, holdTimerRef, finishTimerRef, routeTimeoutRef].forEach((timer) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
    });
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    transitioningRef.current = false;
    setHref("");
    setPhase("idle");
  }, [clearTimers]);

  useEffect(() => {
    router.prefetch("/column");
    router.prefetch("/");

    const start = (nextHref: string, nextDirection: TransitionDirection) => {
      if (transitioningRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(nextHref);
        return;
      }

      transitioningRef.current = true;
      setHref(nextHref);
      setDirection(nextDirection);
      setPhase("entering");
      navigationTimerRef.current = window.setTimeout(() => {
        setPhase("covered");
        router.push(nextHref);
        routeTimeoutRef.current = window.setTimeout(() => setPhase("leaving"), ROUTE_TIMEOUT);
      }, ENTER_DURATION);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (document.body.classList.contains("devEditActive")) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const currentPath = window.location.pathname;
      const nextDirection = currentPath === "/" && url.pathname.startsWith("/column")
        ? "toColumn"
        : currentPath.startsWith("/column") && url.pathname === "/"
          ? "toHome"
          : null;
      if (!nextDirection) return;
      event.preventDefault();
      start(`${url.pathname}${url.search}${url.hash}`, nextDirection);
    };

    const onNavigate = (event: Event) => {
      const transitionEvent = event as CustomEvent<ColumnNavigateDetail>;
      const nextHref = transitionEvent.detail?.href;
      if (window.location.pathname !== "/" || !nextHref?.startsWith("/column")) return;
      transitionEvent.preventDefault();
      start(nextHref, "toColumn");
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("glory:column-navigate", onNavigate);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("glory:column-navigate", onNavigate);
      clearTimers();
      delete document.documentElement.dataset.columnTransition;
      delete document.documentElement.dataset.columnTransitionDirection;
      delete document.documentElement.dataset.columnTransitionPhase;
    };
  }, [clearTimers, router]);

  useEffect(() => {
    if (phase === "idle") {
      delete document.documentElement.dataset.columnTransition;
      delete document.documentElement.dataset.columnTransitionDirection;
      delete document.documentElement.dataset.columnTransitionPhase;
      return;
    }
    document.documentElement.dataset.columnTransition = "active";
    document.documentElement.dataset.columnTransitionDirection = direction === "toColumn" ? "to-column" : "to-home";
    document.documentElement.dataset.columnTransitionPhase = phase;
  }, [direction, phase]);

  useEffect(() => {
    if (phase !== "covered" || !href || typeof window === "undefined") return;
    const targetPath = new URL(href, window.location.origin).pathname;
    if (pathname !== targetPath || holdTimerRef.current !== null) return;
    if (routeTimeoutRef.current !== null) {
      window.clearTimeout(routeTimeoutRef.current);
      routeTimeoutRef.current = null;
    }
    holdTimerRef.current = window.setTimeout(() => setPhase("leaving"), COVER_HOLD_DURATION);
  }, [href, pathname, phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    finishTimerRef.current = window.setTimeout(finish, EXIT_DURATION);
  }, [finish, phase]);

  if (phase === "idle" || !href || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`${styles.layer} ${styles[direction]} ${styles[phase]}`}
      role="status"
      aria-live="polite"
      aria-label={direction === "toColumn" ? "원장 칼럼으로 이동 중" : "홈페이지로 이동 중"}
    >
      <div className={styles.dimmer} />
      <div className={styles.cover}>
        <div className={styles.masthead} aria-hidden="true"><strong {...textEditProps("home.transition.glory")}>{gloryLabel}</strong><i>/</i><span {...textEditProps("home.transition.column")}>{columnLabel}</span></div>
      </div>
    </div>,
    document.body,
  );
}
