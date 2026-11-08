import type { Column } from "./types";

const placeholderPhoto = {
  label: "[원장님 사진]",
  caption: "[사진 캡션]",
  alt: "대표원장 이호",
};

function placeholderColumn(
  column: Pick<Column, "slug" | "categorySlug" | "treatmentSlugs" | "title" | "summary" | "keywords">,
): Column {
  return {
    ...column,
    keyPoints: ["[핵심 포인트]"],
    photo: placeholderPhoto,
    sections: [{ id: "body", no: "01", heading: column.title, body: ["[본문]"] }],
    judgement: { recommend: ["[원장 기준]"], notRecommend: ["[원장 기준]"] },
    precautions: ["[본문]"],
    faqs: [],
    references: [],
    author: "대표원장 이호",
    publishedAt: "[날짜]",
    updatedAt: "[날짜]",
    reviewedAt: "[날짜]",
    readMinutes: 6,
  };
}

export const xerfVsThermage: Column = {
  slug: "xerf-vs-thermage",
  categorySlug: "lifting",
  treatmentSlugs: ["xerf", "thermage-flx", "ulthera-prime"],
  title: "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?",
  questionSource: "진료실에서 자주 받는 질문",
  summary:
    "결론부터 말씀드리면, 세르프는 써마지처럼 진피층에 에너지를 넣고 DEEP 모드로 조금 더 깊은 층까지 전달하는 고주파 장비입니다. 울쎄라만큼 깊게 들어가지는 않지만, 지방 감소가 걱정되는 분께는 오히려 선택지가 될 수 있습니다. [원장 원고 기준 예시 · 최종 문장은 원장 승인]",
  keyPoints: [
    "써마지 = 진피층 중심 고주파",
    "세르프 = 고주파 + 더 깊은 층 모드",
    "울쎄라 = 피하지방·근막층까지 초음파",
    "어떤 조합이 맞는지는 피부 탄력과 지방량으로 판단",
  ],
  photo: {
    label: "[사진] 대표원장이 세르프 상담·시술하는 실제 장면 1장",
    caption: "세르프 시술 부위를 설명하는 글로리의원 대표원장 이호 (캡션 = 대체 텍스트)",
    alt: "세르프 시술 부위를 설명하는 글로리의원 대표원장 이호",
  },
  sections: [
    {
      id: "difference",
      no: "01",
      heading: "세르프와 써마지는 무엇이 다른가요?",
      body: ["[첫 문장에 답. 문단은 3~4문장.]"],
      figure: {
        label: "원리 그림 (메디컬 이미지)\n장비별 에너지가 닿는 피부층",
        caption: "직접 제작한 그림 또는 출처 표기 · AI 생성이면 ‘AI 생성 이미지’ 표시",
      },
      table: {
        head: ["구분", "써마지", "세르프", "울쎄라"],
        rows: [
          ["에너지", "고주파", "고주파", "초음파"],
          ["주로 닿는 층", "진피층", "진피층 + 더 깊은 층", "피하지방·근막층"],
          ["[기준]", "[값]", "[값]", "[값]"],
        ],
      },
    },
    {
      id: "xerf-only",
      no: "02",
      heading: "세르프만 받아도 되나요?",
      body: ["[본문 단락]"],
    },
  ],
  judgement: {
    recommend: ["지방 감소가 걱정되는 분 [원장 원고 기준]", "[원장 기준]"],
    notRecommend: ["[원장 기준]", "[원장 기준]"],
  },
  video: {
    label: "[영상] 1~3분 · 이 질문에 대한 원장 답변 구간",
    transcript: "[영상 내용을 글로 전부 게시. AI와 검색은 이 글을 읽습니다.]",
  },
  precautions: [
    "일시적으로 나타날 수 있는 반응 [붓기·열감 등]",
    "시술이 맞지 않을 수 있는 경우 [원장 기준]",
    "상담 때 알려주셔야 할 것 [복용 약·이전 시술]",
  ],
  faqs: [
    { q: "세르프가 좋은가요, 써마지가 좋은가요?", a: "[본문]" },
    { q: "세르프와 써마지는 보통 어느 연령대가 선택하나요?", a: "[본문]" },
    { q: "통증은 어느 정도인가요?", a: "[본문]" },
    { q: "효과는 얼마나 유지되나요?", a: "[본문]" },
    { q: "시술 후 바로 일상생활이 가능한가요?", a: "[본문]" },
  ],
  references: ["[장비 허가·제조사 공식 자료]", "[학회·공공기관 자료]"],
  keywords: ["세르프", "XERF", "써마지", "고주파", "리프팅"],
  author: "대표원장 이호",
  reviewedAt: "[검토일]",
  publishedAt: "[날짜]",
  updatedAt: "[날짜]",
  readMinutes: 6,
};

export const columns: Column[] = [
  xerfVsThermage,
  placeholderColumn({
    slug: "ulthera-with-xerf",
    categorySlug: "lifting",
    treatmentSlugs: ["ulthera-prime", "xerf"],
    title: "울쎄라만 받으면 세르프는 필요 없나요?",
    summary: "[핵심 답변 2~3줄]",
    keywords: ["울쎄라", "세르프", "병행", "리프팅"],
  }),
  placeholderColumn({
    slug: "lifting-cold-compress",
    categorySlug: "lifting",
    treatmentSlugs: ["ulthera-prime", "thermage-flx"],
    title: "리프팅 시술 후 냉찜질, 꼭 해야 하나요?",
    summary: "[핵심 답변 2~3줄]",
    keywords: ["냉찜질", "붓기", "시술 후 관리", "리프팅", "울쎄라", "써마지"],
  }),
  placeholderColumn({
    slug: "ulthera-low-volume-face",
    categorySlug: "lifting",
    treatmentSlugs: ["ulthera-prime"],
    title: "볼륨이 적은 얼굴도 울쎄라 받아도 되나요?",
    summary: "[핵심 답변 2~3줄]",
    keywords: ["울쎄라", "볼륨", "꺼짐"],
  }),
  placeholderColumn({
    slug: "ulthera-prime-shots",
    categorySlug: "lifting",
    treatmentSlugs: ["ulthera-prime"],
    title: "울쎄라 프라임, 샷 수가 많을수록 좋을까요?",
    summary: "핵심 답변 한 줄 미리보기",
    keywords: ["울쎄라", "울쎄라 프라임", "샷 수", "리프팅"],
  }),
  placeholderColumn({
    slug: "thermage-vs-ulthera",
    categorySlug: "lifting",
    treatmentSlugs: ["thermage-flx", "ulthera-prime"],
    title: "써마지와 울쎄라, 어떻게 다르고 무엇이 맞을까요?",
    summary: "핵심 답변 한 줄 미리보기",
    keywords: ["써마지", "울쎄라", "리프팅"],
  }),
  placeholderColumn({
    slug: "rejuran-count",
    categorySlug: "injection",
    treatmentSlugs: ["rejuran"],
    title: "리쥬란, 몇 번 맞아야 하나요?",
    summary: "[핵심 답변 한 줄]",
    keywords: ["리쥬란", "스킨부스터", "주사", "붓기"],
  }),
  placeholderColumn({
    slug: "pigment-question",
    categorySlug: "pigment",
    treatmentSlugs: ["pigment-1"],
    title: "[질문형 칼럼 제목]",
    summary: "핵심 답변 한 줄 미리보기",
    keywords: ["색소", "모공"],
  }),
  placeholderColumn({
    slug: "filler-question",
    categorySlug: "filler",
    treatmentSlugs: ["filler-1"],
    title: "[질문형 칼럼 제목]",
    summary: "핵심 답변 한 줄 미리보기",
    keywords: ["필러"],
  }),
  placeholderColumn({
    slug: "injection-question",
    categorySlug: "injection",
    treatmentSlugs: ["botox"],
    title: "[질문형 칼럼 제목]",
    summary: "핵심 답변 한 줄 미리보기",
    keywords: ["주사시술"],
  }),
];

export const homeSearchSlugs = [
  "xerf-vs-thermage",
  "ulthera-with-xerf",
  "lifting-cold-compress",
  "ulthera-low-volume-face",
  "rejuran-count",
];

export const homeLatestSlugs = [
  "xerf-vs-thermage",
  "ulthera-with-xerf",
  "lifting-cold-compress",
  "ulthera-low-volume-face",
];

export const mainSearchSlugs = [
  "xerf-vs-thermage",
  "ulthera-with-xerf",
  "lifting-cold-compress",
  "ulthera-prime-shots",
  "rejuran-count",
];

export const mainCardSlugs = [
  "ulthera-prime-shots",
  "thermage-vs-ulthera",
  "pigment-question",
  "rejuran-count",
  "filler-question",
  "injection-question",
];

export function getColumn(slug: string) {
  return columns.find((column) => column.slug === slug);
}

export function getColumns(slugs: string[]) {
  return slugs.flatMap((slug) => {
    const column = getColumn(slug);
    return column ? [column] : [];
  });
}
