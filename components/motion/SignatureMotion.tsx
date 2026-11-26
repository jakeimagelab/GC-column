"use client";

import Image from "next/image";
import { type CSSProperties } from "react";
import type { ImageContentEntry } from "@/content/site-content-types";
import { desktopTransform, getImagePlacementMeta, mobileTransform } from "@/lib/imagePlacement";
import styles from "./SignatureMotion.module.css";

type SignatureMotionProps = {
  image: ImageContentEntry;
  editId: string;
  className?: string;
  fallbackText?: string;
};

export function SignatureMotion({ image, editId, className = "", fallbackText }: SignatureMotionProps) {
  const isSvg = Boolean(image.src && /\.svg(?:\?.*)?$/i.test(image.src));
  const placement = getImagePlacementMeta(editId, image.label);
  const desktop = desktopTransform(image);
  const mobile = mobileTransform(image);
  return (
    <div
      className={`${styles.signature} ${image.src ? styles.hasImage : ""} ${isSvg ? styles.svgSignature : styles.rasterSignature} ${className}`}
      role="img"
      aria-label={image.alt}
      data-edit-id={editId}
      data-edit-type={image.type}
      data-placement-page={placement.page}
      data-placement-section={placement.section}
      data-placement-name={placement.slotName}
      data-placement-display={placement.displayName}
      style={{
        "--image-scale": desktop.zoom / 100,
        "--image-focus-x": `${desktop.x}%`,
        "--image-focus-y": `${desktop.y}%`,
        "--image-mobile-scale": mobile.zoom / 100,
        "--image-mobile-focus-x": `${mobile.x}%`,
        "--image-mobile-focus-y": `${mobile.y}%`,
      } as CSSProperties}
    >
      {image.src ? (
          <Image src={image.src} alt={image.alt} fill sizes="220px" unoptimized={isSvg} />
      ) : (fallbackText ?? image.label)}
    </div>
  );
}
