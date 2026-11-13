"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { isVisualEditingMode } from "@/lib/motion";
import { ImageSlot } from "./ImageSlot";
import styles from "./PrinciplesHeroSlider.module.css";

type PrinciplesHeroSliderProps = {
  content: SiteContent;
};

const principles = [
  {
    no: "01",
    titleId: "column.principles.0.title",
    descriptionId: "column.principles.0.description",
    imageId: "column.principles.photo",
  },
  {
    no: "02",
    titleId: "column.principles.1.title",
    descriptionId: "column.principles.1.description",
    imageId: "column.principles.1.image",
  },
  {
    no: "03",
    titleId: "column.principles.2.title",
    descriptionId: "column.principles.2.description",
    imageId: "column.principles.2.image",
  },
] as const;

export function PrinciplesHeroSlider({ content }: PrinciplesHeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dragStart = useRef<number | null>(null);
  const paused = interactionPaused || userPaused || editMode || reducedMotion;

  useEffect(() => {
    setEditMode(isVisualEditingMode());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % principles.length), 6000);
    return () => window.clearTimeout(timer);
  }, [index, paused]);

  const move = (delta: number) => {
    setIndex((current) => (current + delta + principles.length) % principles.length);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(distance) > 54) move(distance > 0 ? -1 : 1);
  };

  return (
    <section
      className={styles.slider}
      data-scroll-world-scene
      data-scroll-world-strength="subtle"
      aria-label={getText(content, "column.principles.title")}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
      onPointerDown={(event) => {
        if (editMode || (event.pointerType === "mouse" && event.button !== 0)) return;
        dragStart.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={finishDrag}
      onPointerCancel={() => { dragStart.current = null; }}
    >
      <div className={styles.slides}>
        {principles.map((principle, principleIndex) => (
          <div
            className={`${styles.slide} ${principleIndex === index ? styles.activeSlide : ""}`}
            aria-hidden={principleIndex !== index}
            key={principle.no}
          >
            <ImageSlot
              className={styles.background}
              label=""
              alt=""
              variant="dark"
              editId={principle.imageId}
              image={getImage(content, principle.imageId)}
              sizes="100vw"
            />
            <div className={styles.shade} />
          </div>
        ))}
      </div>

      <div className={styles.inner}>
        <div className={styles.heading} data-scroll-world-layer="copy">
          <span {...textEditProps("column.principles.eyebrow")}>{getText(content, "column.principles.eyebrow")}</span>
          <h2 {...textEditProps("column.principles.title")}>{getText(content, "column.principles.title")}</h2>
        </div>

        <div className={styles.copyStack}>
          {principles.map((principle, principleIndex) => (
            <div
              className={`${styles.copy} ${principleIndex === index ? styles.activeCopy : ""}`}
              aria-hidden={principleIndex !== index}
              key={principle.no}
            >
              <span className={styles.number}>{principle.no}</span>
              <b {...textEditProps(principle.titleId)}>{getText(content, principle.titleId)}</b>
              <p {...textEditProps(principle.descriptionId)}>{getText(content, principle.descriptionId)}</p>
            </div>
          ))}
        </div>

        <div className={styles.controls} data-edit-control>
          <button type="button" onClick={() => move(-1)} aria-label="이전 진료 원칙">←</button>
          <div className={styles.indexes} role="tablist" aria-label="진료 원칙 선택">
            {principles.map((principle, principleIndex) => (
              <button
                type="button"
                role="tab"
                aria-selected={principleIndex === index}
                className={principleIndex === index ? styles.activeIndex : ""}
                onClick={() => setIndex(principleIndex)}
                key={principle.no}
              >
                {principle.no}
              </button>
            ))}
          </div>
          <div className={styles.progress} aria-hidden="true">
            <span className={paused ? styles.progressPaused : ""} key={`${index}-${paused ? "paused" : "running"}`} />
          </div>
          <button type="button" onClick={() => move(1)} aria-label="다음 진료 원칙">→</button>
          {!editMode ? (
            <button
              type="button"
              className={styles.pause}
              aria-pressed={userPaused}
              aria-label={userPaused ? "진료 원칙 자동 넘김 재생" : "진료 원칙 자동 넘김 멈춤"}
              onClick={() => setUserPaused((current) => !current)}
            >
              {userPaused ? "▶" : "Ⅱ"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
