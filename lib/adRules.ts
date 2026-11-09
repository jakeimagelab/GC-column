export const MEDICAL_AD_CAUTION_TERMS = [
  "최고",
  "최초",
  "유일",
  "100%",
  "완벽",
  "보장",
  "부작용 없",
  "통증 없",
  "무통",
  "1위",
  "특가",
] as const;

export type AdRuleWarning = {
  term: (typeof MEDICAL_AD_CAUTION_TERMS)[number];
  index: number;
};

export function findAdRuleWarnings(value: string): AdRuleWarning[] {
  return MEDICAL_AD_CAUTION_TERMS.flatMap((term) => {
    const index = value.indexOf(term);
    return index >= 0 ? [{ term, index }] : [];
  });
}
