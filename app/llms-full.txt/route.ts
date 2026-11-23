import { getPublishedColumns } from "@/content/columns";
import { SITE_URL } from "@/content/site";
import { stripMotionMarkup } from "@/lib/motion";

export const dynamic = "force-static";

function columnMarkdown(column: ReturnType<typeof getPublishedColumns>[number]) {
  const sections = column.sections.map((section) => {
    if (section.kind === "image") {
      return `![${stripMotionMarkup(section.alt)}](${SITE_URL}${section.src})\n\n*${stripMotionMarkup(section.caption)}*`;
    }
    const table = section.table ? [
      `| ${section.table.head.map(stripMotionMarkup).join(" | ")} |`,
      `| ${section.table.head.map(() => "---").join(" | ")} |`,
      ...section.table.rows.map((row) => `| ${row.map(stripMotionMarkup).join(" | ")} |`),
    ].join("\n") : "";
    const publicBody = section.body.filter((paragraph) => !paragraph.includes("[원장 확인]"));
    return [`## ${stripMotionMarkup(section.heading)}`, "", ...publicBody.map(stripMotionMarkup), "", table].filter(Boolean).join("\n");
  }).join("\n\n");
  const faqs = column.faqs
    .filter((faq) => !faq.needsReview)
    .map((faq) => `### ${stripMotionMarkup(faq.q)}\n\n${stripMotionMarkup(faq.a)}`)
    .join("\n\n");
  return `# ${stripMotionMarkup(column.title)}\n\n- URL: ${SITE_URL}/column/${column.slug}\n- 작성자: ${stripMotionMarkup(column.author)}\n- 발행일: ${column.publishedAt}\n\n## 이 글의 핵심\n\n${stripMotionMarkup(column.summary)}\n\n${column.keyPoints.map((point) => `- ${stripMotionMarkup(point)}`).join("\n")}\n\n${sections}\n\n## 자주 묻는 질문\n\n${faqs}`;
}

export function GET() {
  return new Response(getPublishedColumns().map(columnMarkdown).join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
