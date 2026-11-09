import { getPublishedColumns } from "@/content/columns";
import { SITE_URL } from "@/content/site";

export const dynamic = "force-static";

function columnMarkdown(column: ReturnType<typeof getPublishedColumns>[number]) {
  const sections = column.sections.map((section) => {
    const table = section.table ? [
      `| ${section.table.head.join(" | ")} |`,
      `| ${section.table.head.map(() => "---").join(" | ")} |`,
      ...section.table.rows.map((row) => `| ${row.join(" | ")} |`),
    ].join("\n") : "";
    return [`## ${section.heading}`, "", ...section.body, "", table].filter(Boolean).join("\n");
  }).join("\n\n");
  const faqs = column.faqs.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n");
  return `# ${column.title}\n\n- URL: ${SITE_URL}/column/${column.slug}\n- 작성자: ${column.author}\n- 발행일: ${column.publishedAt}\n\n## 이 글의 핵심\n\n${column.summary}\n\n${column.keyPoints.map((point) => `- ${point}`).join("\n")}\n\n${sections}\n\n## 자주 묻는 질문\n\n${faqs}`;
}

export function GET() {
  return new Response(getPublishedColumns().map(columnMarkdown).join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
