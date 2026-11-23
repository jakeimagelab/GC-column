"use client";

import { useEffect } from "react";
import { isVisualEditingMode } from "@/lib/motion";

const clamp = (value:number) => Math.min(1,Math.max(0,value));

export function ColumnDetailMotion() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>("[data-column-detail-page]");
    const hero = document.querySelector<HTMLElement>("[data-detail-hero]");
    if (!page || !hero) return;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-detail-reveal]"));
    const parallaxNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-detail-parallax]"));
    const activeParallax = new Set<HTMLElement>();
    const lastParallax = new WeakMap<HTMLElement,string>();
    const disabled = isVisualEditingMode() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let viewportHeight = window.innerHeight;
    let mobileScale = window.innerWidth <= 640 ? .5 : 1;
    let timingScale = window.innerWidth <= 640 ? .75 : 1;
    let entryStarted = false;
    let transitionObserver:MutationObserver | null = null;

    const startEntry = () => {
      if (entryStarted) return;
      entryStarted = true;
      hero.setAttribute("data-detail-entry-armed","");
      requestAnimationFrame(() => requestAnimationFrame(() => hero.setAttribute("data-detail-entry-ready","")));
    };

    if (disabled) {
      page.setAttribute("data-motion-disabled","");
      hero.setAttribute("data-detail-entry-ready","");
      reveals.forEach((node) => node.setAttribute("data-detail-reveal-active",""));
      return () => page.removeAttribute("data-motion-disabled");
    }

    const root = document.documentElement;
    if (root.dataset.columnTransition === "active" && root.dataset.columnTransitionDirection === "to-column") {
      transitionObserver = new MutationObserver(() => {
        if (root.dataset.columnTransition !== "arrived") return;
        startEntry();
        transitionObserver?.disconnect();
      });
      transitionObserver.observe(root,{ attributes:true, attributeFilter:["data-column-transition"] });
    } else startEntry();

    reveals.forEach((node) => {
      node.setAttribute("data-detail-reveal-ready","");
      node.querySelectorAll<HTMLElement>("tbody tr,[data-detail-stagger-item]").forEach((item,index) => {
        item.style.setProperty("--detail-delay",`${index*.1*timingScale}s`);
      });
    });

    const revealTargets = new Map<HTMLElement,HTMLElement>();
    reveals.forEach((node) => {
      const target = node.closest<HTMLElement>("[data-detail-reveal-observer]") ?? node;
      revealTargets.set(target,node);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        const node = revealTargets.get(target) ?? target;
        requestAnimationFrame(() => node.setAttribute("data-detail-reveal-active",""));
        observer.unobserve(target);
      });
    },{ threshold:.06, rootMargin:"0px 0px -6% 0px" });
    revealTargets.forEach((_,target) => observer.observe(target));

    const update = () => {
      frame = 0;
      activeParallax.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const amount = Number(node.dataset.detailParallax || 80)*mobileScale;
        const progress = clamp((viewportHeight-rect.top)/(viewportHeight+rect.height));
        const value = `${((progress-.5)*amount).toFixed(2)}px`;
        if (lastParallax.get(node) === value) return;
        node.style.setProperty("--detail-parallax-y",value);
        lastParallax.set(node,value);
      });
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const resize = () => {
      viewportHeight = window.innerHeight;
      mobileScale = window.innerWidth <= 640 ? .5 : 1;
      timingScale = window.innerWidth <= 640 ? .75 : 1;
      reveals.forEach((node) => {
        node.querySelectorAll<HTMLElement>("tbody tr,[data-detail-stagger-item]").forEach((item,index) => {
          item.style.setProperty("--detail-delay",`${index*.1*timingScale}s`);
        });
      });
      schedule();
    };
    const parallaxObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const node = entry.target as HTMLElement;
        if (entry.isIntersecting) activeParallax.add(node);
        else activeParallax.delete(node);
      });
      schedule();
    },{ rootMargin:"25% 0px 25% 0px" });
    parallaxNodes.forEach((node) => parallaxObserver.observe(node));
    update();
    window.addEventListener("scroll",schedule,{ passive:true });
    window.addEventListener("resize",resize);

    return () => {
      observer.disconnect();
      parallaxObserver.disconnect();
      transitionObserver?.disconnect();
      window.removeEventListener("scroll",schedule);
      window.removeEventListener("resize",resize);
      if (frame) cancelAnimationFrame(frame);
      hero.removeAttribute("data-detail-entry-armed");
      hero.removeAttribute("data-detail-entry-ready");
      reveals.forEach((node) => node.removeAttribute("data-detail-reveal-ready"));
      reveals.forEach((node) => node.querySelectorAll<HTMLElement>("tbody tr,[data-detail-stagger-item]").forEach((item) => item.style.removeProperty("--detail-delay")));
      parallaxNodes.forEach((node) => node.style.removeProperty("--detail-parallax-y"));
    };
  },[]);

  return null;
}
