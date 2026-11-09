import "server-only";

import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NewReaderQuestion, ReaderQuestion } from "@/content/question-types";

const questionsPath = path.join(process.cwd(), "content", "questions.json");

export async function readQuestions(): Promise<ReaderQuestion[]> {
  return JSON.parse(await readFile(questionsPath, "utf8")) as ReaderQuestion[];
}
export async function readPublishedQuestions(columnSlug?: string | null) {
  const questions = await readQuestions();
  return questions.filter((item) =>
    item.status === "published" &&
    item.consentPublic &&
    Boolean(item.answer) &&
    (columnSlug === undefined || item.columnSlug === columnSlug),
  );
}

export async function saveQuestion(input: NewReaderQuestion) {
  if (process.env.NODE_ENV !== "development") throw new Error("질문 접수는 현재 준비 중입니다.");
  const questions = await readQuestions();
  const question: ReaderQuestion = {
    id: crypto.randomUUID(),
    columnSlug: input.columnSlug,
    question: input.question.trim(),
    createdAt: new Date().toISOString(),
    status: "pending",
    consentPrivacy: true,
    consentPublic: input.consentPublic,
    answer: null,
    answeredBy: null,
    answeredAt: null,
    approvedByDoctor: false,
    sourceColumns: input.columnSlug ? [input.columnSlug] : [],
    tags: [],
  };
  const temporaryPath = `${questionsPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify([...questions, question], null, 2)}\n`, "utf8");
  await rename(temporaryPath, questionsPath);
  return question;
}
