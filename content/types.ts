export type Category = {
  slug: "lifting" | "pigment" | "injection" | "filler";
  name: string;
  nameEn: string;
};

export type Treatment = {
  slug: string;
  name: string;
  categorySlug: Category["slug"];
  desc: string;
  equipmentType?: string;
};

export type Doctor = {
  name: string;
  title: string;
  careers: string[];
  yearsLabel: string;
};

export type ColumnFaq = { q: string; a: string };

export type ColumnSection = {
  id: string;
  no: string;
  heading: string;
  body: string[];
  table?: { caption?: string; head: string[]; rows: string[][] };
  figure?: { label: string; caption: string };
};

export type Column = {
  status: "draft" | "published";
  slug: string;
  categorySlug: Category["slug"];
  treatmentSlugs: string[];
  title: string;
  questionSource?: string;
  summary: string;
  keyPoints: string[];
  photo: { src?: string | null; label: string; caption: string; alt: string };
  sections: ColumnSection[];
  judgement: { recommend: string[]; notRecommend: string[] };
  video?: {
    label: string;
    transcript: string;
    name?: string;
    description?: string;
    thumbnailUrl?: string;
    uploadDate?: string;
    contentUrl?: string;
    embedUrl?: string;
  };
  precautions: string[];
  faqs: ColumnFaq[];
  references: string[];
  keywords: string[];
  author: string;
  reviewedAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  readMinutes: number;
};
