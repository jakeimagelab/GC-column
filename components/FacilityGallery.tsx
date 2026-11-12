"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { isVisualEditingMode } from "@/lib/motion";
import { EditableRichText } from "./EditableRichText";
import { ImageSlot } from "./ImageSlot";
import styles from "./FacilityGallery.module.css";

type FacilityGalleryProps = { content: SiteContent };
const roomKeys = ["lounge", "laser", "consult", "powder", "treatment"] as const;

export function FacilityGallery({ content }: FacilityGalleryProps) {
  const [index, setIndex] = useState(1);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const stageTouchStart = useRef<number | null>(null);
  const modalTouchStart = useRef<number | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const roomName = (roomIndex: number) => getText(content, `home.gallery.room.${roomKeys[roomIndex]}`);
  const roomImage = (roomIndex: number) => getImage(content, `home.gallery.${roomKeys[roomIndex]}`);
  const paused = interactionPaused || userPaused || editMode || reducedMotion;

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
    if (paused || roomKeys.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % roomKeys.length), 4000);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (editMode || reducedMotion) return;
    const gallery = galleryRef.current;
    const band = bandRef.current;
    if (!gallery || !band) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = gallery.getBoundingClientRect();
      const distance = rect.top + rect.height / 2 - window.innerHeight / 2;
      band.style.transform = `translate3d(0,${(distance * -0.12).toFixed(1)}px,0)`;
    };
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      if (frame) cancelAnimationFrame(frame);
      band.style.transform = "";
    };
  }, [editMode, reducedMotion]);

  const nextAvailable = (from: number, delta: number) => {
    for (let offset = 1; offset <= roomKeys.length; offset += 1) {
      const candidate = (from + delta * offset + roomKeys.length * 2) % roomKeys.length;
      if (roomImage(candidate).src) return candidate;
    }
    return from;
  };
  const open = (roomIndex: number) => {
    if (!editMode && roomImage(roomIndex).src) setModalIndex(roomIndex);
  };
  const positionFor = (roomIndex: number) => {
    let position = roomIndex - index;
    if (position > roomKeys.length / 2) position -= roomKeys.length;
    if (position < -roomKeys.length / 2) position += roomKeys.length;
    return Math.max(-2, Math.min(2, position));
  };
  const swipe = (distance: number) => {
    if (Math.abs(distance) > 50) setIndex((current) => (current + (distance > 0 ? -1 : 1) + roomKeys.length) % roomKeys.length);
  };

  useEffect(() => {
    if (modalIndex === null) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalIndex(null);
      else if (event.key === "ArrowLeft") setModalIndex((value) => value === null ? null : nextAvailable(value, -1));
      else if (event.key === "ArrowRight") setModalIndex((value) => value === null ? null : nextAvailable(value, 1));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", keydown); };
  }, [modalIndex]);

  return (
    <section
      ref={galleryRef}
      className={styles.gallery}
      id="gallery"
      data-scroll-world-scene
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false); }}
    >
      <div ref={bandRef} className={styles.leftBand} />
      <ImageSlot className={styles.blurBackground} label="" alt="" editId="home.gallery.background" image={getImage(content, "home.gallery.background")} />
      <div className={styles.heading} data-scroll-world-layer="copy"><span {...textEditProps("home.gallery.eyebrow")}>{getText(content, "home.gallery.eyebrow")}</span><h2><EditableRichText id="home.gallery.title" value={getText(content, "home.gallery.title")} /></h2><Link href="#"><span {...textEditProps("home.gallery.more")}>{getText(content, "home.gallery.more")}</span> <i /></Link></div>

      <div
        className={styles.stage}
        data-scroll-world-layer="depth"
        onTouchStart={(event) => { stageTouchStart.current = event.changedTouches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (stageTouchStart.current === null) return;
          swipe((event.changedTouches[0]?.clientX ?? stageTouchStart.current) - stageTouchStart.current);
          stageTouchStart.current = null;
        }}
      >
        {roomKeys.map((room, roomIndex) => {
          const position = positionFor(roomIndex);
          const isCurrent = position === 0;
          return (
            <button
              type="button"
              className={styles.room}
              data-position={position}
              aria-label={isCurrent ? `${roomName(roomIndex)} 크게 보기` : `${roomName(roomIndex)} 보기`}
              aria-disabled={isCurrent && !roomImage(roomIndex).src}
              tabIndex={Math.abs(position) <= 1 ? 0 : -1}
              onClick={() => isCurrent ? open(roomIndex) : setIndex(roomIndex)}
              key={room}
            >
              <ImageSlot className={styles.photoSlot} label="" alt="" editId={`home.gallery.${room}`} image={roomImage(roomIndex)} />
              <b {...textEditProps(`home.gallery.room.${room}`)}>{roomName(roomIndex)}</b>
            </button>
          );
        })}
      </div>

      <div className={styles.controls}>
        <div className={styles.pages} role="tablist" aria-label="시설 공간 선택">{roomKeys.map((room, roomIndex) => <button type="button" role="tab" aria-selected={roomIndex === index} data-edit-control className={roomIndex === index ? styles.active : ""} aria-label={`${String(roomIndex + 1).padStart(2, "0")} · ${roomName(roomIndex)}`} onClick={() => setIndex(roomIndex)} key={room} />)}</div>
        {!editMode ? <button type="button" className={styles.pauseButton} aria-pressed={userPaused} aria-label={userPaused ? "시설 사진 자동 넘김 재생" : "시설 사진 자동 넘김 멈춤"} onClick={() => setUserPaused((value) => !value)}>{userPaused ? "▶" : "Ⅱ"}</button> : null}
      </div>

      {modalIndex !== null && roomImage(modalIndex).src ? <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${roomName(modalIndex)} 크게 보기`} onMouseDown={(event) => { if (event.target === event.currentTarget) setModalIndex(null); }} onTouchStart={(event) => { modalTouchStart.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (modalTouchStart.current === null) return; const distance = (event.changedTouches[0]?.clientX ?? modalTouchStart.current) - modalTouchStart.current; if (Math.abs(distance) > 50) setModalIndex(nextAvailable(modalIndex, distance > 0 ? -1 : 1)); modalTouchStart.current = null; }}>
        <button type="button" className={styles.modalClose} onClick={() => setModalIndex(null)}>{getText(content, "home.gallery.modalClose")} ×</button>
        <button type="button" className={`${styles.modalArrow} ${styles.modalPrevious}`} onClick={() => setModalIndex(nextAvailable(modalIndex, -1))} aria-label={getText(content, "home.gallery.modalPrevious")}>‹</button>
        <figure><div><Image src={roomImage(modalIndex).src!} alt={roomImage(modalIndex).alt} fill sizes="100vw" /></div><figcaption>{roomName(modalIndex)}</figcaption></figure>
        <button type="button" className={`${styles.modalArrow} ${styles.modalNext}`} onClick={() => setModalIndex(nextAvailable(modalIndex, 1))} aria-label={getText(content, "home.gallery.modalNext")}>›</button>
      </div> : null}
    </section>
  );
}
