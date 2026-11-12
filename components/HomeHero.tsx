"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/content/site-content-types";
import { textEditProps } from "@/content/site-content-types";
import { isVisualEditingMode } from "@/lib/motion";
import { ImageSlot } from "./ImageSlot";
import styles from "./HomeHero.module.css";

type HomeHeroProps = { slides: HeroSlide[] };
type NavigateDetail = { index?: number; delta?: number };

export function HomeHero({ slides }: HomeHeroProps) {
  const [editMode, setEditMode] = useState(false);
  const [index, setIndex] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const indexRef = useRef(index);

  indexRef.current = index;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const editing = isVisualEditingMode();
    setEditMode(editing);
    const update = () => {
      setReducedMotion(query.matches);
      setMotionReady(!editing && !query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (index < slides.length) return;
    setIndex(Math.max(0, slides.length - 1));
  }, [index, slides.length]);

  useEffect(() => {
    const announce = () => {
      const current = slides[indexRef.current] ?? slides[0];
      if (!current) return;
      window.dispatchEvent(new CustomEvent("glory:hero-state", {
        detail: { index: indexRef.current, count: slides.length, slideId: current.id },
      }));
    };
    const navigate = (event: Event) => {
      const detail = (event as CustomEvent<NavigateDetail>).detail;
      setIndex((current) => {
        if (typeof detail.index === "number") return Math.min(slides.length - 1, Math.max(0, detail.index));
        return (current + (detail.delta ?? 0) + slides.length) % slides.length;
      });
    };
    window.addEventListener("glory:hero-request-state", announce);
    window.addEventListener("glory:hero-navigate", navigate);
    announce();
    return () => {
      window.removeEventListener("glory:hero-request-state", announce);
      window.removeEventListener("glory:hero-navigate", navigate);
    };
  }, [slides]);

  useEffect(() => {
    const current = slides[index];
    if (!current) return;
    window.dispatchEvent(new CustomEvent("glory:hero-state", {
      detail: { index, count: slides.length, slideId: current.id },
    }));
  }, [index, slides]);

  const current = slides[index] ?? slides[0];
  if (!current) return null;

  const paused = interactionPaused || userPaused;

  return (
    <div
      className={`${styles.slider} ${motionReady ? styles.motionReady : ""}`}
      data-scroll-world-layer="depth"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
    >
      {slides.map((slide, slideIndex) => (
        <ImageSlot
          key={slide.id}
          className={`${styles.heroMedia} ${slideIndex === index ? styles.activeMedia : ""} ${slideIndex === index && motionReady ? styles.zoomMedia : ""}`}
          label=""
          alt=""
          variant="dark"
          align="end"
          editId={`home.hero.slides.${slide.id}.bgImage`}
          image={slide.bgImage}
          priority={slideIndex === 0}
          sizes="100vw"
        />
      ))}
      <div className={styles.heroShade} />
      <div className={styles.heroCopy} key={current.id}>
        <span {...textEditProps(`home.hero.slides.${current.id}.eyebrow`)}>{current.eyebrow}</span>
        <h1>
          <span className={styles.titleLine}><span className={styles.scriptTitle} {...textEditProps(`home.hero.slides.${current.id}.title`)}>{current.title}</span></span>
          <span className={styles.titleLine}><b {...textEditProps(`home.hero.slides.${current.id}.titleStrong`)}>{current.titleStrong}</b></span>
        </h1>
        <p {...textEditProps(`home.hero.slides.${current.id}.description`)}>{current.description}</p>
      </div>
      <div className={styles.heroPager} aria-label="히어로 슬라이드">
        <button type="button" onClick={() => setIndex(index)} aria-label={`${String(index + 1).padStart(2, "0")} · ${index + 1}번 슬라이드`}>{String(index + 1).padStart(2, "0")}</button>
        <span>
          <i
            key={`${current.id}-progress`}
            className={motionReady ? styles.progressFill : ""}
            style={{ animationPlayState: paused ? "paused" : "running" }}
            onAnimationEnd={() => {
              if (!paused && !editMode && !reducedMotion && slides.length > 1) {
                setIndex((currentIndex) => (currentIndex + 1) % slides.length);
              }
            }}
          />
          <span className={styles.slideTargets}>
            {slides.map((slide, slideIndex) => <button type="button" aria-label={`${slideIndex + 1}번 슬라이드로 이동`} onClick={() => setIndex(slideIndex)} key={slide.id} />)}
          </span>
        </span>
        <button type="button" onClick={() => setIndex(slides.length - 1)} aria-label={`${String(slides.length).padStart(2, "0")} · ${slides.length}번 슬라이드`}>{String(slides.length).padStart(2, "0")}</button>
        {!editMode && slides.length > 1 ? <button type="button" className={styles.pauseButton} aria-pressed={userPaused} aria-label={userPaused ? "히어로 슬라이드 재생" : "히어로 슬라이드 멈춤"} onClick={() => setUserPaused((value) => !value)}>{userPaused ? "▶" : "Ⅱ"}</button> : null}
      </div>
    </div>
  );
}
