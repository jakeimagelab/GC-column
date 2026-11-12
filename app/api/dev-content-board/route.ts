import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  contentBoardAssetPath,
  readContentBoard,
  saveBoardImage,
  updateBoardItem,
  updateBoardSlide,
} from "@/lib/contentBoardStore";
import type { BoardImageEffects, BoardImageTransform, BoardTextStyle, BoardStatus } from "@/lib/contentBoardTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function imageMime(file: File) {
  if (["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) return file.type;
  return mimeByExtension[path.extname(file.name).toLowerCase()] ?? "";
}

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const number = (value: unknown, minimum: number, maximum: number, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
};

function transform(value: unknown): BoardImageTransform {
  const data = value && typeof value === "object" ? value as Partial<BoardImageTransform> : {};
  return {
    x: number(data.x, 0, 100, 50),
    y: number(data.y, 0, 100, 50),
    zoom: number(data.zoom, 100, 300, 100),
  };
}

function textStyle(value: unknown): BoardTextStyle {
  const data = value && typeof value === "object" ? value as Partial<BoardTextStyle> : {};
  const alignments = new Set(["left", "center", "right"]);
  return {
    fontFamily: String(data.fontFamily ?? "Noto Sans KR").slice(0, 80),
    fontSize: number(data.fontSize, 10, 120, 17),
    fontWeight: number(data.fontWeight, 300, 900, 400),
    color: /^#[0-9a-f]{6}$/i.test(String(data.color)) ? String(data.color) : "#2b2b2b",
    lineHeight: number(data.lineHeight, 0.8, 2.5, 1.6),
    letterSpacing: number(data.letterSpacing, -5, 20, 0),
    textAlign: alignments.has(String(data.textAlign)) ? data.textAlign as BoardTextStyle["textAlign"] : "left",
  };
}

function effects(value: unknown): Partial<BoardImageEffects> {
  const data = value && typeof value === "object" ? value as Partial<BoardImageEffects> : {};
  const aspects = new Set(["free", "16:9", "4:3", "1:1", "3:4"]);
  const directions = new Set(["to right", "to left", "to bottom", "to top"]);
  return {
    ...(data.opacity !== undefined ? { opacity: number(data.opacity, 0, 100, 100) } : {}),
    ...(data.cropAspect !== undefined && aspects.has(String(data.cropAspect)) ? { cropAspect: data.cropAspect as BoardImageEffects["cropAspect"] } : {}),
    ...(data.overlayColor !== undefined && /^#[0-9a-f]{6}$/i.test(String(data.overlayColor)) ? { overlayColor: String(data.overlayColor) } : {}),
    ...(data.overlayOpacity !== undefined ? { overlayOpacity: number(data.overlayOpacity, 0, 100, 0) } : {}),
    ...(data.gradientEnabled !== undefined ? { gradientEnabled: Boolean(data.gradientEnabled) } : {}),
    ...(data.gradientDirection !== undefined && directions.has(String(data.gradientDirection)) ? { gradientDirection: data.gradientDirection as BoardImageEffects["gradientDirection"] } : {}),
    ...(data.gradientColor !== undefined && /^#[0-9a-f]{6}$/i.test(String(data.gradientColor)) ? { gradientColor: String(data.gradientColor) } : {}),
    ...(data.gradientOpacity !== undefined ? { gradientOpacity: number(data.gradientOpacity, 0, 100, 55) } : {}),
  };
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  const asset = new URL(request.url).searchParams.get("asset");
  if (asset) {
    try {
      const bytes = await readFile(contentBoardAssetPath(asset));
      return new Response(bytes, {
        headers: {
          "Content-Type": mimeByExtension[path.extname(asset).toLowerCase()] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return NextResponse.json({ error: "사진을 찾을 수 없습니다." }, { status: 404 });
    }
  }
  return NextResponse.json({ board: await readContentBoard() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const form = await request.formData();
    const file = form.get("file");
    const slideId = form.get("slideId");
    const itemId = form.get("itemId");
    if (!(file instanceof File) || typeof slideId !== "string" || typeof itemId !== "string") throw new Error("사진과 배치할 자리를 확인해 주세요.");
    if (file.size > 30 * 1024 * 1024) throw new Error("사진은 한 장당 30MB 이하여야 합니다.");
    const mimeType = imageMime(file);
    if (!mimeType) throw new Error("JPG, PNG, WebP, SVG 이미지만 사용할 수 있습니다.");
    const result = await saveBoardImage(slideId, itemId, file.name, mimeType, new Uint8Array(await file.arrayBuffer()));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "사진을 저장하지 못했습니다." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const body = await request.json() as Record<string, unknown>;
    const kind = String(body.kind ?? "");
    const slideId = String(body.slideId ?? "");
    const patch = body.patch && typeof body.patch === "object" ? body.patch as Record<string, unknown> : {};
    if (kind === "slide") {
      const statuses = new Set<BoardStatus>(["작성 중", "확인 필요", "작성 완료"]);
      const status = statuses.has(patch.status as BoardStatus) ? patch.status as BoardStatus : undefined;
      const board = await updateBoardSlide(slideId, { status, ...(typeof patch.note === "string" ? { note: patch.note.slice(0, 5000) } : {}) });
      return NextResponse.json({ board });
    }
    if (kind === "text") {
      const itemId = String(body.itemId ?? "");
      const board = await updateBoardItem(slideId, itemId, {
        ...(typeof patch.value === "string" ? { value: patch.value.slice(0, 20000) } : {}),
        ...(patch.style ? { style: textStyle(patch.style) } : {}),
        ...(typeof patch.styleTouched === "boolean" ? { styleTouched: patch.styleTouched } : {}),
        ...(typeof patch.note === "string" ? { note: patch.note.slice(0, 3000) } : {}),
      });
      return NextResponse.json({ board });
    }
    if (kind === "image") {
      const itemId = String(body.itemId ?? "");
      const board = await updateBoardItem(slideId, itemId, {
        ...(typeof patch.alt === "string" ? { alt: patch.alt.slice(0, 500) } : {}),
        ...(patch.desktop ? { desktop: transform(patch.desktop) } : {}),
        ...(patch.mobile === null ? { mobile: undefined } : patch.mobile ? { mobile: transform(patch.mobile) } : {}),
        ...(patch.effects ? { effects: effects(patch.effects) as BoardImageEffects } : {}),
        ...(typeof patch.note === "string" ? { note: patch.note.slice(0, 3000) } : {}),
        ...(patch.asset === null ? { asset: null, originalFileName: null } : {}),
      });
      return NextResponse.json({ board });
    }
    throw new Error("저장할 항목을 확인해 주세요.");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "편집 내용을 저장하지 못했습니다." }, { status: 400 });
  }
}
