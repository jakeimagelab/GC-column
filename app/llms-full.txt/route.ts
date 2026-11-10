import { getPublishedColumns } from "@/content/columns";
import { SITE_URL } from "@/content/site";
import { stripMotionMarkup } from "@/lib/motion";

export const dynamic = "force-static";

function columnMarkdown(column: ReturnType<typeof getPublishedColumns>[number]) {
  const sections = column.sections.map((section) => {
    const table = section.table ? [
      `| ${section.table.head.map(stripMotionMarkup).join(" | ")} |`,
      `| ${section.table.head.map(() => "---").join(" | ")} |`,
      ...section.table.rows.map((row) => `| ${row.map(stripMotionMarkup).join(" | ")} |`),
    ].join("\n") : "";
    return [`## ${stripMotionMarkup(section.heading)}`, "", ...section.body.map(stripMotionMarkup), "", table].filter(Boolean).join("\n");
  }).join("\n\n");
  const faqs = column.faqs.map((faq) => `### ${stripMotionMarkup(faq.q)}\n\n${stripMotionMarkup(faq.a)}`).join("\n\n");
  return `# ${stripMotionMarkup(column.title)}\n\n- URL: ${SITE_URL}/column/${column.slug}\n- 작성자: ${stripMotionMarkup(column.author)}\n- 발행일: ${column.publishedAt}\n\n## 이 글의 핵심\n\n${stripMotionMarkup(column.summary)}\n\n${column.keyPoints.map((point) => `- ${stripMotionMarkup(point)}`).join("\n")}\n\n${sections}\n\n## 자주 묻는 질문\n\n${faqs}`;
}

export function GET() {
  return new Response(getPublishedColumns().map(columnMarkdown).join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
