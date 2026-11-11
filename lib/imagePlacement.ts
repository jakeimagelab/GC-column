import type { ImageContentEntry } from "@/content/site-content-types";

export type PlacementTransform = { x: number; y: number; zoom: number };
export type PlacementStatus = "임시" | "반영됨";
export type PlacementKind = "사진" | "조정";

export type ImagePlacement = {
  id: string;
  slotId: string;
  page: string;
  section: string;
  slotName: string;
  fileName: string;
  sourceSrc?: string;
  alt: string;
  placedAt: string;
  status: PlacementStatus;
  kind: PlacementKind;
  desktop: PlacementTransform;
  mobile?: PlacementTransform;
  width?: number;
  height?: number;
  warning?: string;
};

export type ImagePlacementMeta = {
  page: string;
  section: string;
  slotName: string;
  displayName: string;
};

const roomNames: Record<string, string> = {
  lounge: "라운지 사진",
  laser: "레이저실 사진",
  consult: "1:1 상담실 사진",
  powder: "파우더룸 사진",
  treatment: "시술실 사진",
  background: "오른쪽 흐린 배경",
};

export function getImagePlacementMeta(id: string, fallback = "사진") : ImagePlacementMeta {
  let page = id.startsWith("column.") ? "칼럼 메인" : id.startsWith("common.") || id.startsWith("treatments.") ? "공통" : "홈";
  let section = "기타";
  let slotName = fallback || "사진";

  if (id.startsWith("home.hero.slides.")) {
    section = "히어로";
    const slideId = id.split(".")[3] ?? "슬라이드";
    slotName = `${slideId.replace("hero-slide-", "슬라이드 ")} 배경`;
  } else if (id === "home.doctor.photo") {
    section = "Director";
    slotName = "원장 사진";
  } else if (id.startsWith("home.vision.")) {
    section = "Vision";
    slotName = "원장 서명";
  } else if (id.startsWith("home.equipment.items.")) {
    section = "보유 장비";
  } else if (id.startsWith("home.gallery.")) {
    section = "시설 갤러리";
    slotName = roomNames[id.split(".").at(-1) ?? ""] ?? slotName;
  } else if (id === "home.location.map" || id === "column.location.map") {
    section = "오시는 길";
    slotName = "지도 이미지";
  } else if (id.startsWith("home.header.intro.")) {
    section = "헤더 메가메뉴";
  } else if (id === "common.header.logo") {
    section = "헤더";
    slotName = "로고";
  } else if (id.startsWith("treatments.")) {
    section = "시술 메가메뉴";
  } else if (id === "column.hero.background") {
    section = "히어로";
    slotName = "상담·시술 배경";
  } else if (id.startsWith("column.doctor.")) {
    section = "원장 소개";
  } else if (id === "column.principles.photo") {
    section = "진료 원칙";
    slotName = "진료 원칙 사진";
  }

  return { page, section, slotName, displayName: `${page} · ${section} · ${slotName}` };
}

export function desktopTransform(entry: ImageContentEntry): PlacementTransform {
  return entry.desktop ?? { x: entry.focusX, y: entry.focusY, zoom: entry.zoom };
}

export function mobileTransform(entry: ImageContentEntry): PlacementTransform {
  return entry.mobile ?? desktopTransform(entry);
}

export function normalizePlacementTransform(value: PlacementTransform): PlacementTransform {
  return {
    x: Math.min(100, Math.max(0, Math.round(value.x * 10) / 10)),
    y: Math.min(100, Math.max(0, Math.round(value.y * 10) / 10)),
    zoom: Math.min(300, Math.max(100, Math.round(value.zoom))),
  };
}
