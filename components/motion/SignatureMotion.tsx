"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { ImageContentEntry } from "@/content/site-content-types";
import { desktopTransform, getImagePlacementMeta, mobileTransform } from "@/lib/imagePlacement";
import { motionDisabled, useMotionOnce } from "./useMotionOnce";
import styles from "./SignatureMotion.module.css";

type SignatureMotionProps = {
  image: ImageContentEntry;
  editId: string;
  className?: string;
};

function sanitizeSvg(source: string) {
  const document = new DOMParser().parseFromString(source, "image/svg+xml");
  const svg = document.documentElement;
  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) return "";
  svg.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((node) => node.remove());
  svg.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on") || /javascript:/i.test(attribute.value)) node.removeAttribute(attribute.name);
    });
  });
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  return svg.outerHTML;
}

export function SignatureMotion({ image, editId, className = "" }: SignatureMotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState("");
  const isSvg = Boolean(image.src && /\.svg(?:\?.*)?$/i.test(image.src));
  const options = useMemo(() => ({ threshold: 0.4 }), []);
  const placement = getImagePlacementMeta(editId, image.label);
  const desktop = desktopTransform(image);
  const mobile = mobileTransform(image);
  useMotionOnce(ref, styles.armed, styles.playing, options);

  useEffect(() => {
    if (!isSvg || !image.src || motionDisabled()) return;
    const controller = new AbortController();
    fetch(image.src, { signal: controller.signal })
      .then((response) => response.ok ? response.text() : "")
      .then((source) => setSvgMarkup(sanitizeSvg(source)))
      .catch(() => {});
    return () => controller.abort();
  }, [image.src, isSvg]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !svgMarkup || motionDisabled()) return;
    const paths = Array.from(root.querySelectorAll<SVGPathElement>("svg path")).filter((path) => getComputedStyle(path).stroke !== "none");
    const lengths = paths.map((path) => {
      try { return Math.max(1, path.getTotalLength()); } catch { return 1; }
    });
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let elapsed = 0;
    paths.forEach((path, index) => {
      const share = lengths[index] / total;
      path.style.setProperty("--signature-length", String(Math.ceil(lengths[index] + 2)));
      path.style.setProperty("--signature-duration", `${Math.max(0.18, share * 2).toFixed(3)}s`);
      path.style.setProperty("--signature-delay", `${elapsed.toFixed(3)}s`);
      elapsed += share * 2;
    });
    if (root.classList.contains(styles.playing)) {
      root.classList.remove(styles.playing);
      void root.offsetWidth;
      requestAnimationFrame(() => root.classList.add(styles.playing));
    }
  }, [svgMarkup]);

  return (
    <div
      ref={ref}
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
        svgMarkup ? <span className={styles.inlineSvg} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgMarkup }} /> :
          <Image src={image.src} alt={image.alt} fill sizes="220px" unoptimized={isSvg} />
      ) : image.label}
    </div>
  );
}
