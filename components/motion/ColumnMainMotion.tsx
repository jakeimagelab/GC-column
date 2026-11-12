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
      const reveal = desktop ? clamp((rawProgress - 0.03) / 0.34) : 1;
      const revealEased = 1 - Math.pow(1 - reveal, 3);
      const exit = desktop ? clamp((rawProgress - 0.42) / 0.58) : 0;
      const exitEased = exit * exit * (3 - 2 * exit);

      hero.style.setProperty("--column-hero-progress", rawProgress.toFixed(4));
      hero.style.setProperty("--column-search-opacity", (0.48 + revealEased * 0.52).toFixed(4));
      hero.style.setProperty("--column-search-y", `${((1 - revealEased) * 36).toFixed(2)}px`);
      hero.style.setProperty("--column-search-scale", (0.84 + revealEased * 0.16).toFixed(4));
      hero.style.setProperty("--column-search-clip", `${((1 - revealEased) * 42).toFixed(2)}%`);
      hero.style.setProperty("--column-panel-bottom", `${(exitEased * 32).toFixed(3)}svh`);
      hero.style.setProperty("--column-panel-radius", `${(exitEased * 18).toFixed(2)}px`);
      hero.style.setProperty("--column-panel-shadow", (exitEased * 0.16).toFixed(4));
      hero.style.setProperty("--column-copy-y", `${(exitEased * -12).toFixed(2)}px`);
      hero.style.setProperty("--column-copy-scale", (1 - exitEased * 0.16).toFixed(4));
      hero.style.setProperty("--column-copy-opacity", "1");
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
        "--column-search-opacity",
        "--column-search-y",
        "--column-search-scale",
        "--column-search-clip",
        "--column-panel-bottom",
        "--column-panel-radius",
        "--column-panel-shadow",
        "--column-copy-y",
        "--column-copy-scale",
        "--column-copy-opacity",
      ].forEach((property) => hero.style.removeProperty(property));
      sections.forEach((section) => {
        section.removeAttribute("data-column-motion-ready");
        section.removeAttribute("data-column-motion-active");
      });
    };
  }, []);

  return null;
}
