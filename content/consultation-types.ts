export type ConsultationGuideStatus = "review_required" | "published";

export type ConsultationTreatment = {
  id: string;
  name: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  priceUnit: string;
  concerns: string[];
  preferences: string[];
  effectSummary: string;
  limitSummary: string;
  cautionSummary: string;
  sourceColumnSlugs: string[];
  doctorApprovedAt: string | null;
  active: boolean;
};

export type ConsultationGuideData = {
  version: number;
  status: ConsultationGuideStatus;
  treatments: ConsultationTreatment[];
};

export type ConsultationAnswers = {
  ageRange: string;
  gender: string;
  concern: string;
  budget: number | null;
  preference: string;
};

export type ConsultationMatch = ConsultationTreatment & {
  score: number;
  budgetStatus: "fit" | "over" | "unknown";
};
