import type { CSSProperties } from "react";
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
}: ImageSlotProps) {
  const style: CSSProperties = {
    width,
    height,
    aspectRatio: ratio,
  };

  return (
    <div
      className={`${styles.slot} ${styles[variant]} ${styles[align]} ${className}`}
      style={style}
      role="img"
      aria-label={alt}
    >
      {label}
    </div>
  );
}
