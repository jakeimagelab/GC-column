"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { isVisualEditingMode } from "@/lib/motion";
import { ColumnSearch, type ColumnSearchProps } from "./ColumnSearch";
import styles from "./ColumnBookmark.module.css";

type ColumnBookmarkProps = Pick<ColumnSearchProps, "columns" | "content" | "faqIndex" | "treatments">;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const mix = (start: number, end: number, progress: number) => start + (end - start) * progress;

type SourceBox = { left: number; top: number; width: number; height: number };

function sanitizeClone(node: HTMLElement) {
  ["id", "data-edit-id", "data-edit-type", "data-edit-control", "data-column-search", "data-column-bookmark-title", "data-column-bookmark-search"].forEach((attribute) => node.removeAttribute(attribute));
  node.setAttribute("aria-hidden", "true");
  node.setAttribute("inert", "");
  node.querySelectorAll<HTMLElement>("*").forEach((child) => {
    ["id", "aria-controls", "aria-activedescendant", "data-edit-id", "data-edit-type", "data-edit-control", "data-column-entry", "data-column-keyword", "data-column-search-box", "data-column-keywords"].forEach((attribute) => child.removeAttribute(attribute));
    child.setAttribute("tabindex", "-1");
  });
}

export function ColumnBookmark(props: ColumnBookmarkProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const titleCloneRef = useRef<HTMLDivElement>(null);
  const searchCloneRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);

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

  useEffect(() => {
    const titleSource = document.querySelector<HTMLElement>("[data-column-bookmark-title]");
    const searchSource = document.querySelector<HTMLElement>("[data-column-bookmark-search]");
    const fadeSources = Array.from(document.querySelectorAll<HTMLElement>("[data-column-bookmark-fade]"));
    const titleHost = titleCloneRef.current;
    const searchHost = searchCloneRef.current;
    const bookmark = bookmarkRef.current;
    if (!titleSource || !searchSource || !titleHost || !searchHost || !bookmark) return;

    const titleClone = titleSource.cloneNode(true) as HTMLElement;
    const searchCloneSource = searchSource.querySelector<HTMLElement>("[data-column-search]") ?? searchSource;
    const searchClone = searchCloneSource.cloneNode(true) as HTMLElement;
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const setReadyState = (next: boolean) => {
      if (lastReady === next) return;
      lastReady = next;
      setReady(next);
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
      if (updateState) setReadyState(false);
    };

    const measure = () => {
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
    };

    const update = () => {
      frame = 0;
      if (window.innerWidth < 1024 || isVisualEditingMode() || document.body.classList.contains("devEditActive")) {
        resetSources();
        if (openRef.current) setOpen(false);
        return;
      }
      if (needsMeasure || !titleBox || !searchBox) measure();
      if (!titleBox || !searchBox) return;

      const progress = clamp(window.scrollY / 560);
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
      const titleTargetY = 24;
      const titleX = mix(titleBox.left - window.scrollX, titleTargetX, eased);
      const titleY = mix(titleBox.top - window.scrollY, titleTargetY, eased);
      const titleRotation = 90 * smoothstep(range(progress, .5, .95));
      const titleCurrentScale = mix(1, titleScale, eased);
      titleHost.style.opacity = hasStarted ? "1" : "0";
      titleHost.style.transform = `translate3d(${titleX.toFixed(2)}px,${titleY.toFixed(2)}px,0) rotate(${titleRotation.toFixed(2)}deg) scale(${titleCurrentScale.toFixed(4)})`;

      const searchEased = smoothstep(range(progress, 0, .92));
      const searchScale = 40 / searchBox.width;
      const searchX = mix(searchBox.left - window.scrollX, 54, searchEased);
      const searchY = mix(searchBox.top - window.scrollY, 236, searchEased);
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

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const scheduleMeasure = () => {
      needsMeasure = true;
      schedule();
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(titleSource);
    resizeObserver.observe(searchSource);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    reducedMotion.addEventListener("change", schedule);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleMeasure);
      reducedMotion.removeEventListener("change", schedule);
      resizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
      resetSources(false);
      titleHost.replaceChildren();
      searchHost.replaceChildren();
    };
  }, []);

  return (
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
    </div>
  );
}
