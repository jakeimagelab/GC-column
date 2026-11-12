"use client";

import { useEffect } from "react";
import { isVisualEditingMode } from "@/lib/motion";
import styles from "./ScrollWorldJourney.module.css";

type ScrollWorldJourneyProps = {
  sceneSelector: string;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function ScrollWorldJourney({ sceneSelector }: ScrollWorldJourneyProps) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || isVisualEditingMode()) return;

    const scenes = Array.from(document.querySelectorAll<HTMLElement>(sceneSelector));
    if (!scenes.length) return;

    const root = document.documentElement;
    let frame = 0;

    scenes.forEach((scene, index) => {
      scene.dataset.scrollWorldScene = String(index + 1);
    });

    const update = () => {
      frame = 0;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const mobileFactor = window.innerWidth <= 640 ? 0.56 : window.innerWidth <= 1024 ? 0.76 : 1;

      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
        const centerDistance = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const proximity = clamp(1 - Math.abs(centerDistance));
        const drift = clamp(centerDistance, -1.25, 1.25) * 28 * mobileFactor;

        scene.style.setProperty("--sw-depth-y", `${drift.toFixed(2)}px`);
        scene.style.setProperty("--sw-copy-y", `${(drift * 0.48).toFixed(2)}px`);
        scene.style.setProperty("--sw-counter-y", `${(drift * -0.34).toFixed(2)}px`);
        scene.style.setProperty("--sw-depth-scale", (1.022 - proximity * 0.022).toFixed(4));
        scene.style.setProperty("--sw-scene-progress", progress.toFixed(4));
        scene.toggleAttribute("data-scroll-world-active", proximity > 0.54);
      });

      root.classList.add(styles.ready);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove(styles.ready);
      scenes.forEach((scene) => {
        delete scene.dataset.scrollWorldScene;
        scene.removeAttribute("data-scroll-world-active");
        scene.style.removeProperty("--sw-depth-y");
        scene.style.removeProperty("--sw-copy-y");
        scene.style.removeProperty("--sw-counter-y");
        scene.style.removeProperty("--sw-depth-scale");
        scene.style.removeProperty("--sw-scene-progress");
      });
    };
  }, [sceneSelector]);

  return null;
}
