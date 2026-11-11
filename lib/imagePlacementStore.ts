import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImagePlacement, PlacementTransform } from "@/lib/imagePlacement";
import { normalizePlacementTransform } from "@/lib/imagePlacement";

const inboxPath = path.join(process.cwd(), "photos-inbox");
const placementsPath = path.join(inboxPath, "placements.json");

export function safeInboxFileName(value: string) {
  const base = path.basename(value).normalize("NFC");
  const safe = base.replace(/[^\p{L}\p{N}._ ()-]/gu, "_").replace(/^\.+/, "");
  if (!safe) throw new Error("파일 이름이 올바르지 않습니다.");
  return safe;
}

export async function readImagePlacements(): Promise<ImagePlacement[]> {
  try {
    const value = JSON.parse(await readFile(placementsPath, "utf8")) as unknown;
    return Array.isArray(value) ? value as ImagePlacement[] : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeImagePlacements(placements: ImagePlacement[]) {
  await mkdir(inboxPath, { recursive: true });
  const temporary = `${placementsPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify(placements, null, 2)}\n`, "utf8");
  await rename(temporary, placementsPath);
}

type NewPlacement = Omit<ImagePlacement, "id" | "placedAt" | "status">;

export async function createImagePlacement(value: NewPlacement, bytes?: Uint8Array) {
  const placements = await readImagePlacements();
  const fileName = safeInboxFileName(value.fileName);
  const replaced = placements.filter((item) => item.status === "임시" && item.slotId === value.slotId);
  if (bytes) {
    await mkdir(inboxPath, { recursive: true });
    await writeFile(path.join(inboxPath, fileName), bytes);
  }
  const next: ImagePlacement = {
    ...value,
    fileName,
    id: randomUUID(),
    placedAt: new Date().toISOString(),
    status: "임시",
    desktop: normalizePlacementTransform(value.desktop),
    mobile: value.mobile ? normalizePlacementTransform(value.mobile) : undefined,
  };
  const withoutOlderTemporary = placements.filter((item) => item.status !== "임시" || item.slotId !== value.slotId);
  withoutOlderTemporary.push(next);
  await writeImagePlacements(withoutOlderTemporary);
  for (const previous of replaced) {
    if (previous.kind !== "사진" || previous.fileName === fileName) continue;
    if (withoutOlderTemporary.some((item) => item.kind === "사진" && item.fileName === previous.fileName)) continue;
    try {
      await unlink(path.join(inboxPath, safeInboxFileName(previous.fileName)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn(`교체 전 임시 사진을 정리하지 못했습니다: ${previous.fileName}`);
      }
    }
  }
  return next;
}

export async function updateImagePlacement(id: string, patch: { alt?: string; desktop?: PlacementTransform; mobile?: PlacementTransform | null }) {
  const placements = await readImagePlacements();
  const index = placements.findIndex((item) => item.id === id && item.status === "임시");
  if (index < 0) throw new Error("임시 배치를 찾을 수 없습니다.");
  const current = placements[index];
  placements[index] = {
    ...current,
    ...(typeof patch.alt === "string" ? { alt: patch.alt } : {}),
    ...(patch.desktop ? { desktop: normalizePlacementTransform(patch.desktop) } : {}),
    ...(patch.mobile === null ? { mobile: undefined } : patch.mobile ? { mobile: normalizePlacementTransform(patch.mobile) } : {}),
    placedAt: new Date().toISOString(),
  };
  await writeImagePlacements(placements);
  return placements[index];
}

export async function cancelImagePlacement(id: string) {
  const placements = await readImagePlacements();
  const target = placements.find((item) => item.id === id && item.status === "임시");
  if (!target) throw new Error("취소할 임시 배치를 찾을 수 없습니다.");
  const next = placements.filter((item) => item.id !== id);
  await writeImagePlacements(next);

  if (target.kind === "사진" && !next.some((item) => item.fileName === target.fileName && item.status === "임시")) {
    try {
      await unlink(path.join(inboxPath, safeInboxFileName(target.fileName)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return target;
}

export function imagePlacementFilePath(fileName: string) {
  return path.join(inboxPath, safeInboxFileName(fileName));
}
