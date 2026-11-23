import type { DeviceTreatmentDetail } from "./types";

export const ondaTreatment: DeviceTreatmentDetail = {
  slug: "onda",
  category: "lifting",
  name: "온다 리프팅",
  nameEn: "ONDA LIFTING",
  kind: "device",
  accent: "#8C7B6B",
  accentSoft: "#F4F0EB",
  accentLight: "#D8CABE",
  hero: {
    eyebrow: "LIFTING · MICROWAVE",
    title: "온다 리프팅",
    titleEn: "ONDA LIFTING",
    oneLiner: "2.45GHz 극초단파(Coolwaves®) 에너지를 목표 조직에 전달해,\n피하지방과 피부 탄력 고민을 함께 살피는 비침습적 에너지 시술입니다.",
    chips: [
      { label: "소요 시간", value: "[원장 확인]", needsReview: true },
      { label: "통증", value: "[원장 확인]", needsReview: true },
      { label: "일상 복귀", value: "[원장 확인]", needsReview: true },
    ],
    image: {
      src: "/uploads/glory-equipment-onda.png",
      alt: "글로리의원에서 사용하는 온다 리프팅 장비",
    },
  },
  glance: {
    lead: "2.45GHz 극초단파 에너지를\n목표 조직에 전달하는 시술입니다.\n피하지방과 피부 탄력을\n함께 살핍니다.",
    items: [
      { label: "시술 시간", value: "[원장 확인]", needsReview: true },
      { label: "통증 정도", value: "[원장 확인]", needsReview: true },
      { label: "일상 복귀", value: "[원장 확인]", needsReview: true },
    ],
  },
  forYou: {
    recommend: [
      "피하지방과 피부 탄력 저하가 함께 신경 쓰이는 경우",
      "얼굴선의 무게감을 줄이는 방향을 고민하는 경우",
      "피부 두께와 지방량을 함께 확인해 시술을 계획하고 싶은 경우",
    ],
    consultFirst: [
      "볼륨이 적은 얼굴인 경우",
      "피부가 얇아 다른 접근이 더 적절할 수 있는 경우",
    ],
    needsReview: true,
  },
  mechanism: {
    lead: "피부 두께와 지방량을 확인한 뒤,\n적용 부위에 맞춰 에너지를 전달합니다.",
    steps: [
      "피부 두께와\n피하지방의 양을 확인합니다.",
      "적용 부위와\n에너지 계획을 정합니다.",
      "2.45GHz 극초단파 에너지를\n목표 조직에 전달합니다.",
      "시술 후 피부 반응과\n주의사항을 확인합니다.",
    ],
    needsReview: true,
    illustration: {
      src: "/uploads/onda-illustration-skin-layers.webp",
      alt: "피부의 표피, 진피, 피하지방과 온다 에너지 전달을 설명하는 단면 일러스트",
    },
  },
  compare: {
    columns: ["구분", "온다 리프팅", "울쎄라피프라임", "써마지FLX"],
    highlightColumn: 1,
    rows: [
      { label: "에너지", values: ["2.45GHz 극초단파", "미세 집속 초음파", "단극성 고주파"], needsReview: true },
      { label: "관찰 기준", values: ["피하지방 · 피부 탄력", "실시간 영상으로 목표 층 확인", "진피 콜라겐 리모델링"], needsReview: true },
      { label: "핸드피스", values: ["깊이별 핸드피스", "깊이별 트랜스듀서", "부위별 팁"], needsReview: true },
      { label: "글로리 적용 기준", values: ["[원장 확인]", "[원장 확인]", "[원장 확인]"], needsReview: true },
    ],
    columnLink: {
      href: "/column/xerf-vs-thermage",
      label: "에너지 리프팅 비교 칼럼 →",
    },
  },
  genuine: [
    { title: "시술 전 확인", desc: "사용 장비와 핸드피스 안내 [원장 확인]", needsReview: true },
    { title: "확인 자료", desc: "제공 가능한 인증 자료 [원장 확인]", needsReview: true },
  ],
  process: [
    { step: 1, title: "원장 1:1 상담" },
    { step: 2, title: "온다 과정 설명" },
    { step: 3, title: "클렌징 및 준비" },
    { step: 4, title: "온다 시술" },
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
    before: [
      "복용 약, 임신 가능성, 삽입형 의료기기 여부를 시술 전 의료진에게 알려주세요. [원장 확인]",
      "이전에 받은 에너지 시술과 시기를 상담 시 알려주세요. [원장 확인]",
    ],
    after: [
      "시술 부위를 과도하게 문지르거나 강한 열 자극을 주는 행동은 피해주세요. [원장 확인]",
      "불편감이 예상보다 오래 지속되면 병원으로 연락해주세요. [원장 확인]",
    ],
    needsReview: true,
  },
  faq: [
    { q: "온다 리프팅은 얼굴 전체에 받을 수 있나요?", a: "적용 부위는 피부 두께와 지방량을 확인한 뒤 결정합니다. 얼굴 전체 적용 범위는 [원장 확인]이 필요합니다.", needsReview: true },
    { q: "다른 리프팅 장비와 함께 받아도 되나요?", a: "장비마다 목표 조직과 에너지 특성이 달라 병행 여부와 순서는 개인별 진료 후 정합니다. 구체적인 조합은 [원장 확인]이 필요합니다.", needsReview: true },
    { q: "시술 직후 일상생활이 가능한가요?", a: "회복 반응은 적용 부위와 피부 상태에 따라 달라질 수 있습니다. 글로리의원의 세부 안내는 [원장 확인] 후 확정합니다.", needsReview: true },
    { q: "상담할 때 무엇을 준비하면 좋나요?", a: "이전에 받은 에너지 시술과 시기, 복용 중인 약, 원하는 변화의 범위를 알려주시면 진료에 도움이 됩니다." },
  ],
  relatedConcerns: [
    { label: "처짐·탄력", href: "/column/category/lifting?concern=sagging" },
    { label: "턱선·볼륨", href: "/column/category/lifting?concern=jaw-volume" },
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
    { label: "DEKA ONDA 공식 제품 안내", href: "https://dekalaser.com/products/onda/" },
    { label: "DEKA ONDA PRO 공식 제품 안내", href: "https://dekalaser.com/products/onda-pro/" },
    { label: "Ultherapy PRIME 공식 안내", href: "https://ultherapy.com/about-ultrasound-skin-lifting" },
    { label: "Thermage FLX 공식 안내", href: "https://www.thermage.com/" },
  ],
};
