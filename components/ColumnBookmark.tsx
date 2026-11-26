"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ColumnSearch, type ColumnSearchProps } from "./ColumnSearch";
import styles from "./ColumnBookmark.module.css";

type ColumnBookmarkProps = Pick<ColumnSearchProps, "columns" | "content" | "faqIndex" | "treatments">;

export function ColumnBookmark(props: ColumnBookmarkProps) {
  const [open, setOpen] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => { setPortalHost(document.body); }, []);

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

  if (!portalHost) return null;

  return createPortal(
    <div className={styles.layer}>
      <button
        ref={bookmarkRef}
        type="button"
        className={styles.bookmark}
        aria-label="칼럼 검색 열기"
        aria-expanded={open}
        aria-controls="column-bookmark-dialog"
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
