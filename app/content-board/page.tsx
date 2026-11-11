import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentBoardEditor } from "@/components/ContentBoardEditor";
import { readContentBoard } from "@/lib/contentBoardStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "콘텐츠 편집 슬라이드 | 글로리의원",
  robots: { index: false, follow: false },
};

export default async function ContentBoardPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ContentBoardEditor initialBoard={await readContentBoard()} />;
}
