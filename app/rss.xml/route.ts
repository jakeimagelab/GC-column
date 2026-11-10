import { getPublishedColumns } from "@/content/columns";
import { SITE_URL } from "@/content/site";
import { stripMotionMarkup } from "@/lib/motion";

export const dynamic = "force-static";

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  const items = getPublishedColumns().slice(0, 20).map((column) => {
    const url = `${SITE_URL}/column/${column.slug}`;
    const pubDate = new Date(`${column.publishedAt}T00:00:00+09:00`).toUTCString();
    return `<item><title>${xml(stripMotionMarkup(column.title))}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xml(stripMotionMarkup(column.summary))}</description><pubDate>${pubDate}</pubDate><dc:creator>${xml(stripMotionMarkup(column.author))}</dc:creator></item>`;
  }).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>원장 칼럼 | 언주역 글로리의원</title><link>${SITE_URL}/column</link><description>글로리의원 대표원장 이호가 직접 작성한 피부 시술 칼럼</description><language>ko-KR</language>${items}</channel></rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
