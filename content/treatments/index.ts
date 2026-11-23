import type { TreatmentDetail } from "./types";
import { ondaTreatment } from "./onda";
import { thermageFlxTreatment } from "./thermage-flx";

export const treatmentDetails: TreatmentDetail[] = [thermageFlxTreatment, ondaTreatment];

export function getTreatmentDetail(category: string, slug: string) {
  return treatmentDetails.find((treatment) => treatment.category === category && treatment.slug === slug);
}

export type { TreatmentDetail } from "./types";
