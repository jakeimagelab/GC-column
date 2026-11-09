import { NextRequest, NextResponse } from "next/server";
import { saveQuestion } from "@/lib/questionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL_PATTERN = /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|kr|io))(?:\S*)/i;
const ONE_MINUTE = 60_000;

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ ready: false, message: "질문 접수 기능은 준비 중입니다." }, { status: 503 });
  }

  try {
    const body = await request.json() as {
      columnSlug?: string | null;
      question?: string;
      consentPrivacy?: boolean;
      consentPublic?: boolean;
      website?: string;
    };
    if (body.website) return NextResponse.json({ ok: true, message: "질문이 원장님께 전달되었습니다." });

    const question = body.question?.trim() ?? "";
    if (question.length < 10 || question.length > 500) throw new Error("질문은 10자 이상 500자 이하로 입력해 주세요.");
    if (URL_PATTERN.test(question)) throw new Error("링크가 포함된 질문은 접수할 수 없습니다.");
    if (body.consentPrivacy !== true) throw new Error("질문 내용 수집·이용에 동의해 주세요.");

    const lastSubmittedAt = Number(request.cookies.get("glory_qna_last")?.value ?? "0");
    if (Date.now() - lastSubmittedAt < ONE_MINUTE) throw new Error("질문은 1분에 한 번 보낼 수 있습니다.");

    const saved = await saveQuestion({
      columnSlug: typeof body.columnSlug === "string" && body.columnSlug ? body.columnSlug : null,
      question,
      consentPrivacy: true,
      consentPublic: body.consentPublic === true,
    });
    const response = NextResponse.json({ ok: true, id: saved.id, message: "질문이 원장님께 전달되었습니다." });
    response.cookies.set("glory_qna_last", String(Date.now()), { httpOnly: true, sameSite: "lax", maxAge: 60, path: "/" });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "질문을 접수하지 못했습니다." }, { status: 400 });
  }
}
