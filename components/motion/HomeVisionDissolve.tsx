"use client";

import { useEffect } from "react";
import { isVisualEditingMode } from "@/lib/motion";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function segment(progress: number, start: number, end: number) {
  return clamp((progress - start) / (end - start));
}

function mixChannel(from: number, to: number, progress: number) {
  return Math.round(from + (to - from) * progress);
}

function mixColor(from: [number, number, number], to: [number, number, number], progress: number) {
  return `rgb(${mixChannel(from[0], to[0], progress)} ${mixChannel(from[1], to[1], progress)} ${mixChannel(from[2], to[2], progress)})`;
}

export function HomeVisionDissolve() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>("[data-home-vision]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!section || window.matchMedia("(max-width: 767px)").matches) return;

    let frame = 0;
    let targetY = window.scrollY;
    let smoothY = window.scrollY;

    const update = (scrollY: number) => {
      if (reducedMotion.matches || isVisualEditingMode()) {
        section.removeAttribute("data-vision-motion-ready");
        return;
      }

      const rect = section.getBoundingClientRect();
      const rectTop = rect.top + window.scrollY - scrollY;
      const headerHeight = window.innerWidth <= 640 ? 56 : window.innerWidth <= 1023 ? 64 : 72;
      const stickyHeight = Math.max(window.innerHeight - headerHeight, 1);
      const travel = Math.max(rect.height - stickyHeight, 1);
      const progress = clamp((headerHeight - rectTop) / travel);
      const dissolve = segment(progress, 0.18, 0.42);
      const scaleProgress = segment(progress, 0.18, 1);
      const mobile = window.innerWidth <= 640;
      const cardDistance = mobile ? 24 : 48;

      section.setAttribute("data-vision-motion-ready", "");
      section.style.setProperty("--vision-progress", progress.toFixed(4));
      section.style.setProperty("--vision-photo-opacity", (dissolve * 0.85).toFixed(4));
      section.style.setProperty("--vision-photo-scale", (1.08 - 0.08 * scaleProgress).toFixed(4));
      section.style.setProperty("--vision-title-color", mixColor([43, 43, 43], [255, 255, 255], dissolve));
      section.style.setProperty("--vision-body-color", mixColor([94, 94, 94], [232, 226, 219], dissolve));
      section.style.setProperty("--vision-label-color", mixColor([110, 96, 82], [214, 200, 184], dissolve));
      section.style.setProperty("--vision-outline-color", mixColor([205, 190, 173], [255, 255, 255], dissolve));
      section.style.setProperty("--vision-outline-opacity", (1 - 0.78 * dissolve).toFixed(4));

      for (let index = 0; index < 3; index += 1) {
        const cardProgress = segment(progress, 0.46 + index * 0.13, 0.60 + index * 0.13);
        section.style.setProperty(`--vision-card-${index + 1}-opacity`, cardProgress.toFixed(4));
        section.style.setProperty(`--vision-card-${index + 1}-y`, `${((1 - cardProgress) * cardDistance).toFixed(2)}px`);
      }
    };

    const tick = () => {
      const direct = reducedMotion.matches || isVisualEditingMode();
      const difference = targetY - smoothY;
      if (direct || Math.abs(difference) < .5) smoothY = targetY;
      else smoothY += difference * .14;
      update(smoothY);
      if (!direct && Math.abs(targetY - smoothY) >= .5) frame = window.requestAnimationFrame(tick);
      else frame = 0;
    };

    const schedule = () => {
      targetY = window.scrollY;
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    update(smoothY);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    const editModeObserver = new MutationObserver(schedule);
    editModeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      editModeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      section.removeAttribute("data-vision-motion-ready");
      [
        "--vision-progress",
        "--vision-photo-opacity",
        "--vision-photo-scale",
        "--vision-title-color",
        "--vision-body-color",
        "--vision-label-color",
        "--vision-outline-color",
        "--vision-outline-opacity",
        "--vision-card-1-opacity",
        "--vision-card-1-y",
        "--vision-card-2-opacity",
        "--vision-card-2-y",
        "--vision-card-3-opacity",
        "--vision-card-3-y",
      ].forEach((property) => section.style.removeProperty(property));
    };
  }, []);

  return null;
}
