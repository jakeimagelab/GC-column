"use client";

import { useEffect, type RefObject } from "react";

export function motionDisabled() {
  return new URLSearchParams(window.location.search).get("edit") === "1" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMotionOnce<T extends HTMLElement>(
  ref: RefObject<T | null>,
  armedClass: string,
  playingClass: string,
  options: { threshold?: number; rootMargin?: string; onPlay?: (element: T) => void } = {},
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || motionDisabled()) return;

    const play = () => {
      element.classList.add(armedClass);
      options.onPlay?.(element);
      void element.offsetWidth;
      requestAnimationFrame(() => element.classList.add(playingClass));
    };

    if (!("IntersectionObserver" in window)) {
      play();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      play();
    }, {
      threshold: options.threshold ?? 0.28,
      rootMargin: options.rootMargin ?? "0px 0px -8%",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [armedClass, options, playingClass, ref]);
}
