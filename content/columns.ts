import type { Column } from "./types";

const placeholderPhoto = {
  label: "원장 진료 사진",
  caption: "대표원장 진료 사진",
  alt: "대표원장 이호",
};

function placeholderColumn(
  column: Pick<Column, "slug" | "categorySlug" | "treatmentSlugs" | "title" | "summary" | "keywords">,
): Column {
  return {
    ...column,
    status: "draft",
    keyPoints: ["[핵심 포인트]"],
    photo: placeholderPhoto,
    sections: [{ id: "body", no: "01", heading: column.title, body: ["[본문]"] }],
    judgement: { recommend: ["[원장 기준]"], notRecommend: ["[원장 기준]"] },
    precautions: ["[본문]"],
    faqs: [],
    references: [],
    author: "대표원장 이호",
    readMinutes: 6,
  };
}

export const xerfVsThermage: Column = {
  status: "published",
  slug: "xerf-vs-thermage",
  categorySlug: "lifting",
  treatmentSlugs: ["xerf", "thermage-flx", "ulthera-prime"],
  title: "세르프와 써마지, 무엇이 다르고 누구에게 맞나요?",
  questionSource: "진료실에서 자주 받는 질문",
  summary:
    "결론부터 말씀드리면, 세르프는 써마지처럼 진피층에 에너지를 넣고 DEEP 모드로 조금 더 깊은 층까지 전달하는 고주파 장비입니다. 울쎄라만큼 깊게 들어가지는 않지만, 지방 감소가 걱정되는 분께는 오히려 선택지가 될 수 있습니다.",
  keyPoints: [
    "써마지 = 진피층 중심 고주파",
    "세르프 = 고주파 + 더 깊은 층 모드",
    "울쎄라 = 피하지방·근막층까지 초음파",
    "어떤 조합이 맞는지는 피부 탄력과 지방량으로 판단",
  ],
  photo: {
    label: "대표원장이 세르프 상담과 시술을 설명하는 장면",
    caption: "세르프 시술 부위를 설명하는 글로리의원 대표원장 이호 (캡션 = 대체 텍스트)",
    alt: "세르프 시술 부위를 설명하는 글로리의원 대표원장 이호",
  },
  sections: [
    {
      id: "difference",
      no: "01",
      heading: "세르프와 써마지는 무엇이 다른가요?",
      body: [
        "세르프와 써마지는 모두 고주파 에너지를 진피층에 전달하는 장비입니다. ==세르프는 DEEP 모드를 통해 조금 더 깊은 층까지 에너지를 전달하도록 구성된 점이 다릅니다.==",
        "울쎄라는 고주파가 아니라 초음파를 사용하며 피하지방·근막층까지 에너지를 전달합니다. 세 장비는 에너지 종류와 주로 닿는 층이 다르므로 피부 탄력과 지방량을 함께 보고 선택합니다.",
      ],
      figure: {
        label: "장비별 에너지가 닿는 피부층 도식",
        caption: "써마지·세르프·울쎄라의 에너지 종류와 주로 닿는 층 비교",
      },
      table: {
        caption: "써마지·세르프·울쎄라 비교",
        head: ["구분", "써마지", "세르프", "울쎄라"],
        rows: [
          ["에너지", "고주파", "고주파", "초음파"],
          ["주로 닿는 층", "진피층", "진피층 + 더 깊은 층", "피하지방·근막층"],
        ],
      },
    },
    {
      id: "xerf-only",
      no: "02",
      heading: "세르프만 받아도 되나요?",
      body: [
        "==세르프만 받을지 다른 리프팅 시술을 함께 볼지는 피부 탄력과 지방량을 기준으로 판단합니다.== 장비 이름만으로 정하기보다 에너지가 닿는 층과 현재 얼굴 상태를 함께 확인하는 과정이 먼저입니다.",
      ],
    },
  ],
  judgement: {
    recommend: ["지방 감소가 걱정되어 리프팅 장비 선택을 상담받고 싶은 분", "피부 탄력과 지방량을 함께 확인해 시술 조합을 결정하고 싶은 분"],
    notRecommend: ["피부 탄력과 지방량을 확인하기 전에 장비 이름만으로 시술을 결정하려는 경우"],
  },
  precautions: [
    "복용 중인 약과 이전 시술 이력은 상담할 때 알려주세요.",
    "시술 선택과 조합은 피부 탄력과 지방량을 확인한 뒤 결정합니다.",
  ],
  faqs: [
    { q: "세르프가 좋은가요, 써마지가 좋은가요?", a: "두 장비는 모두 고주파를 사용하지만 세르프는 DEEP 모드로 조금 더 깊은 층까지 에너지를 전달합니다. 피부 탄력과 지방량을 확인한 뒤 맞는 장비를 판단합니다." },
    { q: "세르프와 써마지는 보통 어느 연령대가 선택하나요?", a: "연령만으로 장비를 정하지 않습니다. 현재 피부 탄력과 지방량, 원하는 변화의 범위를 함께 확인해 선택합니다." },
  ],
  references: [],
  keywords: ["세르프", "XERF", "써마지", "고주파", "리프팅"],
  author: "대표원장 이호",
  // 임시 발행일: 원장 최종 승인 시 실제 날짜로 교체합니다.
  reviewedAt: "2026-12-15",
  publishedAt: "2026-12-15",
  updatedAt: "2026-12-15",
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
    summary: "핵심 답변 한 줄 미리보기",
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
  "xerf-vs-thermage",
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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PLACEHOLDER = /(^|\s)\[[^\]]+\]/;

export function containsPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return PLACEHOLDER.test(value);
  if (Array.isArray(value)) return value.some(containsPlaceholder);
  if (value && typeof value === "object") return Object.values(value).some(containsPlaceholder);
  return false;
}

export function isPublishable(column: Column) {
  const sectionsComplete = column.sections.length > 0 && column.sections.every((section) =>
    section.heading.trim() && section.body.length > 0 && section.body.every((paragraph) => paragraph.trim()),
  );
  const faqsComplete = column.faqs.length > 0 && column.faqs.every((faq) => faq.q.trim() && faq.a.trim());
  return Boolean(
    column.status === "published" &&
    column.title.trim() &&
    column.summary.trim() &&
    sectionsComplete &&
    faqsComplete &&
    column.author.trim() &&
    column.publishedAt && ISO_DATE.test(column.publishedAt) &&
    (!column.updatedAt || ISO_DATE.test(column.updatedAt)) &&
    (!column.reviewedAt || ISO_DATE.test(column.reviewedAt)) &&
    !containsPlaceholder(column),
  );
}

export function getPublishedColumns() {
  return columns.filter(isPublishable).toSorted((a, b) => (b.updatedAt ?? b.publishedAt ?? "").localeCompare(a.updatedAt ?? a.publishedAt ?? ""));
}

export function getVisibleColumns() {
  return process.env.NODE_ENV === "development" ? columns : getPublishedColumns();
}

export function getVisibleColumn(slug: string) {
  const column = getColumn(slug);
  if (!column) return undefined;
  return process.env.NODE_ENV === "development" || isPublishable(column) ? column : undefined;
}

export function getColumns(slugs: string[]) {
  return slugs.flatMap((slug) => {
    const column = getVisibleColumn(slug);
    return column ? [column] : [];
  });
}
