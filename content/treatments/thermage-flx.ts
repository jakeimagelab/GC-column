import type { DeviceTreatmentDetail } from "./types";

// TODO(launch): Solta Medical owns the current handpiece/tip reference images.
// Replace them with Solta Medical Korea-approved official assets, or secure written
// permission before production distribution.
export const thermageFlxTreatment: DeviceTreatmentDetail = {
  slug: "thermage-flx",
  category: "lifting",
  name: "써마지FLX",
  nameEn: "Thermage FLX",
  kind: "device",
  accent: "#4A2878",
  accentSoft: "#F3EFF8",
  accentLight: "#C9B6E4",
  hero: {
    eyebrow: "LIFTING · RADIOFREQUENCY",
    title: "써마지FLX",
    titleEn: "Thermage FLX",
    oneLiner: "핵심 쿨링 기술로 표면 손상은 줄이고,\n진피층에 고주파 에너지를 전달하는 리프팅입니다.",
    chips: [
      { label: "소요 시간", value: "[원장 확인]", needsReview: true },
      { label: "통증", value: "[원장 확인]", needsReview: true },
      { label: "일상 복귀", value: "[원장 확인]", needsReview: true },
    ],
    image: {
      src: "/uploads/treatments/thermage-flx/device-cutout.png",
      alt: "글로리의원에서 사용하는 써마지FLX 장비",
    },
  },
  glance: {
    lead: "고주파(RF) 에너지를\n진피층에 전달하는 리프팅입니다.\n표면은 식히고,\n피부 속은 데웁니다.",
    items: [
      { label: "어떤 분께", value: "[원장 확인]", needsReview: true },
      { label: "시간 · 통증", value: "[원장 확인]", needsReview: true },
      { label: "일상 복귀", value: "[원장 확인]", needsReview: true },
    ],
    video: {
      label: "써마지FLX,\n이런 분께 권해요",
    },
  },
  forYou: {
    recommend: ["[원장 확인]", "[원장 확인]", "[원장 확인]"],
    consultFirst: ["[원장 확인]", "[원장 확인]"],
    needsReview: true,
  },
  mechanism: {
    lead: "에너지가 들어가는 순간마다,\n표면을 식히는 4단계입니다.",
    steps: [
      "고주파 에너지가 들어가기 직전,\n진동과 쿨링 기능이 작동합니다.",
      "고주파 에너지가\n진피층까지 전달됩니다.",
      "에너지가 닿는 동안\n표면 쿨링 시스템이 작동합니다.",
      "에너지 전달 후,\n표면을 다시 한번 쿨링합니다.",
    ],
    illustration: {
      alt: "써마지FLX 고주파 에너지와 표면 쿨링 작동 원리",
    },
  },
  compare: {
    columns: ["구분", "써마지FLX", "울쎄라피프라임", "세르프"],
    highlightColumn: 1,
    rows: [
      { label: "에너지", values: ["고주파(RF)", "초음파", "고주파(RF)"] },
      { label: "주로 닿는 층", values: ["진피층", "피하지방 · 근막층", "진피층 + 더 깊은 층"] },
      { label: "이런 고민에", values: ["[원장 확인]", "[원장 확인]", "[원장 확인]"], needsReview: true },
    ],
    columnLink: {
      href: "/column/xerf-vs-thermage",
      label: "세르프와 써마지 비교 칼럼 →",
    },
  },
  handpieceTips: {
    handpiece: {
      src: "/uploads/treatments/thermage-flx/handpiece.png",
      alt: "써마지FLX 싱글 핸드피스",
      title: "싱글 핸드피스",
      desc: "핸드피스 교체 없이 얼굴부터 바디까지\n진동 · 쿨링 기능 내장",
    },
    tips: [
      { name: "토탈 팁", size: "4.0 cm²", area: "얼굴 · 바디", src: "/uploads/treatments/thermage-flx/tip-total-4.png" },
      { name: "토탈 팁", size: "3.0 cm²", area: "얼굴 · 바디", src: "/uploads/treatments/thermage-flx/tip-total-3.png" },
      { name: "아이 팁", size: "0.25 cm²", area: "눈꺼풀 · 눈가", src: "/uploads/treatments/thermage-flx/tip-eye.png" },
      { name: "바디 팁", size: "16.0 cm²", area: "복부 · 허벅지 등", src: "/uploads/treatments/thermage-flx/tip-body.png" },
    ],
    note: "글로리의원 보유 팁 [원장 확인]",
    noteNeedsReview: true,
  },
  genuine: [
    { title: "정품 장비 · 정품 팁", desc: "써마지FLX 정품 장비와 정품 팁을 사용합니다." },
    { title: "1인 1팁 · 눈앞에서 개봉", desc: "[원장 확인]", needsReview: true },
    { title: "정품 팁 인증서 발급", desc: "시술 후 정품 팁 인증서를 발급해 드립니다." },
  ],
  process: [
    { step: 1, title: "원장 1:1 상담" },
    { step: 2, title: "써마지 과정 설명" },
    { step: 3, title: "클렌징 및 준비" },
    { step: 4, title: "써마지FLX 시술" },
    { step: 5, title: "마무리 케어" },
    { step: 6, title: "주의사항 안내" },
  ],
  totalTime: { value: "[원장 확인]", needsReview: true },
  painResult: {
    pain: { label: "아픈가요?", value: "통증 정도와 마취 방법 [원장 확인]", needsReview: true },
    result: { label: "언제부터 달라지나요?\n몇 번 받나요?", value: "변화 시점과 권장 횟수 [원장 확인]", needsReview: true },
  },
  promise: {
    quote: "가족에게 권하지 못하는 시술이라면,\n환자에게도 권하지 않겠습니다.",
    signature: "대표원장 이호",
    items: [
      "가족에게 권하지 못하는 시술은\n권하지 않습니다.",
      "상담을 진행한 원장이\n직접 시술합니다.",
      "시술 후 불편감이 생기면,\n끝까지 사후관리를 합니다.",
    ],
  },
  care: {
    before: ["[원장 확인]", "[원장 확인]"],
    after: ["[원장 확인]", "[원장 확인]"],
    needsReview: true,
  },
  faq: [
    {
      q: "써마지FLX는 어떤 시술인가요?",
      a: "고주파(RF) 에너지를 진피층에 전달하는 리프팅 시술입니다. 핵심 쿨링 기술로 표면 피부조직의 손상은 줄이면서 에너지를 전달합니다.",
    },
    { q: "써마지FLX는 아픈가요?", a: "[원장 확인]", needsReview: true },
    { q: "몇 번 받아야 하나요?", a: "[원장 확인]", needsReview: true },
    { q: "울쎄라피프라임과 함께 받아도 되나요?", a: "[원장 확인]", needsReview: true },
    { q: "시술 후 바로 일상생활이 가능한가요?", a: "[원장 확인]", needsReview: true },
  ],
  relatedColumnSlug: "xerf-vs-thermage",
  relatedConcerns: [
    { label: "처짐·탄력", href: "/column/category/lifting?concern=sagging" },
    { label: "주름·볼륨", href: "/column/category/lifting?concern=wrinkle-volume" },
  ],
  bodyLocation: { value: "얼굴", needsReview: true },
  doctor: {
    name: "이호",
    title: "대표원장",
    reviewedAt: "[원장 확인]",
    needsReview: true,
    careers: [
      "現 글로리의원 대표원장",
      "前 리쥬미의원 원장",
      "前 바오밥성형외과 원장",
      "한양대학교 의과대학 졸업",
    ],
  },
  sources: [
    { label: "Thermage FLX 공식 안내", href: "https://www.thermage.com/" },
  ],
};
