"use client";

import { useEffect } from "react";
import { isVisualEditingMode } from "@/lib/motion";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ColumnMainMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-column-hero]");
    if (!hero || isVisualEditingMode() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const updateHero = () => {
      frame = 0;
      const desktop = window.innerWidth > 1024;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const rawProgress = desktop ? clamp(-rect.top / travel) : 1;
      const exit = desktop ? clamp((rawProgress - 0.12) / 0.88) : 0;
      const exitEased = exit * exit * (3 - 2 * exit);

      hero.style.setProperty("--column-hero-progress", rawProgress.toFixed(4));
      hero.style.setProperty("--column-panel-clip", `${(exitEased * 32).toFixed(3)}svh`);
      hero.style.setProperty("--column-copy-y", `${(exitEased * -16).toFixed(3)}svh`);
      hero.style.setProperty("--column-copy-scale", (1 - exitEased * 0.16).toFixed(4));
      hero.setAttribute("data-column-hero-ready", "");
    };

    const requestHeroUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHero);
    };

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-column-section-motion]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target as HTMLElement;
        section.setAttribute("data-column-motion-ready", "");
        window.requestAnimationFrame(() => section.setAttribute("data-column-motion-active", ""));
        observer.unobserve(section);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8%" });

    sections.forEach((section) => observer.observe(section));
    updateHero();
    window.addEventListener("scroll", requestHeroUpdate, { passive: true });
    window.addEventListener("resize", requestHeroUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestHeroUpdate);
      window.removeEventListener("resize", requestHeroUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      hero.removeAttribute("data-column-hero-ready");
      [
        "--column-hero-progress",
        "--column-panel-clip",
        "--column-copy-y",
        "--column-copy-scale",
      ].forEach((property) => hero.style.removeProperty(property));
      sections.forEach((section) => {
        section.removeAttribute("data-column-motion-ready");
        section.removeAttribute("data-column-motion-active");
      });
    };
  }, []);

  return null;
}
