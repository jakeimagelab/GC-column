"use client";

import Link from "next/link";
import { useState } from "react";
import { ImageSlot } from "./ImageSlot";
import styles from "./EquipmentCarousel.module.css";

type EquipmentItem = { slug: string; name: string; desc: string };
type EquipmentCarouselProps = { items: EquipmentItem[]; eyebrow: string; title: string; titleStrong: string; guide: string };

export function EquipmentCarousel({ items, eyebrow, title, titleStrong, guide }: EquipmentCarouselProps) {
  const [start, setStart] = useState(0);
  const visible = [0, 1, 2, 3, 4].map((offset) => items[(start + offset) % items.length]);
  const move = (delta: number) => setStart((index) => (index + delta + items.length) % items.length);

  return (
    <section className={styles.section}>
      <div className={styles.band} />
      <div className={styles.heading}>
        <div><span>{eyebrow}</span><h2>{title} <b>{titleStrong}</b></h2></div>
        <div><span>{guide}</span><button type="button" onClick={() => move(-1)} aria-label="이전 장비">‹</button><button type="button" onClick={() => move(1)} aria-label="다음 장비">›</button></div>
      </div>
      <div className={styles.grid}>
        {visible.map((item, index) => (
          <Link href={`/column?category=lifting&treatment=${item.slug}`} key={`${item.slug}-${index}`}>
            <div className={styles.imageWrap}><ImageSlot className={styles.equipmentSlot} label={`[장비 누끼 사진]\n${item.name}`} alt={`${item.name} 장비 누끼 사진`} /></div>
            <b>{item.name}</b><span>{item.desc}</span><small>관련 칼럼 →</small>
          </Link>
        ))}
      </div>
      <div className={styles.page}>{String(start + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</div>
    </section>
  );
}
