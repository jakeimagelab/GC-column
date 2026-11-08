"use client";

import Link from "next/link";
import { useState } from "react";
import { getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { ImageSlot } from "./ImageSlot";
import styles from "./EquipmentCarousel.module.css";

type EquipmentItem = { slug: string; name: string; desc: string };
type EquipmentCarouselProps = { items: EquipmentItem[]; content: SiteContent };

export function EquipmentCarousel({ items, content }: EquipmentCarouselProps) {
  const [start, setStart] = useState(0);
  const visible = [0, 1, 2, 3, 4].map((offset) => items[(start + offset) % items.length]);
  const move = (delta: number) => setStart((index) => (index + delta + items.length) % items.length);

  return (
    <section className={styles.section}>
      <div className={styles.band} />
      <div className={styles.heading}>
        <div><span {...textEditProps("home.equipment.eyebrow")}>{getText(content, "home.equipment.eyebrow")}</span><h2><span {...textEditProps("home.equipment.title")}>{getText(content, "home.equipment.title")}</span> <b {...textEditProps("home.equipment.titleStrong")}>{getText(content, "home.equipment.titleStrong")}</b></h2></div>
        <div><span {...textEditProps("home.equipment.guide")}>{getText(content, "home.equipment.guide")}</span><button type="button" data-edit-control onClick={() => move(-1)} aria-label="이전 장비">‹</button><button type="button" data-edit-control onClick={() => move(1)} aria-label="다음 장비">›</button></div>
      </div>
      <div className={styles.grid}>
        {visible.map((item, index) => (
          <Link href={`/column?category=lifting&treatment=${item.slug}`} key={`${item.slug}-${index}`}>
            <div className={styles.imageWrap}><ImageSlot className={styles.equipmentSlot} label="" alt="" editId={`home.equipment.${item.slug}`} image={getImage(content, `home.equipment.${item.slug}`)} /></div>
            <b>{item.name}</b><span>{item.desc}</span><small {...textEditProps("home.equipment.related")}>{getText(content, "home.equipment.related")}</small>
          </Link>
        ))}
      </div>
      <div className={styles.page}>{String(start + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</div>
    </section>
  );
}
