import { getPublishedColumns } from "@/content/columns";
import { getText } from "@/content/site-content-types";
import { SITE_URL } from "@/content/site";
import { readSiteContent } from "@/lib/contentStore";
import { stripMotionMarkup } from "@/lib/motion";

export const dynamic = "force-static";

export async function GET() {
  const content = await readSiteContent();
  const introductions = [1, 2, 3].map((index) => getText(content, `seo.llms.intro.${index}`));
  const columns = getPublishedColumns().map((column) => `- [${stripMotionMarkup(column.title)}](${SITE_URL}/column/${column.slug}): ${stripMotionMarkup(column.summary)}`);
  const body = [
    "# 글로리의원", "", ...introductions, "",
    `## 원장\n\n- [대표원장 이호](${SITE_URL}/doctor/lee-ho): ${getText(content, "doctor.philosophy")}`,
    "", "## 주요 칼럼", "", ...columns, "", `- [전체 칼럼](${SITE_URL}/column/all)`,
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
