"use client";

import Link from "next/link";
import { useState } from "react";
import { ImageSlot } from "./ImageSlot";
import styles from "./FacilityGallery.module.css";

type FacilityGalleryProps = { rooms: string[] };

export function FacilityGallery({ rooms }: FacilityGalleryProps) {
  const [index, setIndex] = useState(1);
  const previous = rooms[(index - 1 + rooms.length) % rooms.length];
  const next = rooms[(index + 1) % rooms.length];

  return (
    <section className={styles.gallery}>
      <div className={styles.leftBand} />
      <div className={styles.blurLabel}>[흐린 배경 이미지]</div>
      <div className={styles.heading}><span>Facility</span><h2>쾌적한 시술 환경을 위한<br /><b>시설과 장비</b></h2><Link href="#">더 살펴보기 <i /></Link></div>
      <ImageSlot className={styles.previous} label={`[사진] ${previous}`} alt={`${previous} 사진`} align="end" />
      <ImageSlot className={styles.next} label={`[사진] ${next}`} alt={`${next} 사진`} variant="light" align="end" />
      <div className={styles.current}><ImageSlot label={`[사진] ${rooms[index]}`} alt={`${rooms[index]} 사진`} variant="dark" /><b>{rooms[index]}</b></div>
      <div className={styles.pages}>{rooms.map((room, roomIndex) => <button type="button" className={roomIndex === index ? styles.active : ""} aria-label={room} onClick={() => setIndex(roomIndex)} key={room}>{String(roomIndex + 1).padStart(2, "0")}</button>)}</div>
    </section>
  );
}
