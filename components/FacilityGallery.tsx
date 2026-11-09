"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { ImageSlot } from "./ImageSlot";
import { EditableRichText } from "./EditableRichText";
import styles from "./FacilityGallery.module.css";

type FacilityGalleryProps = { content: SiteContent };
const roomKeys = ["lounge", "laser", "consult", "powder", "treatment"] as const;

export function FacilityGallery({ content }: FacilityGalleryProps) {
  const [index, setIndex] = useState(1);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const touchStart = useRef<number | null>(null);
  const previousIndex = (index - 1 + roomKeys.length) % roomKeys.length;
  const nextIndex = (index + 1) % roomKeys.length;
  const roomName = (roomIndex: number) => getText(content, `home.gallery.room.${roomKeys[roomIndex]}`);
  const roomImage = (roomIndex: number) => getImage(content, `home.gallery.${roomKeys[roomIndex]}`);

  useEffect(() => setEditMode(process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("edit") === "1"), []);

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
    <section className={styles.gallery} id="gallery">
      <div className={styles.leftBand} />
      <ImageSlot className={styles.blurBackground} label="" alt="" editId="home.gallery.background" image={getImage(content, "home.gallery.background")} />
      <div className={styles.heading}><span {...textEditProps("home.gallery.eyebrow")}>{getText(content, "home.gallery.eyebrow")}</span><h2><EditableRichText id="home.gallery.title" value={getText(content, "home.gallery.title")} /></h2><Link href="#"><span {...textEditProps("home.gallery.more")}>{getText(content, "home.gallery.more")}</span> <i /></Link></div>
      <button type="button" className={styles.previous} aria-disabled={!roomImage(previousIndex).src} aria-label={`${roomName(previousIndex)} 크게 보기`} onClick={() => open(previousIndex)}><ImageSlot className={styles.photoSlot} label="" alt="" align="end" editId={`home.gallery.${roomKeys[previousIndex]}`} image={roomImage(previousIndex)} /></button>
      <button type="button" className={styles.next} aria-disabled={!roomImage(nextIndex).src} aria-label={`${roomName(nextIndex)} 크게 보기`} onClick={() => open(nextIndex)}><ImageSlot className={styles.photoSlot} label="" alt="" variant="light" align="end" editId={`home.gallery.${roomKeys[nextIndex]}`} image={roomImage(nextIndex)} /></button>
      <div className={styles.current}><button type="button" aria-disabled={!roomImage(index).src} aria-label={`${roomName(index)} 크게 보기`} onClick={() => open(index)}><ImageSlot label="" alt="" variant="dark" editId={`home.gallery.${roomKeys[index]}`} image={roomImage(index)} /></button><b {...textEditProps(`home.gallery.room.${roomKeys[index]}`)}>{roomName(index)}</b></div>
      <div className={styles.pages}>{roomKeys.map((room, roomIndex) => <button type="button" data-edit-control className={roomIndex === index ? styles.active : ""} aria-label={`${String(roomIndex + 1).padStart(2, "0")} · ${roomName(roomIndex)}`} onClick={() => setIndex(roomIndex)} key={room}>{String(roomIndex + 1).padStart(2, "0")}</button>)}</div>

      {modalIndex !== null && roomImage(modalIndex).src ? <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${roomName(modalIndex)} 크게 보기`} onMouseDown={(event) => { if (event.target === event.currentTarget) setModalIndex(null); }} onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(distance) > 50) setModalIndex(nextAvailable(modalIndex, distance > 0 ? -1 : 1)); touchStart.current = null; }}>
        <button type="button" className={styles.modalClose} onClick={() => setModalIndex(null)}>{getText(content, "home.gallery.modalClose")} ×</button>
        <button type="button" className={`${styles.modalArrow} ${styles.modalPrevious}`} onClick={() => setModalIndex(nextAvailable(modalIndex, -1))} aria-label={getText(content, "home.gallery.modalPrevious")}>‹</button>
        <figure><div><Image src={roomImage(modalIndex).src!} alt={roomImage(modalIndex).alt} fill sizes="100vw" /></div><figcaption>{roomName(modalIndex)}</figcaption></figure>
        <button type="button" className={`${styles.modalArrow} ${styles.modalNext}`} onClick={() => setModalIndex(nextAvailable(modalIndex, 1))} aria-label={getText(content, "home.gallery.modalNext")}>›</button>
      </div> : null}
    </section>
  );
}
