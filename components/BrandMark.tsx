import Image from "next/image";
import type { ImageContentEntry } from "@/content/site-content-types";
import styles from "./BrandMark.module.css";

type BrandMarkProps = {
  image: ImageContentEntry;
  name: string;
  nameEn?: string;
  compact?: boolean;
  plain?: boolean;
};

export function BrandMark({ image, name, nameEn, compact = false, plain = false }: BrandMarkProps) {
  return (
    <span
      className={`${styles.mark} ${compact ? styles.compact : ""} ${plain ? styles.plainMark : ""}`}
      data-edit-id="common.header.logo"
      data-edit-type="image"
      style={{
        "--image-scale": image.zoom / 100,
        "--image-focus-x": `${image.focusX}%`,
        "--image-focus-y": `${image.focusY}%`,
      } as React.CSSProperties}
    >
      {image.src ? (
        <Image className={styles.image} src={image.src} alt={image.alt} fill sizes="150px" unoptimized />
      ) : plain ? (
        <span className={styles.plain}>G <b data-edit-id="common.brand.name" data-edit-type="text">{name}</b></span>
      ) : (
        <>
          <span className={styles.symbol}>G</span>
          <span className={styles.words}>
            <b data-edit-id="common.brand.name" data-edit-type="text">{name}</b>
            {nameEn ? <small data-edit-id="common.brand.nameEn" data-edit-type="text">{nameEn}</small> : null}
          </span>
        </>
      )}
    </span>
  );
}
