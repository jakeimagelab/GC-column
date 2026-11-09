"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  attributeEditProps,
  getText,
  type EquipmentContentItem,
  type SiteContent,
} from "@/content/site-content-types";
import { EditableRichText } from "./EditableRichText";
import { ImageSlot } from "./ImageSlot";
import styles from "./EquipmentCarousel.module.css";

type EquipmentCarouselProps = { items: EquipmentContentItem[]; content: SiteContent };
type EquipmentAction = "add" | "delete" | "moveBefore" | "moveAfter";

export function EquipmentCarousel({ items, content }: EquipmentCarouselProps) {
  const [editMode, setEditMode] = useState(false);
  const canRotate = items.length > 5;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [virtualIndex, setVirtualIndex] = useState(canRotate ? items.length : 0);
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const normalizedIndex = items.length
    ? ((virtualIndex % items.length) + items.length) % items.length
    : 0;
  const renderedItems = canRotate ? [items, items, items].flat() : items;

  useEffect(() => setEditMode(process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("edit") === "1"), []);

  useEffect(() => {
    setTransitioning(false);
    setVirtualIndex(canRotate ? items.length : 0);
  }, [canRotate, items.length]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-carousel-card]");
      if (cards.length > 1) setStep(cards[1].offsetLeft - cards[0].offsetLeft);
      else setStep(viewport.clientWidth);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [renderedItems.length]);

  const move = useCallback((delta: number) => {
    if (!canRotate || transitioning) return;
    setTransitioning(true);
    setVirtualIndex((current) => current + delta);
  }, [canRotate, transitioning]);

  useEffect(() => {
    if (editMode || paused || reducedMotion || !canRotate) return;
    const timer = window.setInterval(() => move(1), 3500);
    return () => window.clearInterval(timer);
  }, [canRotate, editMode, move, paused, reducedMotion]);

  const finishMove = () => {
    if (!canRotate) return;
    let next = virtualIndex;
    if (virtualIndex >= items.length * 2) next = virtualIndex - items.length;
    else if (virtualIndex <= 0) next = virtualIndex + items.length;
    setTransitioning(false);
    if (next !== virtualIndex) setVirtualIndex(next);
  };

  const editEquipment = (action: EquipmentAction, itemId: string) => {
    window.dispatchEvent(new CustomEvent("glory:equipment-command", { detail: { action, itemId } }));
  };

  return (
    <section
      className={styles.section}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className={styles.band} />
      <div className={styles.heading}>
        <div>
          <span data-edit-id="home.equipment.eyebrow" data-edit-type="text">{getText(content, "home.equipment.eyebrow")}</span>
          <h2><EditableRichText id="home.equipment.title" value={getText(content, "home.equipment.title")} /></h2>
        </div>
        <div>
          <span data-edit-id="home.equipment.guide" data-edit-type="text">{getText(content, "home.equipment.guide")}</span>
          <button type="button" data-edit-control onClick={() => move(-1)} aria-label="이전 장비" disabled={!canRotate}>‹</button>
          <button type="button" data-edit-control onClick={() => move(1)} aria-label="다음 장비" disabled={!canRotate}>›</button>
        </div>
      </div>
      <div className={styles.viewport} ref={viewportRef}>
        <div
          ref={trackRef}
          className={`${styles.track} ${transitioning ? styles.moving : ""}`}
          style={{ "--equipment-x": `${step * virtualIndex * -1}px` } as CSSProperties}
          onTransitionEnd={finishMove}
        >
          {renderedItems.map((item, renderedIndex) => {
            const editPrefix = `home.equipment.items.${item.id}`;
            const editableCopy = !canRotate || (renderedIndex >= items.length && renderedIndex < items.length * 2);
            return (
              <article className={styles.card} data-carousel-card key={`${renderedIndex}-${item.id}`}>
                <Link href={item.link || "#"} {...attributeEditProps(`${editPrefix}.link`, "href")}>
                  <div className={styles.imageWrap}><ImageSlot className={styles.equipmentSlot} label="" alt="" editId={`${editPrefix}.image`} image={item.image} /></div>
                  <b><EditableRichText id={`${editPrefix}.name`} value={item.name} /></b>
                  <span><EditableRichText id={`${editPrefix}.desc`} value={item.desc} /></span>
                  <small data-edit-id="home.equipment.related" data-edit-type="text">{getText(content, "home.equipment.related")}</small>
                </Link>
                {editMode && editableCopy ? (
                  <div className={styles.editControls} data-dev-editor>
                    <button type="button" data-edit-control onClick={() => editEquipment("add", item.id)}>+ 장비 추가</button>
                    <button type="button" data-edit-control onClick={() => editEquipment("delete", item.id)} disabled={items.length <= 1}>삭제</button>
                    <button type="button" data-edit-control onClick={() => editEquipment("moveBefore", item.id)} aria-label={`${item.name} 앞으로 이동`}>◀</button>
                    <button type="button" data-edit-control onClick={() => editEquipment("moveAfter", item.id)} aria-label={`${item.name} 뒤로 이동`}>▶</button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
      <div className={styles.page}>{String(normalizedIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</div>
    </section>
  );
}
