"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { isVisualEditingMode } from "@/lib/motion";
import { ColumnSearch, type ColumnSearchProps } from "./ColumnSearch";
import { useDesktopMotion } from "./motion/useDesktopMotion";
import styles from "./ColumnBookmark.module.css";

type ColumnBookmarkProps = Pick<ColumnSearchProps, "columns" | "content" | "faqIndex" | "treatments">;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const mix = (start: number, end: number, progress: number) => start + (end - start) * progress;

type SourceBox = { left: number; top: number; width: number; height: number };

const ROOT_PROPERTIES = [
  "--column-main-header-height",
  "--column-main-header-border-opacity",
  "--column-main-header-shadow-opacity",
] as const;

function sanitizeClone(node: HTMLElement) {
  ["id", "data-edit-id", "data-edit-type", "data-edit-control", "data-column-search", "data-column-bookmark-title", "data-column-bookmark-search"].forEach((attribute) => node.removeAttribute(attribute));
  node.setAttribute("aria-hidden", "true");
  node.setAttribute("inert", "");
  node.querySelectorAll<HTMLElement>("*").forEach((child) => {
    ["id", "aria-controls", "aria-activedescendant", "data-edit-id", "data-edit-type", "data-edit-control", "data-column-search", "data-column-keyword", "data-column-search-box", "data-column-keywords"].forEach((attribute) => child.removeAttribute(attribute));
    child.setAttribute("tabindex", "-1");
  });
}

export function ColumnBookmark(props: ColumnBookmarkProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const titleCloneRef = useRef<HTMLDivElement>(null);
  const searchCloneRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);

  useEffect(() => { setPortalHost(document.body); }, []);
  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || bookmarkRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      bookmarkRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const desktop = useDesktopMotion();
  useEffect(() => {
    if (!desktop || !portalHost) return;
    const titleSource = document.querySelector<HTMLElement>("[data-column-bookmark-title]");
    const searchSource = document.querySelector<HTMLElement>("[data-column-bookmark-search]");
    const hero = titleSource?.closest<HTMLElement>("[data-column-hero]") ?? null;
    const fadeSources = Array.from(document.querySelectorAll<HTMLElement>("[data-column-bookmark-fade]"));
    const titleHost = titleCloneRef.current;
    const searchHost = searchCloneRef.current;
    const bookmark = bookmarkRef.current;
    const root = document.documentElement;
    if (!titleSource || !searchSource || !titleHost || !searchHost || !bookmark) return;

    const titleClone = titleSource.cloneNode(true) as HTMLElement;
    const searchClone = searchSource.cloneNode(true) as HTMLElement;
    sanitizeClone(titleClone);
    sanitizeClone(searchClone);
    titleClone.style.margin = "0";
    searchClone.style.margin = "0";
    titleHost.replaceChildren(titleClone);
    searchHost.replaceChildren(searchClone);

    let titleBox: SourceBox | null = null;
    let searchBox: SourceBox | null = null;
    let frame = 0;
    let needsMeasure = true;
    let lastReady = false;
    let disposed = false;
    let entrySettled = false;
    let entryWaitId = 0;
    let previousScrollY = window.scrollY;
    let targetY = window.scrollY;
    let smoothY = window.scrollY;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const setReadyState = (next: boolean) => {
      if (lastReady === next) return;
      lastReady = next;
      setReady(next);
    };

    const clearHeaderState = () => {
      root.removeAttribute("data-column-bookmark-started");
      ROOT_PROPERTIES.forEach((property) => root.style.removeProperty(property));
    };

    const resetSources = (updateState = true) => {
      titleSource.style.removeProperty("visibility");
      searchSource.style.removeProperty("visibility");
      fadeSources.forEach((node) => node.style.removeProperty("opacity"));
      titleHost.style.removeProperty("opacity");
      titleHost.style.removeProperty("transform");
      searchHost.style.removeProperty("opacity");
      searchHost.style.removeProperty("transform");
      bookmark.style.removeProperty("height");
      bookmark.style.removeProperty("opacity");
      bookmark.style.removeProperty("--bookmark-icon-opacity");
      clearHeaderState();
      if (updateState) setReadyState(false);
    };

    const measure = () => {
      if (!entrySettled) return false;
      const titleRect = titleSource.getBoundingClientRect();
      const searchRect = searchSource.getBoundingClientRect();
      titleBox = {
        left: titleRect.left + window.scrollX,
        top: titleRect.top + window.scrollY,
        width: titleRect.width,
        height: titleRect.height,
      };
      searchBox = {
        left: searchRect.left + window.scrollX,
        top: searchRect.top + window.scrollY,
        width: searchRect.width,
        height: searchRect.height,
      };
      titleClone.style.width = `${titleRect.width}px`;
      searchClone.style.width = `${searchRect.width}px`;
      needsMeasure = false;
      return true;
    };

    const setHeaderProgress = (progress: number) => {
      const headerProgress = range(progress, 0, .45);
      const headerHeight = mix(72, 56, headerProgress);
      root.style.setProperty("--column-main-header-height", `${headerHeight.toFixed(2)}px`);
      root.style.setProperty("--column-main-header-border-opacity", (0.22 * (1 - headerProgress)).toFixed(4));
      root.style.setProperty("--column-main-header-shadow-opacity", (0.22 * headerProgress).toFixed(4));
      root.toggleAttribute("data-column-bookmark-started", window.scrollY > 0);
      return headerHeight;
    };

    const update = (scrollY: number) => {
      if (window.innerWidth < 1024 || isVisualEditingMode() || document.body.classList.contains("devEditActive")) {
        resetSources();
        if (openRef.current) setOpen(false);
        return;
      }

      const progress = clamp(scrollY / 560);
      const headerHeight = setHeaderProgress(progress);

      if (reducedMotion.matches) {
        titleSource.style.removeProperty("visibility");
        searchSource.style.removeProperty("visibility");
        fadeSources.forEach((node) => node.style.removeProperty("opacity"));
        titleHost.style.opacity = "0";
        searchHost.style.opacity = "0";
        const visible = progress > .6;
        bookmark.style.height = visible ? "300px" : "0px";
        bookmark.style.opacity = visible ? "1" : "0";
        bookmark.style.setProperty("--bookmark-icon-opacity", visible ? "1" : "0");
        setReadyState(visible);
        if (!visible && openRef.current) setOpen(false);
        return;
      }

      if (!entrySettled) {
        titleSource.style.removeProperty("visibility");
        searchSource.style.removeProperty("visibility");
        titleHost.style.opacity = "0";
        searchHost.style.opacity = "0";
        bookmark.style.height = "0px";
        bookmark.style.opacity = "0";
        return;
      }
      if ((needsMeasure || !titleBox || !searchBox) && !measure()) return;
      if (!titleBox || !searchBox) return;

      const hasStarted = progress > .001;
      titleSource.style.visibility = hasStarted ? "hidden" : "visible";
      searchSource.style.visibility = hasStarted ? "hidden" : "visible";
      fadeSources.forEach((node) => {
        if (!hasStarted) node.style.removeProperty("opacity");
        else node.style.opacity = `${1 - range(progress, 0, .3)}`;
      });

      const eased = smoothstep(progress);
      const titleScale = Math.min(170 / titleBox.width, 64 / titleBox.height);
      const titleThickness = titleBox.height * titleScale;
      const titleTargetX = 32 + (84 + titleThickness) / 2;
      const titleTargetY = headerHeight + 26;
      const titleStartY = Math.max(titleBox.top - scrollY, headerHeight + 8);
      const titleX = mix(titleBox.left - window.scrollX, titleTargetX, eased);
      const titleY = mix(titleStartY, titleTargetY, eased);
      const titleRotation = 90 * smoothstep(range(progress, .5, .95));
      const titleCurrentScale = mix(1, titleScale, eased);
      titleHost.style.opacity = hasStarted ? "1" : "0";
      titleHost.style.transform = `translate3d(${titleX.toFixed(2)}px,${titleY.toFixed(2)}px,0) rotate(${titleRotation.toFixed(2)}deg) scale(${titleCurrentScale.toFixed(4)})`;

      const searchEased = smoothstep(range(progress, 0, .92));
      const searchScale = 40 / searchBox.width;
      const searchX = mix(searchBox.left - window.scrollX, 54, searchEased);
      const searchY = mix(searchBox.top - scrollY, headerHeight + 230, searchEased);
      searchHost.style.opacity = hasStarted ? `${1 - range(progress, .7, .92)}` : "0";
      searchHost.style.transform = `translate3d(${searchX.toFixed(2)}px,${searchY.toFixed(2)}px,0) scale(${mix(1, searchScale, searchEased).toFixed(4)})`;

      const bookmarkProgress = smoothstep(range(progress, .42, .9));
      const iconOpacity = range(progress, .92, .98);
      bookmark.style.height = `${(300 * bookmarkProgress).toFixed(2)}px`;
      bookmark.style.opacity = bookmarkProgress > 0 ? "1" : "0";
      bookmark.style.setProperty("--bookmark-icon-opacity", iconOpacity.toFixed(3));
      setReadyState(progress > .92);
      if (progress < .9 && openRef.current) {
        if (panelRef.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
        setOpen(false);
      }
    };

    const tick = () => {
      const difference = targetY - smoothY;
      if (reducedMotion.matches || Math.abs(difference) < .5) smoothY = targetY;
      else smoothY += difference * .14;
      update(smoothY);
      if (!reducedMotion.matches && Math.abs(targetY - smoothY) >= .5) frame = window.requestAnimationFrame(tick);
      else frame = 0;
    };

    const schedule = () => {
      targetY = window.scrollY;
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const waitForEntry = () => {
      if (entrySettled || !hero?.hasAttribute("data-column-entry-ready")) return;
      const waitId = ++entryWaitId;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const animations = [...new Set([
          ...titleSource.getAnimations({ subtree: true }),
          ...searchSource.getAnimations({ subtree: true }),
        ])];
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
          if (disposed || waitId !== entryWaitId) return;
          entrySettled = true;
          needsMeasure = true;
          schedule();
        });
      }));
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      if (previousScrollY <= 1 && currentY > 1 && entrySettled) needsMeasure = true;
      previousScrollY = currentY;
      schedule();
    };
    const scheduleMeasure = () => {
      needsMeasure = true;
      schedule();
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(titleSource);
    resizeObserver.observe(searchSource);
    const entryObserver = new MutationObserver(waitForEntry);
    if (hero) entryObserver.observe(hero, { attributes: true, attributeFilter: ["data-column-entry-ready"] });
    if (reducedMotion.matches || !hero) entrySettled = true;
    else waitForEntry();
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    update(smoothY);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    reducedMotion.addEventListener("change", scheduleMeasure);

    return () => {
      disposed = true;
      entryWaitId += 1;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
      reducedMotion.removeEventListener("change", scheduleMeasure);
      resizeObserver.disconnect();
      entryObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
      resetSources(false);
      titleHost.replaceChildren();
      searchHost.replaceChildren();
    };
  }, [desktop, portalHost]);

  if (!portalHost) return null;

  return createPortal(
    <div className={styles.layer}>
      <div ref={titleCloneRef} className={styles.titleClone} aria-hidden="true" />
      <div ref={searchCloneRef} className={styles.searchClone} aria-hidden="true" />
      <button
        ref={bookmarkRef}
        type="button"
        className={styles.bookmark}
        aria-label="칼럼 검색 열기"
        aria-expanded={open}
        aria-controls="column-bookmark-dialog"
        disabled={!ready}
        tabIndex={ready ? 0 : -1}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.searchDisc} aria-hidden="true"><MagnifyingGlassIcon /></span>
      </button>

      <section
        ref={panelRef}
        id="column-bookmark-dialog"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        role="dialog"
        aria-label="칼럼 검색"
        aria-hidden={!open}
      >
        <button type="button" className={styles.close} aria-label="칼럼 검색 닫기" onClick={() => { setOpen(false); bookmarkRef.current?.focus(); }}>
          <XMarkIcon aria-hidden="true" />
        </button>
        <span className={styles.eyebrow}>GLORY&apos;S COLUMN</span>
        <h2>무엇이 궁금하세요?</h2>
        <ColumnSearch {...props} idPrefix="column-bookmark-search" variant="bookmark" autoFocus={open} />
      </section>
    </div>,
    portalHost,
  );
}
