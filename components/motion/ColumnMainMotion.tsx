"use client";

import { useEffect } from "react";
import { isVisualEditingMode } from "@/lib/motion";

const clamp = (value:number) => Math.min(1,Math.max(0,value));

export function ColumnMainMotion() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>("[data-column-page]");
    const hero = document.querySelector<HTMLElement>("[data-column-hero]");
    if (!page || !hero) return;

    const disabled = isVisualEditingMode() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-column-section-motion]"));
    const parallaxNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-column-parallax]"));
    const activeParallax = new Set<HTMLElement>();
    const lastParallax = new WeakMap<HTMLElement,string>();
    let frame = 0;
    let needsMeasure = true;
    let heroTop = 0;
    let heroTravel = 1;
    let viewportHeight = window.innerHeight;
    let distanceScale = window.innerWidth <= 640 ? .5 : 1;
    let lastHeroProgress = "";
    let lastHeroEased = "";
    let entryStarted = false;
    let transitionObserver:MutationObserver | null = null;

    const startEntry = () => {
      if (entryStarted) return;
      entryStarted = true;
      hero.setAttribute("data-column-entry-armed","");
      requestAnimationFrame(() => requestAnimationFrame(() => hero.setAttribute("data-column-entry-ready","")));
    };

    if (disabled) {
      page.setAttribute("data-motion-disabled","");
      hero.setAttribute("data-column-entry-ready","");
      sections.forEach((section) => section.setAttribute("data-column-motion-active",""));
      return () => {
        page.removeAttribute("data-motion-disabled");
        hero.removeAttribute("data-column-entry-ready");
      };
    }

    const root = document.documentElement;
    const transitionActive = root.dataset.columnTransition === "active" && root.dataset.columnTransitionDirection === "to-column";
    if (transitionActive) {
      transitionObserver = new MutationObserver(() => {
        if (root.dataset.columnTransition !== "arrived") return;
        startEntry();
        transitionObserver?.disconnect();
      });
      transitionObserver.observe(root,{ attributes:true, attributeFilter:["data-column-transition"] });
    } else startEntry();

    const measure = () => {
      viewportHeight = window.innerHeight;
      distanceScale = window.innerWidth <= 640 ? .5 : 1;
      heroTop = hero.getBoundingClientRect().top+window.scrollY;
      heroTravel = Math.max(hero.offsetHeight-viewportHeight,1);
      needsMeasure = false;
    };

    const update = () => {
      frame = 0;
      if (needsMeasure) measure();
      const desktop = window.innerWidth > 1024;
      const rawProgress = desktop ? clamp((window.scrollY-heroTop)/heroTravel) : 0;
      const exit = desktop ? clamp((rawProgress-.12)/.88) : 0;
      const eased = exit*exit*(3-2*exit);
      const progressValue = rawProgress.toFixed(4);
      const easedValue = eased.toFixed(4);

      if (progressValue !== lastHeroProgress) {
        hero.style.setProperty("--column-hero-progress",progressValue);
        lastHeroProgress = progressValue;
      }
      if (easedValue !== lastHeroEased) {
        hero.style.setProperty("--column-hero-eased",easedValue);
        lastHeroEased = easedValue;
      }
      if (!hero.hasAttribute("data-column-hero-ready")) hero.setAttribute("data-column-hero-ready","");

      activeParallax.forEach((node) => {
        const nodeRect = node.getBoundingClientRect();
        const range = Number(node.dataset.columnParallax || 60)*distanceScale;
        const progress = clamp((viewportHeight-nodeRect.top)/(viewportHeight+nodeRect.height));
        const value = `${((progress-.5)*range).toFixed(2)}px`;
        if (lastParallax.get(node) === value) return;
        node.style.setProperty("--column-parallax-y",value);
        lastParallax.set(node,value);
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    const scheduleMeasure = () => {
      needsMeasure = true;
      schedule();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target as HTMLElement;
        requestAnimationFrame(() => section.setAttribute("data-column-motion-active",""));
        observer.unobserve(section);
      });
    },{ threshold:.06, rootMargin:"0px 0px -6% 0px" });
    sections.forEach((section) => {
      section.setAttribute("data-column-motion-ready","");
      observer.observe(section);
    });

    const parallaxObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const node = entry.target as HTMLElement;
        if (entry.isIntersecting) activeParallax.add(node);
        else activeParallax.delete(node);
      });
      schedule();
    },{ rootMargin:"25% 0px 25% 0px" });
    parallaxNodes.forEach((node) => parallaxObserver.observe(node));

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(hero);
    update();
    window.addEventListener("scroll",schedule,{ passive:true });
    window.addEventListener("resize",scheduleMeasure);

    return () => {
      observer.disconnect();
      parallaxObserver.disconnect();
      resizeObserver.disconnect();
      transitionObserver?.disconnect();
      window.removeEventListener("scroll",schedule);
      window.removeEventListener("resize",scheduleMeasure);
      if (frame) window.cancelAnimationFrame(frame);
      hero.removeAttribute("data-column-entry-armed");
      hero.removeAttribute("data-column-entry-ready");
      hero.removeAttribute("data-column-hero-ready");
      ["--column-hero-progress","--column-hero-eased"].forEach((property) => hero.style.removeProperty(property));
      parallaxNodes.forEach((node) => node.style.removeProperty("--column-parallax-y"));
      sections.forEach((section) => {
        section.removeAttribute("data-column-motion-ready");
        section.removeAttribute("data-column-motion-active");
      });
    };
  },[]);

  return null;
}
