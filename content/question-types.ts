export type QuestionStatus = "pending" | "answered" | "published" | "rejected";

export type ReaderQuestion = {
  id: string;
  columnSlug: string | null;
  question: string;
  createdAt: string;
  status: QuestionStatus;
  consentPrivacy: true;
  consentPublic: boolean;
  answer: string | null;
  answeredBy: null | "대표원장 이호";
  answeredAt: string | null;
  approvedByDoctor: boolean;
  sourceColumns: string[];
  tags: string[];
};

export type NewReaderQuestion = Pick<ReaderQuestion, "columnSlug" | "question" | "consentPrivacy" | "consentPublic">;
