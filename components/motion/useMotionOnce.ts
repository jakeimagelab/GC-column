"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useDesktopMotion } from "./useDesktopMotion";
import { isVisualEditingMode } from "@/lib/motion";

export function motionDisabled() {
  return !window.matchMedia("(min-width: 1024px)").matches || isVisualEditingMode() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMotionOnce<T extends HTMLElement>(
  ref: RefObject<T | null>,
  armedClass: string,
  playingClass: string,
  options: { threshold?: number; rootMargin?: string; armBeforePlay?: boolean; onPlay?: (element: T) => void } = {},
) {
  const onPlayRef = useRef(options.onPlay);
  onPlayRef.current = options.onPlay;
  const threshold = options.threshold ?? 0.28;
  const rootMargin = options.rootMargin ?? "0px 0px -8%";
  const armBeforePlay = options.armBeforePlay ?? false;

  const desktop = useDesktopMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let armFrame = 0;
    let playFrame = 0;
    if (!desktop || motionDisabled()) {
      element.classList.remove(armedClass, playingClass);
      element.dataset.motionComplete = "true";
      return;
    }

    if (armBeforePlay) element.classList.add(armedClass);

    const setPlaying = () => {
      playFrame = requestAnimationFrame(() => {
        element.classList.add(playingClass);
        element.dataset.motionComplete = "true";
      });
    };

    const play = () => {
      onPlayRef.current?.(element);
      if (!armBeforePlay) element.classList.add(armedClass);
      // Keep the armed state on screen for one complete frame before playback.
      // Without the extra frame, elements already near the viewport during
      // hydration can receive both classes before the browser paints, making
      // the first highlight/reveal look as if it never animated.
      armFrame = requestAnimationFrame(setPlaying);
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
      threshold,
      rootMargin,
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (armFrame) cancelAnimationFrame(armFrame);
      if (playFrame) cancelAnimationFrame(playFrame);
      element.classList.remove(armedClass, playingClass);
      delete element.dataset.motionComplete;
    };
  }, [armBeforePlay, armedClass, desktop, playingClass, ref, rootMargin, threshold]);
}
