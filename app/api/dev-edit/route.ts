import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ImageContentEntry, SiteContentEntry } from "@/content/site-content-types";
import {
  normalizeImageEntry,
  readSiteContent,
  saveUploadedImage,
  updateSiteContentEntry,
} from "@/lib/contentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function refreshPages() {
  revalidatePath("/");
  revalidatePath("/column");
  revalidatePath("/column/[slug]", "page");
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") return unavailable();
  return NextResponse.json(await readSiteContent());
}

export async function PATCH(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const body = await request.json() as { id?: string; entry?: SiteContentEntry };
    if (!body.id || !body.entry) throw new Error("저장할 항목이 없습니다.");
    const entry = body.entry.type === "text" ? body.entry : normalizeImageEntry(body.entry);
    const saved = await updateSiteContentEntry(body.id, entry);
    refreshPages();
    return NextResponse.json({ id: body.id, entry: saved });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "저장에 실패했습니다." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return unavailable();
  try {
    const form = await request.formData();
    const id = form.get("id");
    const file = form.get("file");
    if (typeof id !== "string" || !(file instanceof File)) throw new Error("이미지 파일을 선택해 주세요.");
    if (file.size > 15 * 1024 * 1024) throw new Error("이미지는 15MB 이하여야 합니다.");
    const content = await readSiteContent();
    const current = content[id];
    if (!current || (current.type !== "image" && current.type !== "bgImage")) throw new Error("편집할 수 없는 이미지입니다.");
    const src = await saveUploadedImage(id, new Uint8Array(await file.arrayBuffer()), file.type);
    const entry: ImageContentEntry = { ...current, src };
    await updateSiteContentEntry(id, entry);
    refreshPages();
    return NextResponse.json({ id, entry });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "업로드에 실패했습니다." }, { status: 400 });
  }
}
