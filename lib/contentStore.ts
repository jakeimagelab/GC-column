import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageContentEntry, SiteContent, SiteContentEntry } from "@/content/site-content-types";

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
  const current = content[id];
  if (!current) throw new Error(`Unknown content id: ${id}`);
  if (current.type !== nextEntry.type) throw new Error(`Content type cannot be changed: ${id}`);
  content[id] = nextEntry;
  await writeSiteContent(content);
  return nextEntry;
}

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveUploadedImage(id: string, bytes: Uint8Array, mimeType: string) {
  const extension = extensions[mimeType];
  if (!extension) throw new Error("JPG, PNG, WebP 이미지만 사용할 수 있습니다.");
  const safeId = id.replace(/[^a-z0-9.-]+/gi, "-");
  const filename = `${safeId}-${Date.now()}.${extension}`;
  await mkdir(uploadsPath, { recursive: true });
  await writeFile(path.join(uploadsPath, filename), bytes);
  return `/uploads/${filename}`;
}

export function normalizeImageEntry(entry: ImageContentEntry): ImageContentEntry {
  return {
    ...entry,
    zoom: Math.min(250, Math.max(100, Math.round(entry.zoom))),
    focusX: Math.min(100, Math.max(0, Math.round(entry.focusX))),
    focusY: Math.min(100, Math.max(0, Math.round(entry.focusY))),
  };
}
