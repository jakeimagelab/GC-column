import type { Column } from "./types";
import { legacyColumns } from "./columns-legacy";

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
    concerns: [],
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
  concerns: ["sagging"],
  primaryTreatment: "xerf",
  heroImage: "/uploads/glory-column-xerf-hero.jpg",
  listImage: "/uploads/glory-column-xerf-hero.jpg",
  heroOverlay:
    "linear-gradient(90deg, rgba(20,20,20,.94) 0%, rgba(24,20,18,.82) 34%, rgba(40,22,16,.35) 58%, rgba(20,20,20,0) 76%)",
  title: "세르프(XERF)와 써마지FLX의 차이, 누구에게 맞을까요?",
  metaTitle: "세르프(XERF)와 써마지FLX의 차이, 누구에게 맞을까요? | 글로리의원 원장 칼럼",
  questionSource: "진료실에서 자주 받는 질문",
  summary:
    "세르프는 울쎄라·써마지를 합친 효과를 어느 정도는 내줄 수 있지만, 울쎄라의 효과를 완벽하게 따라갈 순 없습니다.",
  keyPoints: [
    "세르프는 울쎄라·써마지를 합친 효과를 어느 정도는 내줄 수 있지만,\n울쎄라의 효과를 완벽하게 따라갈 순 없습니다.",
    "피부 탄력이 좋은 20대~30대 초반은 울쎄라만으로도 만족하기 쉽지만,\n탄력이 떨어져 있다면 세르프 같은 고주파 시술을 함께 하는 편이 좋습니다. [광고 검토]",
    "울쎄라의 피하지방 감소가 걱정된다면,\n세르프로 피하지방을 지키면서 탄력과 리프팅을 함께 볼 수 있습니다.",
  ],
  shortAnswer: {
    eyebrow: "The short answer",
    title: "세르프와 써마지의 차이는\n에너지가 닿는 깊이입니다",
    body: [
      "세르프(XERF)와 써마지FLX(Thermage FLX)는 모두 고주파(RF) 리프팅 장비입니다. ==써마지는 6.78MHz로 진피층에 에너지를 넣고, 세르프는 여기에 2MHz DEEP 모드를 더해 피하지방층과 근막층까지 에너지를 전달합니다.== 다만 깊은 층에 들어가는 강도는 울쎄라피프라임(Ulthera)에 미치지 못합니다.",
      "그래서 진피층 탄력에 집중하고 싶다면 써마지, 탄력과 함께 안쪽 리프팅까지 보고 싶거나 울쎄라의 지방 감소가 걱정된다면 세르프가 선택지가 됩니다.",
    ],
    note: "이 글에서는 써마지FLX를 써마지, 울쎄라피프라임을 울쎄라로 줄여 씁니다.",
  },
  photo: {
    label: "대표원장이 세르프 상담과 시술을 설명하는 장면",
    caption: "세르프 시술 부위를 설명하는 글로리의원 대표원장 이호 (캡션 = 대체 텍스트)",
    alt: "세르프 시술 부위를 설명하는 글로리의원 대표원장 이호",
  },
  sections: [
    {
      id: "what-is-xerf",
      no: "01",
      en: "What is XERF",
      heading: "세르프는 어떤 장비인가요?",
      body: [
        "세르프(XERF)는 해외 회사 사이노슈어(Cynosure)와 국내 회사 루트로닉(Lutronic)이 합병하면서 나온 고주파 리프팅 장비입니다. ==써마지처럼 진피층에 고주파 에너지를 넣는 기본 모드에, 더 깊은 층을 위한 DEEP 모드가 더해진 것이 특징입니다.==",
        "모드 구성 · 팁 종류 · 시술 시간 [원장 확인]",
      ],
    },
    {
      id: "difference",
      no: "02",
      en: "Difference",
      heading: "세르프와 써마지는\n무엇이 다른가요?",
      body: [
        "먼저 써마지는 모노폴라 RF 방식으로 피부에 에너지를 넣습니다. 바이폴라 방식(예: 포텐자, 시크릿RF)보다 조금 더 깊이 들어가지만 ==진피층까지만 에너지가 전달되고, 피하지방이나 근막층까지는 닿지 않습니다.== 그래서 피하지방층과 근막층처럼 비교적 안쪽까지 에너지를 넣으려면 울쎄라를 함께 시술하고, 이 조합을 \"울써마지\"라고 부르기도 합니다.",
        "세르프는 써마지와 달리 **DEEP 모드**가 하나 더 있습니다. 써마지는 6.78MHz로 진피층에 에너지를 넣지만, ==세르프는 2MHz의 비교적 낮은 고주파로 더 깊이 에너지를 넣어 피하지방과 근막층까지 열에너지를 전달합니다.== 세르프 하나만 받아도 울쎄라처럼 피하지방이나 근막층까지 에너지를 넣어 줄 수 있다는 점이 차별점입니다.",
      ],
      figure: {
        kind: "image",
        src: "/uploads/glory-column-treatment-depth-comparison.png",
        alt: "피부 구조별 써마지·세르프·울쎄라 에너지 전달 방식 비교",
        caption: "피부 구조와 장비별 에너지 전달 방식 비교",
      },
      table: {
        caption: "써마지·세르프·울쎄라 비교",
        head: ["구분", "써마지", "세르프", "울쎄라"],
        rows: [
          ["에너지", "고주파 (6.78MHz)", "고주파 + DEEP 모드 (2MHz)", "초음파"],
          ["주로 닿는 층", "진피층", "진피층 중심 + 피하지방·근막층", "피하지방·근막층"],
          ["에너지 방식", "모노폴라 RF", "넓은 면적, 전체 층에 고르게", "좁은 라인으로 선택적으로"],
        ],
      },
    },
    {
      kind: "image",
      src: "/uploads/glory-column-hero-consultation.webp",
      alt: "글로리의원 대표원장 이호가 진료실에서 환자와 리프팅 상담을 하는 모습",
      caption: "대표원장이 직접 피부 탄력과 지방량을 확인하고 시술 조합을 정합니다.",
      ratio: "16/9",
    },
    {
      id: "xerf-alone",
      no: "03",
      en: "XERF alone?",
      heading: "울쎄라·써마지 대신\n세르프만 하면 되나요?",
      lead: "세르프 하나로 진피층과 깊은 층을 함께 볼 수는 있지만, 깊은 층의 강도는 울쎄라만큼은 아닙니다.",
      body: [
        "세르프는 기본적으로 써마지와 같은 고주파 시술이라 진피층에 에너지를 많이 넣으면서, 울쎄라처럼 피하지방층과 근막층까지 건드려 줄 수 있습니다.",
        "하지만 ==깊은 층에 울쎄라 정도의 강도로 에너지가 들어가지는 못합니다.== 울쎄라는 지방세포를 사멸시키고 근막층을 수축시킬 수 있을 만큼 강한 에너지를 해당 층에 넣는 장비이지만, 세르프는 고주파 장비라서 깊은 층보다 얕은 진피층에 에너지가 훨씬 많이 가해집니다.",
      ],
      callout: {
        eyebrow: "Turn it around",
        title: "울쎄라만큼 깊이 못 넣는 것이\n오히려 장점이 될 수 있습니다",
        body: "울쎄라는 지방세포 사멸과 근막층 수축 때문에 볼패임이 생기거나, 디자인을 잘못하면 오히려 더 늙어 보이는 느낌이 날 수 있는 장비입니다. 세르프는 지방세포 사멸이나 드라마틱한 근막 수축이 없어서 얼굴이 쪼그라드는 느낌이 들 위험이 굉장히 적습니다. [광고 검토] 그래서 얼굴 지방 감소가 많이 걱정되는 경우에는 울쎄라보다 세르프로 그런 불안감을 덜 수 있습니다.",
      },
    },
    {
      id: "ulthera-alone",
      no: "04",
      en: "Ulthera alone?",
      heading: "울쎄라만 하면\n세르프는 필요 없나요?",
      lead: "피부 탄력이 좋다면 울쎄라만으로도 충분할 수 있지만, 탄력이 떨어졌다면 고주파 시술을 함께 보는 편이 좋습니다.",
      body: [
        "울쎄라는 피하지방층과 근막층에 아주 좁은 라인으로 에너지를 선택적으로 넣습니다. 반면 세르프는 고주파 시술이라 넓은 면적으로 전체 층에 에너지를 고르게 넣습니다. ==그래서 울쎄라로 닿지 않는 피부층까지 세르프로 에너지를 넣어 줄 수 있습니다.==",
      ],
      twoCol: {
        items: [
          {
            eyebrow: "20s – early 30s",
            title: "피부 탄력이 좋은 경우",
            body: "울쎄라 단독으로도 만족감이 높을 수 있습니다.",
          },
          {
            eyebrow: "Late 30s – 40s+",
            title: "탄력이 떨어진 경우",
            body: "울쎄라+써마지, 또는 울쎄라+세르프처럼\n탄력을 맡는 고주파 시술을 함께 하는 편이\n훨씬 만족도가 좋습니다. [광고 검토]",
          },
        ],
      },
    },
  ],
  judgement: {
    recommend: [],
    notRecommend: [],
  },
  precautions: [],
  faqs: [
    {
      q: "세르프가 좋은가요, 써마지가 좋은가요?",
      summary: "탄력만 원하면 써마지, 안쪽 리프팅까지 원하면 세르프입니다.",
      summaryNeedsReview: true,
      a: "피부 진피층에 최대한 많은 에너지를 넣고 싶다면 써마지, 피부 탄력뿐 아니라 안쪽까지 에너지를 함께 넣어 리프팅 효과도 같이 보고 싶다면 세르프가 좋은 선택입니다.",
      answeredAt: "2026-10-16",
    },
    {
      q: "세르프와 써마지는 보통 어느 연령대가 선택하나요?",
      a: "세르프는 써마지 단독 시술이 조금 부담스러운 30~40대에서 많이 하시고, 울쎄라 병합 효과를 얻고 싶은 50~60대도 선택하기 좋습니다. 써마지는 울쎄라와 병합해 40대 이상에서 많이 하시거나, 피부 탄력만 원하는 40대 이상에서 많이 선택하십니다.",
      answeredAt: "2026-10-16",
    },
    { q: "세르프는 아픈가요?", a: "[원장 확인]", needsReview: true },
    { q: "세르프는 보통 몇 샷 받나요?", a: "[원장 확인]", needsReview: true },
    { q: "세르프 효과는 얼마나 유지되나요?", a: "[원장 확인]", needsReview: true },
    { q: "세르프와 써마지를 함께 받아도 되나요?", a: "[원장 확인]", needsReview: true },
    { q: "세르프와 울쎄라를 함께 받으면 어떻게 진행하나요?", a: "[원장 확인]", needsReview: true },
  ],
  faqTitle: "자주 묻는 질문",
  authorGreeting: "대표원장이 직접 책임지고 1:1 상담과 시술을 진행하는 강남 피부과 글로리의원\n대표원장 이호입니다.",
  readNext: [
    {
      slug: "thermage-vs-ulthera",
      label: "Column",
      title: "울쎄라 써마지,\n어떤 시술이 내게 잘 맞을까?",
    },
  ],
  reviewNotes: {
    label: "원문에서 뺀 문장 2개 · 광고 검토 후 결정",
    lines: [
      "보통 이름이 알려지지 않은 중소기업에서 나온 피부과 장비들을 보면 은근히 디테일이 허접한 경우가 많습니다.",
      "우리나라를 필두로 해서 전 세계적으로 많이 팔리게 된 장비인 것 같습니다.",
    ],
  },
  references: [],
  keywords: ["세르프", "XERF", "써마지FLX", "Thermage FLX", "세르프 써마지 차이", "울쎄라", "고주파 리프팅", "DEEP 모드"],
  author: "대표원장 이호",
  reviewedAtNeedsReview: true,
  publishedAt: "2026-10-16",
  updatedAt: "2026-11-23",
  readMinutes: 6,
};

export const columns: Column[] = [
  xerfVsThermage,
  ...legacyColumns,
  placeholderColumn({
    slug: "ulthera-with-xerf",
    categorySlug: "lifting",
    treatmentSlugs: ["ulthera-prime", "xerf"],
    title: "울쎄라만 받으면 세르프는 필요 없나요?",
    summary: "[핵심 답변 2~3줄]",
    keywords: ["울쎄라", "세르프", "병행", "리프팅"],
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
    treatmentSlugs: ["curejet"],
    title: "[질문형 칼럼 제목]",
    summary: "핵심 답변 한 줄 미리보기",
    keywords: ["색소", "모공"],
  }),
  placeholderColumn({
    slug: "filler-question",
    categorySlug: "filler",
    treatmentSlugs: ["neck-wrinkle-filler"],
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
const REVIEW_MARKER = /\[(?:원장 확인|광고 검토)\]/g;

export function containsPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return PLACEHOLDER.test(value.replace(REVIEW_MARKER, ""));
  if (Array.isArray(value)) return value.some(containsPlaceholder);
  if (value && typeof value === "object") return Object.values(value).some(containsPlaceholder);
  return false;
}

export function isPublishable(column: Column) {
  const articleSections = column.sections.filter((section) => section.kind !== "image");
  const sectionsComplete = articleSections.length > 0 && column.sections.every((section) => {
    if (section.kind === "image") {
      return Boolean(section.src.trim() && section.alt.trim() && section.caption.trim());
    }
    const publicBody = section.body.filter((paragraph) => !paragraph.includes("[원장 확인]"));
    return section.heading.trim() && publicBody.length > 0 && publicBody.every((paragraph) => paragraph.trim());
  });
  const publicFaqs = column.faqs.filter((faq) => !faq.needsReview);
  const faqsComplete = publicFaqs.length > 0 && publicFaqs.every((faq) => faq.q.trim() && faq.a.trim());
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
  return getPublishedColumns();
}

export function getVisibleColumn(slug: string) {
  const column = getColumn(slug);
  if (!column) return undefined;
  return process.env.NODE_ENV === "development" || isPublishable(column) ? column : undefined;
}

export function getColumns(slugs: string[]) {
  const published = getPublishedColumns();
  return slugs.flatMap((slug) => {
    const column = published.find((item) => item.slug === slug);
    return column ? [column] : [];
  });
}
