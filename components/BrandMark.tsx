import Image from "next/image";
import type { ImageContentEntry } from "@/content/site-content-types";
import { desktopTransform, getImagePlacementMeta, mobileTransform } from "@/lib/imagePlacement";
import styles from "./BrandMark.module.css";

type BrandMarkProps = {
  image: ImageContentEntry;
  name: string;
  nameEn?: string;
  compact?: boolean;
  plain?: boolean;
};

export function BrandMark({ image, name, compact = false, plain = false }: BrandMarkProps) {
  const desktop = desktopTransform(image);
  const mobile = mobileTransform(image);
  const placement = getImagePlacementMeta("common.header.logo", image.label);
  return (
    <span
      className={`${styles.mark} ${compact ? styles.compact : ""} ${plain ? styles.plainMark : ""}`}
      data-edit-id="common.header.logo"
      data-edit-type="image"
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
      } as React.CSSProperties}
    >
      {image.src ? (
        <Image className={styles.image} src={image.src} alt={image.alt} fill sizes="150px" unoptimized />
      ) : (
        <span className={styles.wordmark}>
          <span className={styles.monogram} aria-hidden="true">
            <svg viewBox="0 0 54 54" focusable="false"><text x="2" y="45">G</text><text x="0" y="47">G</text><text x="3" y="44">G</text></svg>
          </span>
          <b data-edit-id="common.brand.name" data-edit-type="text">{name}</b>
        </span>
      )}
    </span>
  );
}
