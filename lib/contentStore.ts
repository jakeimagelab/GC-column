import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  EQUIPMENT_ITEMS_ID,
  getEditableEntry,
  HERO_SLIDES_ID,
  TYPING_EXAMPLES_ID,
  withEditableEntry,
  type EquipmentContentItem,
  type HeroSlide,
  type ImageContentEntry,
  type SiteContent,
  type SiteContentCollection,
  type SiteContentEntry,
} from "@/content/site-content-types";
import { normalizePlacementTransform } from "@/lib/imagePlacement";

const contentPath = path.join(process.cwd(), "content", "site-content.json");
const uploadsPath = path.join(process.cwd(), "public", "uploads");

export async function readSiteContent(): Promise<SiteContent> {
  return JSON.parse(await readFile(contentPath, "utf8")) as SiteContent;
}

async function writeSiteContent(content: SiteContent) {
  const temporaryPath = `${contentPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporaryPath, contentPath);
}

export async function updateSiteContentEntry(id: string, nextEntry: SiteContentEntry) {
  const content = await readSiteContent();
  const current = getEditableEntry(content, id);
  if (!current) throw new Error(`Unknown content id: ${id}`);
  if (current.type !== nextEntry.type) throw new Error(`Content type cannot be changed: ${id}`);
  await writeSiteContent(withEditableEntry(content, id, nextEntry));
  return nextEntry;
}

function validateImage(entry: ImageContentEntry, expectedType: ImageContentEntry["type"]) {
  if (entry.type !== expectedType) throw new Error("이미지 형식이 올바르지 않습니다.");
  if (entry.src !== null && typeof entry.src !== "string") throw new Error("이미지 경로가 올바르지 않습니다.");
  if (typeof entry.label !== "string" || typeof entry.alt !== "string") throw new Error("이미지 문구가 올바르지 않습니다.");
}

function validateHeroSlides(value: SiteContentCollection): asserts value is HeroSlide[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 6) throw new Error("히어로 슬라이드는 1~6장이어야 합니다.");
  if (!value.every((item) => typeof item === "object" && item !== null && "bgImage" in item)) throw new Error("히어로 슬라이드 형식이 올바르지 않습니다.");
  const ids = new Set<string>();
  value.forEach((slide) => {
    if (slide.type !== "image" || !slide.id || ids.has(slide.id)) throw new Error("히어로 슬라이드 ID가 올바르지 않습니다.");
    ids.add(slide.id);
    validateImage(slide.bgImage, "bgImage");
    if ([slide.eyebrow, slide.title, slide.titleStrong, slide.description].some((field) => typeof field !== "string")) {
      throw new Error("히어로 슬라이드 문구가 올바르지 않습니다.");
    }
  });
}

function validateEquipmentItems(value: SiteContentCollection): asserts value is EquipmentContentItem[] {
  if (!Array.isArray(value) || value.length < 1) throw new Error("장비는 1개 이상이어야 합니다.");
  if (!value.every((item) => typeof item === "object" && item !== null && "image" in item)) throw new Error("장비 형식이 올바르지 않습니다.");
  const ids = new Set<string>();
  value.forEach((item) => {
    if (!item.id || ids.has(item.id)) throw new Error("장비 ID가 올바르지 않습니다.");
    ids.add(item.id);
    validateImage(item.image, "image");
    if ([item.name, item.desc, item.link].some((field) => typeof field !== "string")) throw new Error("장비 정보가 올바르지 않습니다.");
  });
}

function validateTypingExamples(value: SiteContentCollection): asserts value is string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12 || !value.every((item) => typeof item === "string" && item.trim())) {
    throw new Error("타이핑 예시는 1~12개의 문장이어야 합니다.");
  }
}

export async function updateSiteContentCollection(id: string, value: SiteContentCollection) {
  const content = await readSiteContent();
  if (id === HERO_SLIDES_ID) validateHeroSlides(value);
  else if (id === EQUIPMENT_ITEMS_ID) validateEquipmentItems(value);
  else if (id === TYPING_EXAMPLES_ID) validateTypingExamples(value);
  else throw new Error(`Unknown collection id: ${id}`);
  content[id] = value;
  await writeSiteContent(content);
  return value;
}

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function saveUploadedImage(id: string, bytes: Uint8Array, mimeType: string) {
  const extension = extensions[mimeType];
  if (!extension || (extension === "svg" && !id.endsWith("signatureImage"))) throw new Error("JPG, PNG, WebP 이미지만 사용할 수 있으며 서명에는 SVG도 사용할 수 있습니다.");
  const safeId = id.replace(/[^a-z0-9.-]+/gi, "-");
  const filename = `${safeId}-${Date.now()}.${extension}`;
  await mkdir(uploadsPath, { recursive: true });
  await writeFile(path.join(uploadsPath, filename), bytes);
  return `/uploads/${filename}`;
}

export function normalizeImageEntry(entry: ImageContentEntry): ImageContentEntry {
  const desktop = entry.desktop ? normalizePlacementTransform(entry.desktop) : undefined;
  const mobile = entry.mobile ? normalizePlacementTransform(entry.mobile) : undefined;
  return {
    ...entry,
    zoom: Math.min(250, Math.max(100, Math.round(entry.zoom))),
    focusX: Math.min(100, Math.max(0, Math.round(entry.focusX))),
    focusY: Math.min(100, Math.max(0, Math.round(entry.focusY))),
    ...(desktop ? { desktop } : {}),
    ...(mobile ? { mobile } : {}),
  };
}

export function normalizeTextValue(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}
