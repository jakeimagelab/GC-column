import { ImageResponse } from "next/og";
import { getText } from "@/content/site-content-types";
import { readSiteContent } from "@/lib/contentStore";

export const alt = "언주역 글로리의원 대표원장 칼럼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const content = await readSiteContent();
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 84px", background: "#F3F0EB", color: "#2B2B2B", fontFamily: "Noto Sans KR, sans-serif" }}>
      <div style={{ display: "flex", color: "#6E6052", fontSize: 24, letterSpacing: 4 }}>GLORY CLINIC</div>
      <div style={{ display: "flex", maxWidth: 980, fontSize: 58, fontWeight: 700, lineHeight: 1.3 }}>{getText(content, "seo.home.title")}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #CFC5B8", paddingTop: 28, fontSize: 24 }}>
        <span>{getText(content, "common.brand.name")}</span><span>대표원장 이호</span>
      </div>
    </div>,
    size,
  );
}
