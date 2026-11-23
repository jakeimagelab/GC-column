import type { Category } from "../types";

export type ReviewableValue = {
  value: string;
  needsReview?: boolean;
};

export type TreatmentFaq = {
  q: string;
  a: string;
  needsReview?: boolean;
};

export type TreatmentHeroData = {
  eyebrow: string;
  title: string;
  titleEn?: string;
  oneLiner: string;
  chips: Array<{
    label: string;
    value: string;
    needsReview?: boolean;
  }>;
  image: {
    src?: string;
    alt: string;
  };
};

export type TreatmentGlance = {
  lead: string;
  items: Array<{
    label: string;
    value: string;
    needsReview?: boolean;
  }>;
  video?: {
    src?: string;
    label: string;
  };
};

export type TreatmentForYou = {
  recommend: string[];
  consultFirst: string[];
  needsReview?: boolean;
};

export type TreatmentMechanism = {
  lead: string;
  steps: [string, string, string, string];
  needsReview?: boolean;
  illustration: {
    src?: string;
    alt: string;
  };
};

export type TreatmentCompare = {
  columns: string[];
  rows: Array<{
    label: string;
    values: string[];
    needsReview?: boolean;
  }>;
  highlightColumn: number;
  columnLink?: {
    href: string;
    label: string;
  };
};

export type TreatmentHandpieceTips = {
  handpiece: {
    src?: string;
    alt: string;
    title: string;
    desc: string;
  };
  tips: Array<{
    name: string;
    size: string;
    area: string;
    src?: string;
  }>;
  note: string;
  noteNeedsReview?: boolean;
};

export type TreatmentGenuineItem = {
  title: string;
  desc: string;
  needsReview?: boolean;
};

export type TreatmentProduct = {
  name: string;
  desc: string;
  needsReview?: boolean;
};

export type TreatmentArea = {
  area: string;
  note: string;
  needsReview?: boolean;
};

export type TreatmentStep = {
  step: number;
  title: string;
};

export type TreatmentDoctor = {
  name: string;
  title: string;
  reviewedAt: string;
  needsReview?: boolean;
  careers: string[];
};

type TreatmentDetailBase = {
  slug: string;
  category: Category["slug"];
  name: string;
  nameEn: string;
  kind: "device" | "injection";
  accent: string;
  accentSoft: string;
  accentLight: string;
  hero: TreatmentHeroData;
  glance: TreatmentGlance;
  forYou?: TreatmentForYou;
  process: TreatmentStep[];
  totalTime: ReviewableValue;
  painResult?: {
    pain: ReviewableValue & { label: string };
    result: ReviewableValue & { label: string };
  };
  promise: {
    quote: string;
    signature: string;
    items: [string, string, string];
  };
  care?: {
    before: string[];
    after: string[];
    needsReview?: boolean;
  };
  faq: TreatmentFaq[];
  relatedColumnSlug?: string;
  relatedConcerns: Array<{
    label: string;
    href: string;
  }>;
  bodyLocation?: ReviewableValue;
  doctor: TreatmentDoctor;
  sources: Array<{
    label: string;
    href: string;
  }>;
};

export type DeviceTreatmentDetail = TreatmentDetailBase & {
  kind: "device";
  mechanism?: TreatmentMechanism;
  compare?: TreatmentCompare;
  handpieceTips?: TreatmentHandpieceTips;
  genuine?: TreatmentGenuineItem[];
};

export type InjectionTreatmentDetail = TreatmentDetailBase & {
  kind: "injection";
  products?: TreatmentProduct[];
  areas?: TreatmentArea[];
  duration?: ReviewableValue;
};

export type TreatmentDetail = DeviceTreatmentDetail | InjectionTreatmentDetail;
