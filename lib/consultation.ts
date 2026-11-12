import type { ConsultationAnswers, ConsultationMatch, ConsultationTreatment } from "@/content/consultation-types";

export function matchConsultationTreatments(
  treatments: ConsultationTreatment[],
  answers: ConsultationAnswers,
): ConsultationMatch[] {
  return treatments
    .filter((treatment) => treatment.active && treatment.concerns.includes(answers.concern))
    .map((treatment) => {
      const hasPrice = treatment.priceMin !== null && treatment.priceMax !== null;
      const budgetStatus = !hasPrice || answers.budget === null
        ? "unknown" as const
        : treatment.priceMin! <= answers.budget
          ? "fit" as const
          : "over" as const;
      const score = 10
        + (treatment.preferences.includes(answers.preference) ? 3 : 0)
        + (budgetStatus === "fit" ? 2 : 0)
        - (budgetStatus === "over" ? 4 : 0);
      return { ...treatment, score, budgetStatus };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"))
    .slice(0, 3);
}

export function formatTreatmentPrice(treatment: ConsultationTreatment) {
  if (treatment.priceMin === null || treatment.priceMax === null) return "비용 정보 원장 검수 전";
  const format = (value: number) => `${Math.round(value / 10_000).toLocaleString("ko-KR")}만원`;
  return treatment.priceMin === treatment.priceMax
    ? `${format(treatment.priceMin)} · ${treatment.priceUnit}`
    : `${format(treatment.priceMin)}~${format(treatment.priceMax)} · ${treatment.priceUnit}`;
}
