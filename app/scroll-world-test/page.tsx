import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScrollWorldPreview, type ScrollWorldScene } from "@/components/scroll-world/ScrollWorldPreview";
import { getEquipmentItems, getHeroSlides, getText } from "@/content/site-content-types";
import { readSiteContent } from "@/lib/contentStore";

export const metadata: Metadata = {
  title: "Scroll World 프리비주얼 | 글로리의원",
  description: "글로리의원 홈 화면의 스크롤 연출을 확인하는 로컬 프리비주얼입니다.",
  robots: { index: false, follow: false },
};

function plain(value: string) {
  return value.replaceAll("**", "").replaceAll("\n", " ").trim();
}

export default async function ScrollWorldTestPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const content = await readSiteContent();
  const hero = getHeroSlides(content)[0];
  const equipment = getEquipmentItems(content);

  const scenes: ScrollWorldScene[] = [
    {
      id: "arrival",
      step: "01",
      eyebrow: hero?.eyebrow || "GLORY CLINIC",
      title: plain(`${hero?.title ?? "자연스러운 아름다움,"} ${hero?.titleStrong ?? "글로리의원"}`),
      body: hero?.description || "대표원장이 직접 상담하고 시술합니다.",
      kind: "arrival",
      accent: "#b5a595",
      tags: ["GLORY CLINIC", "UNJEONG"],
    },
    {
      id: "director",
      step: "02",
      eyebrow: getText(content, "home.doctor.eyebrow"),
      title: plain(getText(content, "home.doctor.title")),
      body: plain(getText(content, "home.doctor.years")),
      kind: "director",
      accent: "#8f7e6d",
      tags: [getText(content, "home.doctor.career.0"), getText(content, "home.doctor.career.1")],
    },
    {
      id: "vision",
      step: "03",
      eyebrow: getText(content, "home.vision.eyebrow"),
      title: plain(getText(content, "home.vision.title")),
      body: plain(getText(content, "home.vision.description")),
      kind: "vision",
      accent: "#a89888",
      tags: [getText(content, "home.vision.signatureTitle"), getText(content, "home.vision.signatureName")],
    },
    {
      id: "equipment",
      step: "04",
      eyebrow: getText(content, "home.equipment.eyebrow"),
      title: plain(getText(content, "home.equipment.title")),
      body: equipment.slice(0, 3).map((item) => item.name).join(" · "),
      kind: "equipment",
      accent: "#9f8d7c",
      tags: equipment.slice(0, 4).map((item) => item.name),
    },
    {
      id: "column",
      step: "05",
      eyebrow: getText(content, "home.latest.eyebrow"),
      title: plain(getText(content, "home.latest.title")),
      body: getText(content, "home.latest.all"),
      kind: "column",
      accent: "#7f7063",
      tags: ["LIFTING", "PIGMENT", "INJECTION"],
    },
    {
      id: "gallery",
      step: "06",
      eyebrow: getText(content, "home.gallery.eyebrow"),
      title: plain(getText(content, "home.gallery.title")),
      body: ["lounge", "laser", "consult"].map((key) => getText(content, `home.gallery.room.${key}`)).join(" · "),
      kind: "gallery",
      accent: "#b7a797",
      tags: ["LOUNGE", "LASER ROOM", "CONSULTATION"],
    },
    {
      id: "location",
      step: "07",
      eyebrow: getText(content, "home.location.eyebrow"),
      title: plain(getText(content, "home.location.title")),
      body: getText(content, "clinic.address.street"),
      kind: "location",
      accent: "#6e6052",
      tags: [getText(content, "home.location.subway"), getText(content, "common.clinic.phone")],
    },
  ];

  return <ScrollWorldPreview scenes={scenes} />;
}
