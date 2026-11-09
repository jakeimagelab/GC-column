import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPublishedColumns } from "../content/columns.ts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const questions = JSON.parse(await readFile(path.join(root, "content", "questions.json"), "utf8"));
const publishedQuestions = questions.filter((item) => item.status === "published" && item.consentPublic && item.answer);
const columns = getPublishedColumns().map((column) => ({
  id: `column:${column.slug}`,
  type: "column",
  title: column.title,
  summary: column.summary,
  sections: column.sections,
  judgement: column.judgement,
  faqs: column.faqs,
  videoTranscript: column.video?.transcript ?? null,
  reviewedAt: column.reviewedAt ?? null,
  sourceUrl: `https://blog.gloryclinic.co.kr/column/${column.slug}`,
  approvedByDoctor: true,
}));
const qna = publishedQuestions.map((item) => ({
  id: `question:${item.id}`,
  type: "reader-question",
  question: item.question,
  answer: item.answer,
  sourceUrl: item.columnSlug ? `https://blog.gloryclinic.co.kr/column/${item.columnSlug}#reader-${item.id}` : "https://blog.gloryclinic.co.kr",
  approvedByDoctor: item.approvedByDoctor,
  sourceColumns: item.sourceColumns,
  tags: item.tags,
}));
const targetDirectory = path.join(root, "docs", "knowledge");
await mkdir(targetDirectory, { recursive: true });
await writeFile(path.join(targetDirectory, "knowledge.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), items: [...columns, ...qna] }, null, 2)}\n`, "utf8");
console.log(`Exported ${columns.length} columns and ${qna.length} Q&A items.`);
