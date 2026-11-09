import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getVisibleColumn } from "@/content/columns";
import { SITE_URL } from "@/content/site";

export const alt = "글로리의원 대표원장 이호 칼럼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ColumnOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const column = getVisibleColumn(slug);
  if (!column) notFound();
  const background = column.photo.src ? (column.photo.src.startsWith("http") ? column.photo.src : `${SITE_URL}${column.photo.src}`) : undefined;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", padding: "68px 78px", background: background ? `linear-gradient(rgba(43,43,43,.72),rgba(43,43,43,.72)),url(${background}) center/cover` : "#BAAB9C", color: "#fff", fontFamily: "Noto Sans KR, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", fontSize: 23, letterSpacing: 4 }}>DOCTOR&apos;S COLUMN · GLORY CLINIC</div>
        <div style={{ display: "flex", maxWidth: 1040, fontSize: 56, fontWeight: 700, lineHeight: 1.35 }}>{column.title}</div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,.5)", paddingTop: 26, fontSize: 25 }}>대표원장 이호 · 글로리의원</div>
      </div>
    </div>,
    size,
  );
}
