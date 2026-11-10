import type { CSSProperties } from "react";
import Image from "next/image";
import type { ImageContentEntry } from "@/content/site-content-types";
import styles from "./ImageSlot.module.css";

type ImageSlotProps = {
  label: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  ratio?: string;
  className?: string;
  variant?: "default" | "light" | "dark" | "diagram";
  align?: "center" | "end";
  editId?: string;
  image?: ImageContentEntry;
  priority?: boolean;
  sizes?: string;
  motionRole?: "doctor-photo";
};

export function ImageSlot({
  label,
  alt,
  width,
  height,
  ratio,
  className = "",
  variant = "default",
  align = "center",
  editId,
  image,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  motionRole,
}: ImageSlotProps) {
  const style = {
    width,
    height,
    aspectRatio: ratio,
    "--image-scale": (image?.zoom ?? 100) / 100,
    "--image-focus-x": `${image?.focusX ?? 50}%`,
    "--image-focus-y": `${image?.focusY ?? 50}%`,
  } as CSSProperties;

  const resolvedLabel = image?.label ?? label;
  const resolvedAlt = image?.alt || alt;

  return (
    <div
      className={`${styles.slot} ${image?.src ? styles.hasImage : ""} ${styles[variant]} ${styles[align]} ${className}`}
      style={style}
      role="img"
      aria-label={resolvedAlt}
      data-edit-id={editId}
      data-edit-type={image?.type}
      data-motion-photo={motionRole === "doctor-photo" ? "" : undefined}
    >
      {image?.src ? (
        <Image className={styles.image} src={image.src} alt={resolvedAlt} fill sizes={sizes} priority={priority} />
      ) : resolvedLabel}
      {process.env.NODE_ENV === "development" && image?.type === "bgImage" ? (
        <span className={styles.bgEditHint} data-bg-edit-hint>배경 이미지 변경</span>
      ) : null}
    </div>
  );
}
