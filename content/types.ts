export type Category = {
  slug: "lifting" | "pigment" | "injection" | "filler";
  name: string;
  nameEn: string;
};

export type Treatment = {
  slug: string;
  name: string;
  menuName?: string;
  categorySlug: Category["slug"];
  desc: string;
  equipmentType?: string;
  brandColor?: string;
  detailPath: `/treatments/${Category["slug"]}/${string}`;
};

export type Doctor = {
  name: string;
  title: string;
  careers: string[];
  yearsLabel: string;
  promises: string[];
};

export type ColumnFaq = {
  q: string;
  a: string;
  summary?: string;
  summaryNeedsReview?: boolean;
  answeredAt?: string;
  needsReview?: boolean;
};

export type ColumnCallout = {
  eyebrow: string;
  title: string;
  body: string;
};

export type ColumnTwoCol = {
  items: Array<{
    eyebrow: string;
    title: string;
    body: string;
  }>;
};

export type ColumnArticleSection = {
  kind?: "section";
  id: string;
  no: string;
  en?: string;
  heading: string;
  lead?: string;
  body: string[];
  callout?: ColumnCallout;
  twoCol?: ColumnTwoCol;
  table?: { caption?: string; head: string[]; rows: string[][] };
  figure?:
    | {
      kind: "layers";
      caption: string;
      needsReview?: boolean;
    }
    | {
      kind: "image";
      src: string;
      alt: string;
      caption: string;
    };
};

export type ColumnImageSection = {
  kind: "image";
  src: string;
  alt: string;
  caption: string;
  ratio?: "16/9" | "4/5";
};

export type ColumnSection = ColumnArticleSection | ColumnImageSection;

export type Column = {
  status: "draft" | "published";
  slug: string;
  categorySlug: Category["slug"];
  treatmentSlugs: string[];
  concerns: string[];
  primaryTreatment?: string;
  heroImage?: string;
  listImage?: string;
  heroOverlay?: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  legacyUrl?: string;
  questionSource?: string;
  summary: string;
  keyPoints: string[];
  shortAnswer?: {
    eyebrow: string;
    title: string;
    body: string[];
    note?: string;
  };
  photo: { src?: string | null; label: string; caption: string; alt: string };
  sections: ColumnSection[];
  judgement: { recommend: string[]; notRecommend: string[] };
  video?: {
    src: string;
    poster?: string;
    duration?: string;
    uploadDate?: string;
    transcript: string;
  };
  precautions: string[];
  faqs: ColumnFaq[];
  faqTitle?: string;
  authorGreeting?: string;
  readNext?: Array<{ slug: string; label: string; title: string }>;
  reviewNotes?: { label: string; lines: string[] };
  references: string[];
  keywords: string[];
  author: string;
  reviewedAt?: string;
  reviewedAtNeedsReview?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  readMinutes: number;
};
