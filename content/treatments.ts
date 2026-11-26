import type { Category, Treatment } from "./types";

export const categories: Category[] = [
  { slug: "lifting", name: "리프팅", nameEn: "LIFTING" },
  { slug: "pigment", name: "색소·모공", nameEn: "PIGMENT · PORE" },
  { slug: "injection", name: "주사시술", nameEn: "INJECTION" },
  { slug: "filler", name: "스페셜필러", nameEn: "SPECIAL FILLER" },
];

const treatmentData: Omit<Treatment, "detailPath">[] = [
  {
    slug: "ulthera-prime",
    brandColor: "#F2C12E",
    name: "울쎄라 프라임",
    menuName: "울쎄라피프라임",
    categorySlug: "lifting",
    desc: "고강도 집속 초음파(HIFU) 리프팅",
    equipmentType: "더 정밀해진 초음파 리프팅\n미국 FDA 승인",
  },
  {
    slug: "thermage-flx",
    brandColor: "#4B2D73",
    name: "써마지 FLX",
    menuName: "써마지FLX",
    categorySlug: "lifting",
    desc: "고주파(RF) 리프팅",
    equipmentType: "핵심 쿨링 기술로\n피부 데미지 최소화",
  },
  {
    slug: "titanium",
    name: "티타늄",
    menuName: "티타늄레이저",
    categorySlug: "lifting",
    desc: "레이저 리프팅",
    equipmentType: "3파장 리프팅",
  },
  {
    slug: "onda",
    name: "온다",
    categorySlug: "lifting",
    desc: "극초단파 에너지를 지방층에 전달",
    equipmentType: "지방 세포 파괴로\n리프팅 효과와 지방감소",
  },
  {
    slug: "tuneface",
    name: "튠페이스",
    categorySlug: "lifting",
    desc: "고주파와 입체초음파 리프팅",
    equipmentType: "고주파와 입체초음파로\n리프팅",
  },
  {
    slug: "shurink",
    name: "슈링크",
    menuName: "슈링크유니버스",
    categorySlug: "lifting",
    desc: "초음파 리프팅",
    equipmentType: "",
  },
  {
    slug: "oligio",
    name: "올리지오",
    categorySlug: "lifting",
    desc: "고주파(RF) 리프팅",
    equipmentType: "",
  },
  {
    slug: "xerf",
    brandColor: "#F4ABA2",
    name: "세르프",
    categorySlug: "lifting",
    desc: "고주파 + 더 깊은 층 모드",
    equipmentType: "고주파에 더 깊은 층\n모드를 더한 리프팅",
  },
  { slug: "inmode", name: "인모드", categorySlug: "lifting", desc: "" },
  { slug: "curejet", name: "큐어젯", categorySlug: "pigment", desc: "" },
  { slug: "revlite-si", name: "레블라이트 SI", menuName: "레블라이트SI", categorySlug: "pigment", desc: "" },
  { slug: "selec-ipl", name: "셀렉 IPL", menuName: "셀렉IPL", categorySlug: "pigment", desc: "" },
  { slug: "secret-rf", name: "시크릿 RF", menuName: "시크릿RF", categorySlug: "pigment", desc: "" },
  { slug: "agnes", name: "아그네스", categorySlug: "pigment", desc: "" },
  { slug: "rejuran", name: "리쥬란", categorySlug: "injection", desc: "PN 성분 스킨부스터" },
  { slug: "lituo", name: "리투오", categorySlug: "injection", desc: "" },
  { slug: "stem-cell", name: "줄기세포주사", categorySlug: "injection", desc: "" },
  { slug: "botox", name: "보톡스", categorySlug: "injection", desc: "보툴리눔 톡신 주사" },
  { slug: "filler", name: "필러", categorySlug: "injection", desc: "" },
  { slug: "custom-skin-booster", name: "맞춤 스킨부스터", menuName: "맞춤스킨부스터", categorySlug: "injection", desc: "" },
  { slug: "neck-wrinkle-filler", name: "목주름 필러", menuName: "목주름필러", categorySlug: "filler", desc: "" },
  { slug: "hand-filler", name: "손등 필러", menuName: "손등필러", categorySlug: "filler", desc: "" },
  { slug: "eye-area-filler", name: "눈위·눈밑 필러", menuName: "눈위·눈밑필러", categorySlug: "filler", desc: "" },
  { slug: "earlobe-filler", name: "귓볼 필러", menuName: "귓볼필러", categorySlug: "filler", desc: "" },
];

export const treatments: Treatment[] = treatmentData.map((treatment) => ({
  ...treatment,
  detailPath: `/treatments/${treatment.categorySlug}/${treatment.slug}`,
}));

export const readyTreatmentSlugs = new Set(["thermage-flx", "onda"]);

export const homeEquipmentOrder = [
  "onda",
  "thermage-flx",
  "ulthera-prime",
  "titanium",
  "tuneface",
  "xerf",
  "shurink",
  "oligio",
];

export const mainTreatmentOrder = [
  "ulthera-prime",
  "thermage-flx",
  "titanium",
  "onda",
  "tuneface",
  "shurink",
  "rejuran",
  "neck-wrinkle-filler",
];

export const megaMenuTreatmentOrder: Record<Category["slug"], string[]> = {
  lifting: ["thermage-flx", "ulthera-prime", "titanium", "onda", "xerf", "tuneface", "inmode", "shurink", "oligio"],
  pigment: ["curejet", "revlite-si", "selec-ipl", "secret-rf", "agnes"],
  injection: ["stem-cell", "botox", "filler", "custom-skin-booster"],
  filler: ["neck-wrinkle-filler", "hand-filler", "eye-area-filler", "earlobe-filler"],
};

const hiddenTreatmentPageSlugs = new Set(["rejuran", "lituo"]);

export function isTreatmentPageVisible(slug: string) {
  return !hiddenTreatmentPageSlugs.has(slug);
}

export function getCategory(slug: Category["slug"]) {
  return categories.find((category) => category.slug === slug);
}

export function getTreatment(slug: string) {
  return treatments.find((treatment) => treatment.slug === slug);
}

export function getTreatmentCategoryPath(categorySlug: Category["slug"]) {
  return `/column/category/${categorySlug}`;
}
