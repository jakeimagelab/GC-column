import type { Doctor } from "./types";

export const SITE_URL = "https://blog.gloryclinic.co.kr";

export const doctor: Doctor = {
  name: "이호",
  title: "대표원장",
  yearsLabel: "13년 피부 진료 경험",
  careers: [
    "現 글로리의원 대표원장",
    "한양대학교 의과대학 졸업",
    "前 리쥬미의원 원장",
    "前 바오밥성형외과 원장",
    "前 에이스의원 원장",
    "[학회·자격]",
  ],
  promises: [
    "가족에게 권하지 못하는 시술이라면 환자에게도 권하지 않겠습니다.",
    "상담을 진행한 원장이 직접 시술하여 시술 퀄리티를 보장드리겠습니다.",
    "시술 후 불편감이 생길 시 철저한 사후관리를 약속드리겠습니다.",
  ],
};

export const columnExcerpts: Record<"home" | "main", Record<string, string>> = {
  home: {
    "xerf-vs-thermage": "세르프는 써마지처럼 진피층에 에너지를 넣고, DEEP 모드로 더 깊은 층까지 전달하는 고주파 장비입니다.",
    "ulthera-with-xerf": "[핵심 답변 2~3줄]",
    "rejuran-count": "[핵심 답변 2~3줄]",
  },
  main: {
    "xerf-vs-thermage": "써마지처럼 진피층에 에너지를 넣고, DEEP 모드로 더 깊은 층까지 전달하는 고주파 장비입니다.",
    "ulthera-with-xerf": "[핵심 답변 한 줄]",
    "rejuran-count": "[핵심 답변 한 줄]",
  },
};

export const columnSearchFaqIndex = [
  { q: "세르프가 좋은가요, 써마지가 좋은가요?", keywords: ["세르프", "써마지"] },
  { q: "세르프와 써마지는 보통 어느 연령대가 선택하나요?", keywords: ["세르프", "써마지"] },
  { q: "리프팅 후 붓기는 며칠 가나요?", keywords: ["붓기", "리프팅", "울쎄라", "냉찜질"] },
  { q: "리쥬란 맞고 바로 세안해도 되나요?", keywords: ["리쥬란", "스킨부스터"] },
];

export const columnTreatmentSearchNames = ["울쎄라 프라임", "써마지 FLX", "세르프", "슈링크", "온다", "리쥬란", "보톡스"];

export const detailContent = {
  breadcrumb: ["글로리의원", "원장 칼럼", "리프팅", "세르프"],
  coreTitle: "이 글의 핵심",
  tocTitle: "이 글에서 확인할 내용",
  judgementTitle: "이런 분께 권하고, 이런 분께는 권하지 않습니다",
  videoTitle: "원장님이 직접 설명합니다",
  precautionsTitle: "시술 전 확인하세요",
  faqTitle: "자주 묻는 질문",
  referencesTitle: "참고한 자료",
  authorTitle: "이 글을 쓴 사람 · 대표원장 이호",
  authorCareer:
    "글로리의원 원장 · 한양대학교 의과대학 졸 · 前 리쥬미의원 원장 · 前 바오밥성형외과 원장 · 前 에이스의원 원장",
  treatmentTitle: "세르프 시술 안내 보기",
  treatmentDescription: "나에게 맞는 조합은 대표원장 상담으로 확인하세요.",
  relatedTitle: "같이 보면 좋은 글",
  related: ["울쎄라만 받으면 세르프는 필요 없나요?", "리프팅 시술 후 냉찜질, 꼭 해야 하나요?", "[같은 카테고리 칼럼]"],
  notice:
    "본 칼럼은 관련 법령을 준수하여 작성되었습니다. 시술 효과와 부작용은 개인에 따라 다를 수 있으므로 전문의와 상담 후 결정하시기 바랍니다.",
};
