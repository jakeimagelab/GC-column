"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getText, type EquipmentContentItem, type SiteContent } from "@/content/site-content-types";
import { getTreatment } from "@/content/treatments";
import { TREATMENT_PAGES_READY } from "@/lib/config";
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
  const detailPath = getTreatment(item.id)?.detailPath;
  const cardContent = <>
    <div className={styles.imageWrap}><ImageSlot className={styles.equipmentSlot} label="" alt="" editId={duplicate ? undefined : `${editPrefix}.image`} image={item.image} /></div>
    <b>{duplicate ? item.name : <EditableRichText id={`${editPrefix}.name`} value={item.name} />}</b>
    <span>{duplicate ? item.desc : <EditableRichText id={`${editPrefix}.desc`} value={item.desc} />}</span>
    <small {...(!duplicate ? (TREATMENT_PAGES_READY ? { "data-edit-id": "home.equipment.related", "data-edit-type": "text" } : { "data-edit-id": "common.treatment.preparing", "data-edit-type": "text" }) : {})}>{TREATMENT_PAGES_READY ? getText(content, "home.equipment.related") : getText(content, "common.treatment.preparing")}</small>
  </>;

  return (
    <article className={styles.card} data-carousel-card data-motion-item={!duplicate ? "" : undefined} aria-hidden={duplicate || undefined}>
      {TREATMENT_PAGES_READY && detailPath
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
  const groupRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const nudgeTimer = useRef<number | null>(null);
  const [virtualIndex, setVirtualIndex] = useState(canRotate ? items.length : 0);
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [flowReady, setFlowReady] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [nudging, setNudging] = useState(false);

  const normalizedEditIndex = items.length ? ((virtualIndex % items.length) + items.length) % items.length : 0;
  const renderedEditItems = canRotate ? [items, items, items].flat() : items;
  const paused = interactionPaused || userPaused || reducedMotion || !flowReady;

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
      setFlowReady(false);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;
    let startTimer = 0;
    const play = () => {
      setRevealing(true);
      startTimer = window.setTimeout(() => setFlowReady(true), 1200);
    };
    if (!("IntersectionObserver" in window)) {
      play();
      return () => window.clearTimeout(startTimer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      play();
    }, { threshold: 0.18 });
    observer.observe(section);
    return () => { observer.disconnect(); window.clearTimeout(startTimer); };
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

  useEffect(() => {
    if (editMode || !canRotate || !flowReady) return;
    const timer = window.setInterval(() => {
      const animation = trackRef.current?.getAnimations()[0];
      const currentTime = Number(animation?.currentTime ?? 0);
      const nextIndex = Math.floor((((currentTime % 38000) + 38000) % 38000) / 38000 * items.length) % items.length;
      setDisplayIndex(nextIndex);
    }, 250);
    return () => window.clearInterval(timer);
  }, [canRotate, editMode, flowReady, items.length]);

  const moveFlow = (delta: number) => {
    if (!canRotate || editMode || nudging) return;
    const track = trackRef.current;
    const group = groupRef.current;
    const nudge = nudgeRef.current;
    const cards = group?.querySelectorAll<HTMLElement>("[data-carousel-card]");
    const first = cards?.[0];
    const second = cards?.[1];
    const distance = first && second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 0;
    const groupWidth = group?.offsetWidth ?? 0;
    const animation = track?.getAnimations()[0];
    if (!nudge || !animation || !distance || !groupWidth) return;

    setNudging(true);
    animation.pause();
    nudge.style.transition = reducedMotion ? "none" : "transform .6s cubic-bezier(.22,.61,.36,1)";
    nudge.style.transform = `translate3d(${delta * distance * -1}px,0,0)`;
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
    nudgeTimer.current = window.setTimeout(() => {
      const current = Number(animation.currentTime ?? 0);
      animation.currentTime = current + (delta * distance / groupWidth * 38000);
      nudge.style.transition = "none";
      nudge.style.transform = "translate3d(0,0,0)";
      void nudge.offsetWidth;
      if (!paused && !reducedMotion) animation.play();
      setDisplayIndex((value) => (value + delta + items.length) % items.length);
      setNudging(false);
    }, reducedMotion ? 0 : 620);
  };

  useEffect(() => () => {
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
  }, []);

  const editEquipment = (action: EquipmentAction, itemId: string) => {
    window.dispatchEvent(new CustomEvent("glory:equipment-command", { detail: { action, itemId } }));
  };

  return (
    <section
      ref={sectionRef}
      id="equipment"
      className={`${styles.section} ${revealing ? styles.revealing : ""} ${flowReady && canRotate && !editMode && !reducedMotion ? styles.flowing : ""} ${paused ? styles.paused : ""}`}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
    >
      <div className={styles.band} data-scroll-world-layer="counter" />
      <div className={styles.heading} data-scroll-world-layer="copy">
        <div>
          <span data-edit-id="home.equipment.eyebrow" data-edit-type="text">{getText(content, "home.equipment.eyebrow")}</span>
          <h2><EditableRichText id="home.equipment.title" value={getText(content, "home.equipment.title")} /></h2>
        </div>
        <div>
          <span data-edit-id="home.equipment.guide" data-edit-type="text">{getText(content, "home.equipment.guide")}</span>
          <button type="button" data-edit-control onClick={() => editMode ? moveEdit(-1) : moveFlow(-1)} aria-label="이전 장비" disabled={!canRotate}>‹</button>
          <button type="button" data-edit-control onClick={() => editMode ? moveEdit(1) : moveFlow(1)} aria-label="다음 장비" disabled={!canRotate}>›</button>
          {!editMode && canRotate ? <button type="button" className={styles.pauseButton} aria-pressed={userPaused} aria-label={userPaused ? "장비 흐름 재생" : "장비 흐름 멈춤"} onClick={() => setUserPaused((value) => !value)}>{userPaused ? "▶" : "Ⅱ"}</button> : null}
        </div>
      </div>
      <div className={styles.viewport} ref={viewportRef} data-scroll-world-layer="depth">
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
          <div ref={nudgeRef} className={styles.nudge}>
            <div ref={trackRef} className={styles.track}>
              <div ref={groupRef} className={styles.group}>{items.map((item) => <EquipmentCard item={item} content={content} itemCount={items.length} key={item.id} />)}</div>
              {canRotate ? <div className={styles.group} aria-hidden="true">{items.map((item) => <EquipmentCard item={item} content={content} duplicate itemCount={items.length} key={`copy-${item.id}`} />)}</div> : null}
            </div>
          </div>
        )}
      </div>
      <div className={styles.page}>{String((editMode ? normalizedEditIndex : displayIndex) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</div>
    </section>
  );
}
