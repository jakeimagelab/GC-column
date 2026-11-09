"use client";

import Link from "next/link";
import { useState } from "react";
import { getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { ImageSlot } from "./ImageSlot";
import { EditableRichText } from "./EditableRichText";
import styles from "./FacilityGallery.module.css";

type FacilityGalleryProps = { content: SiteContent };

const roomKeys = ["lounge", "laser", "consult", "powder", "treatment"] as const;

export function FacilityGallery({ content }: FacilityGalleryProps) {
  const [index, setIndex] = useState(1);
  const previousIndex = (index - 1 + roomKeys.length) % roomKeys.length;
  const nextIndex = (index + 1) % roomKeys.length;
  const roomName = (roomIndex: number) => getText(content, `home.gallery.room.${roomKeys[roomIndex]}`);
  const roomImage = (roomIndex: number) => getImage(content, `home.gallery.${roomKeys[roomIndex]}`);

  return (
    <section className={styles.gallery}>
      <div className={styles.leftBand} />
      <ImageSlot className={styles.blurBackground} label="" alt="" editId="home.gallery.background" image={getImage(content, "home.gallery.background")} />
      <div className={styles.heading}><span {...textEditProps("home.gallery.eyebrow")}>{getText(content, "home.gallery.eyebrow")}</span><h2><EditableRichText id="home.gallery.title" value={getText(content, "home.gallery.title")} /></h2><Link href="#"><span {...textEditProps("home.gallery.more")}>{getText(content, "home.gallery.more")}</span> <i /></Link></div>
      <ImageSlot className={styles.previous} label="" alt="" align="end" editId={`home.gallery.${roomKeys[previousIndex]}`} image={roomImage(previousIndex)} />
      <ImageSlot className={styles.next} label="" alt="" variant="light" align="end" editId={`home.gallery.${roomKeys[nextIndex]}`} image={roomImage(nextIndex)} />
      <div className={styles.current}><ImageSlot label="" alt="" variant="dark" editId={`home.gallery.${roomKeys[index]}`} image={roomImage(index)} /><b {...textEditProps(`home.gallery.room.${roomKeys[index]}`)}>{roomName(index)}</b></div>
      <div className={styles.pages}>{roomKeys.map((room, roomIndex) => <button type="button" data-edit-control className={roomIndex === index ? styles.active : ""} aria-label={`${String(roomIndex + 1).padStart(2, "0")} · ${roomName(roomIndex)}`} onClick={() => setIndex(roomIndex)} key={room}>{String(roomIndex + 1).padStart(2, "0")}</button>)}</div>
    </section>
  );
}
