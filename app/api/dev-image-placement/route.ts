import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import type { PlacementTransform } from "@/lib/imagePlacement";
import {
  cancelImagePlacement,
  createImagePlacement,
  imagePlacementFilePath,
  readImagePlacements,
  updateImagePlacement,
} from "@/lib/imagePlacementStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function parseTransform(value: unknown): PlacementTransform {
  if (!value || typeof value !== "object") return { x: 50, y: 50, zoom: 100 };
  const transform = value as Partial<PlacementTransform>;
  return {
    x: Number.isFinite(transform.x) ? Number(transform.x) : 50,
    y: Number.isFinite(transform.y) ? Number(transform.y) : 50,
    zoom: Number.isFinite(transform.zoom) ? Number(transform.zoom) : 100,
  };
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  const fileName = new URL(request.url).searchParams.get("file");
  if (fileName) {
    try {
      const bytes = await readFile(imagePlacementFilePath(fileName));
      const mime = mimeByExtension[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";
      return new Response(bytes, { headers: { "Content-Type": mime, "Cache-Control": "no-store" } });
    } catch {
      return NextResponse.json({ error: "사진을 찾을 수 없습니다." }, { status: 404 });
    }
  }
  return NextResponse.json({ placements: await readImagePlacements() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const metadataValue = form.get("metadata");
      if (!(file instanceof File) || typeof metadataValue !== "string") throw new Error("배치할 사진 정보가 없습니다.");
      if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) throw new Error("JPG, PNG, WebP 사진만 배치할 수 있습니다.");
      if (file.size > 30 * 1024 * 1024) throw new Error("사진은 30MB 이하여야 합니다.");
      const metadata = JSON.parse(metadataValue) as Record<string, unknown>;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const image = await sharp(bytes).metadata();
      const placement = await createImagePlacement({
        slotId: String(metadata.slotId ?? ""),
        page: String(metadata.page ?? ""),
        section: String(metadata.section ?? ""),
        slotName: String(metadata.slotName ?? ""),
        fileName: file.name,
        alt: String(metadata.alt ?? ""),
        kind: "사진",
        desktop: parseTransform(metadata.desktop),
        mobile: metadata.mobile ? parseTransform(metadata.mobile) : undefined,
        width: image.width,
        height: image.height,
        warning: typeof metadata.warning === "string" ? metadata.warning : undefined,
      }, bytes);
      return NextResponse.json({ placement });
    }

    const body = await request.json() as Record<string, unknown>;
    if (!body.slotId || !body.sourceSrc) throw new Error("조정할 사진 정보가 없습니다.");
    const placement = await createImagePlacement({
      slotId: String(body.slotId),
      page: String(body.page ?? ""),
      section: String(body.section ?? ""),
      slotName: String(body.slotName ?? ""),
      fileName: path.basename(String(body.sourceSrc)),
      sourceSrc: String(body.sourceSrc),
      alt: String(body.alt ?? ""),
      kind: "조정",
      desktop: parseTransform(body.desktop),
      mobile: body.mobile ? parseTransform(body.mobile) : undefined,
    });
    return NextResponse.json({ placement });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "임시 배치에 실패했습니다." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const body = await request.json() as { id?: string; alt?: string; desktop?: PlacementTransform; mobile?: PlacementTransform | null };
    if (!body.id) throw new Error("수정할 임시 배치가 없습니다.");
    return NextResponse.json({ placement: await updateImagePlacement(body.id, body) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "배치 조정 저장에 실패했습니다." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const body = await request.json() as { id?: string };
    if (!body.id) throw new Error("취소할 임시 배치가 없습니다.");
    return NextResponse.json({ placement: await cancelImagePlacement(body.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "임시 배치 취소에 실패했습니다." }, { status: 400 });
  }
}
