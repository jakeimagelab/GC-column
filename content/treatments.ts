import type { Category, Treatment } from "./types";

export const categories: Category[] = [
  { slug: "lifting", name: "리프팅", nameEn: "LIFTING" },
  { slug: "pigment", name: "색소·모공", nameEn: "PIGMENT · PORE" },
  { slug: "injection", name: "주사시술", nameEn: "INJECTION" },
  { slug: "filler", name: "스페셜필러", nameEn: "SPECIAL FILLER" },
];

export const treatments: Treatment[] = [
  {
    slug: "ulthera-prime",
    name: "울쎄라 프라임",
    categorySlug: "lifting",
    desc: "고강도 집속 초음파(HIFU) 리프팅",
    equipmentType: "더 정밀해진 초음파 리프팅\n미국 FDA 승인",
  },
  {
    slug: "thermage-flx",
    name: "써마지 FLX",
    categorySlug: "lifting",
    desc: "고주파(RF) 리프팅",
    equipmentType: "핵심 쿨링 기술로\n피부 데미지 최소화",
  },
  {
    slug: "titanium",
    name: "티타늄",
    categorySlug: "lifting",
    desc: "레이저 리프팅 [설명 확인 필요]",
    equipmentType: "3파장 리프팅",
  },
  {
    slug: "onda",
    name: "온다",
    categorySlug: "lifting",
    desc: "[장비 원리 한 줄]",
    equipmentType: "지방 세포 파괴로\n리프팅 효과와 지방감소",
  },
  {
    slug: "tuneface",
    name: "튠페이스",
    categorySlug: "lifting",
    desc: "[장비 원리 한 줄]",
    equipmentType: "고주파와 입체초음파로\n리프팅",
  },
  {
    slug: "shurink",
    name: "슈링크",
    categorySlug: "lifting",
    desc: "초음파 리프팅",
    equipmentType: "[한 줄 설명]",
  },
  {
    slug: "oligio",
    name: "올리지오",
    categorySlug: "lifting",
    desc: "고주파(RF) 리프팅",
    equipmentType: "[한 줄 설명]",
  },
  {
    slug: "xerf",
    name: "세르프",
    categorySlug: "lifting",
    desc: "고주파 + 더 깊은 층 모드",
    equipmentType: "고주파에 더 깊은 층\n모드를 더한 리프팅",
  },
  { slug: "pigment-1", name: "[시술명]", categorySlug: "pigment", desc: "[홈페이지 색소·모공 메뉴 기준으로 채움]" },
  { slug: "pigment-2", name: "[시술명]", categorySlug: "pigment", desc: "[한 줄 설명]" },
  { slug: "pigment-3", name: "[시술명]", categorySlug: "pigment", desc: "[한 줄 설명]" },
  { slug: "rejuran", name: "리쥬란", categorySlug: "injection", desc: "PN 성분 스킨부스터" },
  { slug: "lituo", name: "리투오", categorySlug: "injection", desc: "[성분 한 줄]" },
  { slug: "botox", name: "보톡스", categorySlug: "injection", desc: "보툴리눔 톡신 주사" },
  { slug: "stem-cell", name: "줄기세포", categorySlug: "injection", desc: "[설명 확인 필요]" },
  { slug: "filler-1", name: "[필러명]", categorySlug: "filler", desc: "[부위·특징 한 줄]" },
  { slug: "filler-2", name: "[필러명]", categorySlug: "filler", desc: "[부위·특징 한 줄]" },
];

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
  "filler-1",
];

export const megaMenuTreatmentOrder: Record<Category["slug"], string[]> = {
  lifting: ["ulthera-prime", "thermage-flx", "titanium", "onda", "tuneface", "shurink", "oligio"],
  pigment: ["pigment-1", "pigment-2", "pigment-3"],
  injection: ["rejuran", "lituo", "botox", "stem-cell"],
  filler: ["filler-1", "filler-2"],
};

export function getCategory(slug: Category["slug"]) {
  return categories.find((category) => category.slug === slug);
}

export function getTreatment(slug: string) {
  return treatments.find((treatment) => treatment.slug === slug);
}
