import type { CSSProperties } from "react";
import Image from "next/image";
import type { ImageContentEntry } from "@/content/site-content-types";
import { desktopTransform, getImagePlacementMeta, mobileTransform } from "@/lib/imagePlacement";
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
  unoptimized?: boolean;
  motionRole?: "doctor-photo";
  scrollWorldLayer?: "depth" | "copy" | "counter";
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
  unoptimized = false,
  motionRole,
  scrollWorldLayer,
}: ImageSlotProps) {
  const desktop = image ? desktopTransform(image) : { x: 50, y: 50, zoom: 100 };
  const mobile = image ? mobileTransform(image) : desktop;
  const placement = editId ? getImagePlacementMeta(editId, image?.label ?? label) : null;
  const style = {
    width,
    height,
    aspectRatio: ratio,
    "--image-scale": desktop.zoom / 100,
    "--image-focus-x": `${desktop.x}%`,
    "--image-focus-y": `${desktop.y}%`,
    "--image-mobile-scale": mobile.zoom / 100,
    "--image-mobile-focus-x": `${mobile.x}%`,
    "--image-mobile-focus-y": `${mobile.y}%`,
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
      data-placement-page={placement?.page}
      data-placement-section={placement?.section}
      data-placement-name={placement?.slotName}
      data-placement-display={placement?.displayName}
      data-motion-photo={motionRole === "doctor-photo" ? "" : undefined}
      data-scroll-world-layer={scrollWorldLayer}
    >
      {image?.src ? (
        <Image className={styles.image} src={image.src} alt={resolvedAlt} fill sizes={sizes} priority={priority} unoptimized={unoptimized || image.src.startsWith("http")} />
      ) : resolvedLabel}
      {process.env.NODE_ENV === "development" && image?.type === "bgImage" ? (
        <span className={styles.bgEditHint} data-bg-edit-hint>배경 이미지 변경</span>
      ) : null}
    </div>
  );
}
