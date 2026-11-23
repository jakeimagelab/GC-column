"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { getText, type EquipmentContentItem, type SiteContent } from "@/content/site-content-types";
import { isVisualEditingMode } from "@/lib/motion";
import { EditableRichText } from "./EditableRichText";
import { ImageSlot } from "./ImageSlot";
import styles from "./EquipmentCarousel.module.css";

type EquipmentCarouselProps = { items: EquipmentContentItem[]; content: SiteContent };
type EquipmentAction = "add" | "delete" | "moveBefore" | "moveAfter";

type EquipmentCardProps = {
  item: EquipmentContentItem;
  content: SiteContent;
  duplicate?: boolean;
  editMode?: boolean;
  onEdit?: (action: EquipmentAction, itemId: string) => void;
  itemCount: number;
};

function EquipmentCard({ item, content, duplicate = false, editMode = false, onEdit, itemCount }: EquipmentCardProps) {
  const editPrefix = `home.equipment.items.${item.id}`;
  const detailPath = item.link.trim();
  const cardContent = <>
    <div className={styles.imageWrap}>
      <ImageSlot className={styles.equipmentSlot} label="" alt="" editId={duplicate ? undefined : `${editPrefix}.image`} image={item.image} />
      <div className={styles.benefitPanel} aria-hidden="true"><small {...(!duplicate ? { "data-edit-id": "home.equipment.hoverLabel", "data-edit-type": "text" } : {})}>{getText(content, "home.equipment.hoverLabel")}</small><span {...(!duplicate ? { "data-edit-id": `${editPrefix}.hover`, "data-edit-type": "text" } : {})}>{item.hover ?? item.desc}</span></div>
    </div>
    <b>{duplicate ? item.name : <EditableRichText id={`${editPrefix}.name`} value={item.name} />}</b>
    <span>{duplicate ? item.desc : <EditableRichText id={`${editPrefix}.desc`} value={item.desc} />}</span>
    {detailPath ? <small {...(!duplicate ? { "data-edit-id": "home.equipment.related", "data-edit-type": "text" } : {})}>{getText(content, "home.equipment.related")}</small> : null}
  </>;

  return (
    <article
      className={styles.card}
      data-carousel-card
      data-motion-item={!duplicate ? "" : undefined}
      aria-hidden={duplicate || undefined}
      aria-label={!duplicate ? `${item.name}: ${item.desc.replaceAll("\n", " ")}` : undefined}
      tabIndex={!duplicate && !detailPath ? 0 : undefined}
    >
      {detailPath
        ? <Link href={detailPath} tabIndex={duplicate ? -1 : undefined}>{cardContent}</Link>
        : <div className={styles.disabledCard} role="link" aria-disabled="true">{cardContent}</div>}
      {editMode && onEdit ? (
        <div className={styles.editControls} data-dev-editor>
          <button type="button" data-edit-control onClick={() => onEdit("add", item.id)}>+ 장비 추가</button>
          <button type="button" data-edit-control onClick={() => onEdit("delete", item.id)} disabled={itemCount <= 1}>삭제</button>
          <button type="button" data-edit-control onClick={() => onEdit("moveBefore", item.id)} aria-label={`${item.name} 앞으로 이동`}>◀</button>
          <button type="button" data-edit-control onClick={() => onEdit("moveAfter", item.id)} aria-label={`${item.name} 뒤로 이동`}>▶</button>
        </div>
      ) : null}
    </article>
  );
}

export function EquipmentCarousel({ items, content }: EquipmentCarouselProps) {
  const [editMode, setEditMode] = useState(false);
  const canRotate = items.length > 5;
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const preventClick = useRef(false);
  const [virtualIndex, setVirtualIndex] = useState(canRotate ? items.length : 0);
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const normalizedEditIndex = items.length ? ((virtualIndex % items.length) + items.length) % items.length : 0;
  const renderedEditItems = canRotate ? [items, items, items].flat() : items;
  const renderedManualItems = canRotate ? [items, items].flat() : items;

  useEffect(() => {
    const editing = isVisualEditingMode();
    setEditMode(editing);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (editMode || reducedMotion) {
      setRevealing(false);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;
    const play = () => setRevealing(true);
    if (!("IntersectionObserver" in window)) {
      play();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      play();
    }, { threshold: 0.18 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [editMode, reducedMotion]);

  useEffect(() => {
    setTransitioning(false);
    setVirtualIndex(canRotate ? items.length : 0);
  }, [canRotate, items.length]);

  useEffect(() => {
    if (!editMode) return;
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
  }, [editMode, renderedEditItems.length]);

  const updateManualPosition = useCallback(() => {
    if (editMode) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-carousel-card]");
    const cardStep = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0]?.offsetWidth ?? viewport.clientWidth;
    const loopWidth = cards.length > items.length ? cards[items.length].offsetLeft - cards[0].offsetLeft : 0;
    const loopPosition = loopWidth > 0 ? viewport.scrollLeft % loopWidth : viewport.scrollLeft;
    const index = cardStep ? Math.round(loopPosition / cardStep) % Math.max(items.length, 1) : 0;
    setDisplayIndex((current) => current === index ? current : index);
    setCanScrollPrev(canRotate || viewport.scrollLeft > 2);
    setCanScrollNext(canRotate || viewport.scrollLeft < Math.max(0, viewport.scrollWidth - viewport.clientWidth) - 2);
  }, [canRotate, editMode, items.length]);

  useEffect(() => {
    if (editMode) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    viewport.scrollLeft = 0;
    const observer = new ResizeObserver(updateManualPosition);
    observer.observe(viewport);
    observer.observe(track);
    const frame = window.requestAnimationFrame(updateManualPosition);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [editMode, items.length, updateManualPosition]);

  useEffect(() => {
    if (editMode || reducedMotion || dragging || !canRotate) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    let frame = 0;
    let previous = 0;
    const startAt = performance.now() + 1200;
    const rotate = (time: number) => {
      const cards = track.querySelectorAll<HTMLElement>("[data-carousel-card]");
      const loopWidth = cards.length > items.length ? cards[items.length].offsetLeft - cards[0].offsetLeft : 0;
      if (time >= startAt && previous && loopWidth > 0) {
        viewport.scrollLeft += Math.min(time - previous, 40) * 0.026;
        if (viewport.scrollLeft >= loopWidth) viewport.scrollLeft -= loopWidth;
      }
      previous = time;
      frame = window.requestAnimationFrame(rotate);
    };
    frame = window.requestAnimationFrame(rotate);
    return () => window.cancelAnimationFrame(frame);
  }, [canRotate, dragging, editMode, items.length, reducedMotion]);

  const moveEdit = useCallback((delta: number) => {
    if (!canRotate || transitioning) return;
    setTransitioning(true);
    setVirtualIndex((current) => current + delta);
  }, [canRotate, transitioning]);

  const finishEditMove = () => {
    if (!canRotate) return;
    let next = virtualIndex;
    if (virtualIndex >= items.length * 2) next = virtualIndex - items.length;
    else if (virtualIndex <= 0) next = virtualIndex + items.length;
    setTransitioning(false);
    if (next !== virtualIndex) setVirtualIndex(next);
  };

  const moveManual = (delta: number) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-carousel-card]");
    const distance = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0]?.offsetWidth ?? viewport.clientWidth;
    const loopWidth = cards.length > items.length ? cards[items.length].offsetLeft - cards[0].offsetLeft : 0;
    if (delta < 0 && loopWidth > 0 && viewport.scrollLeft < distance) viewport.scrollLeft += loopWidth;
    viewport.scrollBy({ left: distance * delta, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (editMode || event.pointerType !== "mouse" || event.button !== 0) return;
    dragState.current = { active: true, startX: event.clientX, startScrollLeft: event.currentTarget.scrollLeft, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag.active) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.moved = true;
    event.currentTarget.scrollLeft = drag.startScrollLeft - distance;
    if (drag.moved) event.preventDefault();
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag.active) return;
    drag.active = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.moved) return;
    preventClick.current = true;
    window.setTimeout(() => { preventClick.current = false; }, 0);
    const cards = trackRef.current?.querySelectorAll<HTMLElement>("[data-carousel-card]");
    const distance = cards && cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    if (!distance) return;
    const next = Math.round(event.currentTarget.scrollLeft / distance);
    event.currentTarget.scrollTo({ left: next * distance, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const editEquipment = (action: EquipmentAction, itemId: string) => {
    window.dispatchEvent(new CustomEvent("glory:equipment-command", { detail: { action, itemId } }));
  };

  return (
    <section
      ref={sectionRef}
      id="equipment"
      data-scroll-world-scene
      className={`${styles.section} ${revealing ? styles.revealing : ""}`}
    >
      <div className={styles.band} data-scroll-world-layer="counter" />
      <div className={styles.heading} data-scroll-world-layer="copy">
        <div>
          <span data-edit-id="home.equipment.eyebrow" data-edit-type="text">{getText(content, "home.equipment.eyebrow")}</span>
          <h2><EditableRichText id="home.equipment.title" value={getText(content, "home.equipment.title")} /></h2>
        </div>
        <div>
          <span data-edit-id="home.equipment.guide" data-edit-type="text">{getText(content, "home.equipment.guide")}</span>
          <button type="button" data-edit-control onClick={() => editMode ? moveEdit(-1) : moveManual(-1)} aria-label="이전 장비" disabled={editMode ? !canRotate : !canScrollPrev}>‹</button>
          <button type="button" data-edit-control onClick={() => editMode ? moveEdit(1) : moveManual(1)} aria-label="다음 장비" disabled={editMode ? !canRotate : !canScrollNext}>›</button>
        </div>
      </div>
      <div
        className={`${styles.viewport} ${!editMode && canRotate ? styles.viewportAuto : ""} ${dragging ? styles.viewportDragging : ""}`}
        ref={viewportRef}
        data-scroll-world-layer="depth"
        onScroll={updateManualPosition}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        onClickCapture={(event) => { if (preventClick.current) { event.preventDefault(); event.stopPropagation(); } }}
      >
        {editMode ? (
          <div
            ref={trackRef}
            className={`${styles.track} ${styles.editTrack} ${transitioning ? styles.moving : ""}`}
            style={{ "--equipment-x": `${step * virtualIndex * -1}px` } as CSSProperties}
            onTransitionEnd={finishEditMove}
          >
            {renderedEditItems.map((item, renderedIndex) => {
              const editableCopy = !canRotate || (renderedIndex >= items.length && renderedIndex < items.length * 2);
              return <EquipmentCard item={item} content={content} editMode={editableCopy} onEdit={editEquipment} itemCount={items.length} key={`${renderedIndex}-${item.id}`} />;
            })}
          </div>
        ) : (
          <div ref={trackRef} className={`${styles.track} ${styles.manualTrack}`}>
            {renderedManualItems.map((item, renderedIndex) => <EquipmentCard item={item} content={content} itemCount={items.length} duplicate={renderedIndex >= items.length} key={`${renderedIndex}-${item.id}`} />)}
          </div>
        )}
      </div>
      <div className={styles.page}>{String((editMode ? normalizedEditIndex : displayIndex) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</div>
    </section>
  );
}
