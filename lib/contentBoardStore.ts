import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSiteContent } from "@/lib/contentStore";
import { desktopTransform, mobileTransform } from "@/lib/imagePlacement";
import type { ImageContentEntry, SiteContent, SiteContentEntry } from "@/content/site-content-types";
import {
  isBoardImageItem,
  type BoardElementTransform,
  type BoardImageEffects,
  type BoardImageItem,
  type BoardItem,
  type BoardMotion,
  type BoardSlide,
  type BoardTextItem,
  type ContentBoard,
} from "@/lib/contentBoardTypes";

const boardRoot = path.join(process.cwd(), "content-brief");
const boardPath = path.join(boardRoot, "content-board.json");
const uploadsPath = path.join(boardRoot, "uploads");
let mutationQueue: Promise<void> = Promise.resolve();

function enqueueMutation<T>(task: () => Promise<T>) {
  const result = mutationQueue.then(task, task);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

type SlideDefinition = {
  pageId: string;
  pageTitle: string;
  id: string;
  title: string;
  description: string;
  prefixes?: string[];
  special?: "hero" | "equipment" | "typing";
};

const definitions: SlideDefinition[] = [
  { pageId: "common", pageTitle: "공통", id: "common-header", title: "헤더·로고", description: "로고, 브랜드명과 공통 헤더 문구", prefixes: ["common.brand.", "common.header.", "home.header."] },
  { pageId: "common", pageTitle: "공통", id: "common-quick", title: "상담 메뉴", description: "전화·카톡·예약·빠른 메뉴", prefixes: ["common.quick.", "common.status.", "common.backToTop"] },
  { pageId: "common", pageTitle: "공통", id: "common-footer", title: "푸터", description: "병원 정보, 고지와 외부 링크", prefixes: ["home.footer.", "column.footer.", "common.clinic."] },

  { pageId: "home", pageTitle: "홈", id: "home-hero", title: "히어로", description: "슬라이드별 배경 사진과 첫 화면 문구", special: "hero" },
  { pageId: "home", pageTitle: "홈", id: "home-question", title: "질문창", description: "질문 검색 영역의 제목·안내·예시", prefixes: ["home.question."] },
  { pageId: "home", pageTitle: "홈", id: "home-doctor", title: "원장 소개", description: "대표원장 사진, 제목, 연차와 약력", prefixes: ["home.doctor."] },
  { pageId: "home", pageTitle: "홈", id: "home-vision", title: "진료 철학", description: "비전 문구와 원장 서명", prefixes: ["home.vision."] },
  { pageId: "home", pageTitle: "홈", id: "home-equipment", title: "보유 장비", description: "장비별 누끼 사진·이름·설명", special: "equipment" },
  { pageId: "home", pageTitle: "홈", id: "home-latest", title: "최신 칼럼", description: "최신 칼럼 섹션의 고정 문구", prefixes: ["home.latest."] },
  { pageId: "home", pageTitle: "홈", id: "home-gallery", title: "시설 갤러리", description: "공간 사진 5장과 갤러리 문구", prefixes: ["home.gallery."] },
  { pageId: "home", pageTitle: "홈", id: "home-location", title: "오시는 길", description: "지도 이미지, 주소 안내와 지도 링크", prefixes: ["home.location."] },

  { pageId: "column", pageTitle: "칼럼 메인", id: "column-hero", title: "칼럼 히어로·검색", description: "첫 화면 배경과 칼럼 검색 문구", prefixes: ["column.hero.", "column.search."] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-doctor", title: "원장 소개", description: "원장 사진, 소개 문구와 서명", prefixes: ["column.doctor."] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-category", title: "분야별 칼럼", description: "카테고리 섹션 고정 문구", prefixes: ["column.category.title", "column.category.count"] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-latest", title: "최신·전체 칼럼", description: "목록 제목과 이동 문구", prefixes: ["column.latest."] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-faq", title: "자주 묻는 질문", description: "FAQ 제목과 질문 문구", prefixes: ["column.faq."] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-treatments", title: "시술별 읽어보기", description: "시술 카드 문구와 장비·주사제 사진", prefixes: ["column.treatments.", "treatments."] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-principles", title: "진료 원칙", description: "진료 원칙 사진과 세 가지 설명", prefixes: ["column.principles."] },
  { pageId: "column", pageTitle: "칼럼 메인", id: "column-location", title: "오시는 길", description: "지도와 예약·상담 문구", prefixes: ["column.location."] },

  { pageId: "doctor", pageTitle: "원장 프로필", id: "doctor-profile", title: "프로필 정보", description: "이름·직함·경력·학력·학회·전문 분야", prefixes: ["doctor.", "home.doctor.photo"] },
  { pageId: "detail", pageTitle: "칼럼 상세 공통", id: "detail-share", title: "공유 영역", description: "공유 버튼과 복사 안내 문구", prefixes: ["column.share."] },
  { pageId: "detail", pageTitle: "칼럼 상세 공통", id: "detail-qna", title: "독자 질문", description: "질문 입력·동의·완료 안내 문구", prefixes: ["qna."] },
];

const labelWords: Record<string, string> = {
  title: "제목",
  description: "설명",
  eyebrow: "작은 제목",
  photo: "사진",
  background: "배경 이미지",
  logo: "로고",
  name: "이름",
  nameEn: "영문명",
  years: "진료 연차",
  guide: "안내 문구",
  placeholder: "입력 예시",
  label: "라벨",
  notice: "안내·고지",
  sitemap: "사이트맵",
  links: "링크 문구",
  map: "지도",
  alt: "사진 설명",
};

const defaultEffects: BoardImageEffects = {
  opacity: 100,
  cropAspect: "free",
  overlayColor: "#2b2b2b",
  overlayOpacity: 0,
  gradientEnabled: false,
  gradientDirection: "to right",
  gradientColor: "#2b2b2b",
  gradientOpacity: 55,
};

const defaultLayout: BoardElementTransform = {
  x: 0,
  y: 0,
  scale: 100,
  rotate: 0,
  zIndex: 0,
};

const defaultMotion: BoardMotion = {
  preset: "none",
  duration: 900,
  delay: 0,
  distance: 32,
  easing: "smooth",
};

function humanLabel(id: string) {
  const parts = id.split(".");
  const last = parts.at(-1) ?? id;
  if (/^\d+$/.test(last)) {
    const parent = parts.at(-2) ?? "항목";
    return `${labelWords[parent] ?? parent} ${Number(last) + 1}`;
  }
  return labelWords[last] ?? last.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function textStyle(id: string): BoardTextItem["style"] {
  const title = /(?:^|\.)(title|name)$/.test(id);
  const heroTitle = id.includes("hero") && /title/.test(id);
  const eyebrow = /eyebrow|nameEn|label$/.test(id);
  return {
    fontFamily: eyebrow ? "Montserrat" : "Noto Sans KR",
    fontSize: heroTitle ? 46 : title ? 32 : eyebrow ? 13 : 17,
    fontWeight: heroTitle || title ? 700 : eyebrow ? 500 : 400,
    color: "#2b2b2b",
    lineHeight: title ? 1.25 : 1.65,
    letterSpacing: eyebrow ? 1.2 : 0,
    textAlign: "left",
    opacity: 100,
  };
}

function fromEntry(id: string, entry: SiteContentEntry, label = humanLabel(id)): BoardItem {
  if (entry.type === "text") {
    return {
      id,
      type: "text",
      label,
      value: entry.value,
      style: textStyle(id),
      styleTouched: false,
      layoutDesktop: { ...defaultLayout },
      motion: { ...defaultMotion },
      note: "",
    };
  }
  const desktop = desktopTransform(entry);
  const mobile = entry.mobile ? mobileTransform(entry) : undefined;
  return {
    id,
    type: entry.type,
    label: entry.label || label,
    sourceSrc: entry.src,
    asset: null,
    originalFileName: null,
    alt: entry.alt,
    desktop,
    mobile,
    effects: { ...defaultEffects },
    layoutDesktop: { ...defaultLayout },
    motion: { ...defaultMotion },
    note: "",
  };
}

function mergeItem(seed: BoardItem, saved: BoardItem): BoardItem {
  const base = {
    ...seed,
    ...saved,
    layoutDesktop: { ...defaultLayout, ...saved.layoutDesktop },
    ...(saved.layoutMobile ? { layoutMobile: { ...defaultLayout, ...saved.layoutMobile } } : {}),
    motion: { ...defaultMotion, ...saved.motion },
  };
  if (seed.type === "text" && saved.type === "text") {
    return { ...base, style: { ...seed.style, ...saved.style } } as BoardTextItem;
  }
  if (isBoardImageItem(seed) && isBoardImageItem(saved)) {
    return { ...base, effects: { ...seed.effects, ...saved.effects } } as BoardImageItem;
  }
  return seed;
}

function directItems(content: SiteContent, prefixes: string[]) {
  const items: BoardItem[] = [];
  for (const [id, value] of Object.entries(content)) {
    if (!prefixes.some((prefix) => id === prefix || id.startsWith(prefix))) continue;
    if (Array.isArray(value)) continue;
    if (value.type === "text" || value.type === "image" || value.type === "bgImage") items.push(fromEntry(id, value));
  }
  return items;
}

function specialItems(content: SiteContent, special: SlideDefinition["special"]) {
  if (special === "hero") {
    const slides = content["home.hero.slides"];
    if (!Array.isArray(slides)) return [];
    return slides.flatMap((slide) => {
      if (typeof slide !== "object" || slide === null || !("id" in slide) || !("bgImage" in slide)) return [];
      const value = slide as { id: string; bgImage: ImageContentEntry; eyebrow: string; title: string; titleStrong: string; description: string };
      const prefix = `home.hero.slides.${value.id}`;
      return [
        fromEntry(`${prefix}.bgImage`, value.bgImage, `${value.id} 배경`),
        fromEntry(`${prefix}.eyebrow`, { type: "text", value: value.eyebrow }, `${value.id} 작은 제목`),
        fromEntry(`${prefix}.title`, { type: "text", value: value.title }, `${value.id} 제목`),
        fromEntry(`${prefix}.titleStrong`, { type: "text", value: value.titleStrong }, `${value.id} 강조 제목`),
        fromEntry(`${prefix}.description`, { type: "text", value: value.description }, `${value.id} 설명`),
      ];
    });
  }
  if (special === "equipment") {
    const equipment = content["home.equipment.items"];
    const fixed = directItems(content, ["home.equipment."]);
    if (!Array.isArray(equipment)) return fixed;
    return fixed.concat(equipment.flatMap((item) => {
      if (typeof item !== "object" || item === null || !("id" in item) || !("image" in item)) return [];
      const value = item as { id: string; image: ImageContentEntry; name: string; desc: string; link: string };
      const prefix = `home.equipment.items.${value.id}`;
      return [
        fromEntry(`${prefix}.image`, value.image, `${value.name} 사진`),
        fromEntry(`${prefix}.name`, { type: "text", value: value.name }, `${value.name} 이름`),
        fromEntry(`${prefix}.desc`, { type: "text", value: value.desc }, `${value.name} 설명`),
        fromEntry(`${prefix}.link`, { type: "text", value: value.link }, `${value.name} 링크`),
      ];
    }));
  }
  if (special === "typing") {
    const examples = content["home.question.typingExamples"];
    return Array.isArray(examples) ? examples.map((value, index) => fromEntry(`home.question.typingExamples.${index}`, { type: "text", value: String(value) }, `타이핑 예시 ${index + 1}`)) : [];
  }
  return [];
}

function createSeedBoard(content: SiteContent): ContentBoard {
  const pages = new Map<string, ContentBoard["pages"][number]>();
  for (const definition of definitions) {
    const page = pages.get(definition.pageId) ?? { id: definition.pageId, title: definition.pageTitle, slides: [] };
    const items = definition.special ? specialItems(content, definition.special) : directItems(content, definition.prefixes ?? []);
    page.slides.push({
      id: definition.id,
      pageId: definition.pageId,
      pageTitle: definition.pageTitle,
      title: definition.title,
      description: definition.description,
      status: "작성 중",
      note: "",
      items,
    });
    pages.set(definition.pageId, page);
  }
  return { version: 1, updatedAt: new Date().toISOString(), pages: [...pages.values()] };
}

function mergeBoard(seed: ContentBoard, saved: ContentBoard): ContentBoard {
  return {
    ...seed,
    updatedAt: saved.updatedAt || seed.updatedAt,
    pages: seed.pages.map((page) => {
      const savedPage = saved.pages.find((value) => value.id === page.id);
      if (!savedPage) return page;
      return {
        ...page,
        slides: page.slides.map((slide) => {
          const savedSlide = savedPage.slides.find((value) => value.id === slide.id);
          if (!savedSlide) return slide;
          return {
            ...slide,
            status: savedSlide.status,
            note: savedSlide.note,
            items: slide.items.map((item) => {
              const savedItem = savedSlide.items.find((value) => value.id === item.id);
              return savedItem ? mergeItem(item, savedItem) : item;
            }),
          };
        }),
      };
    }),
  };
}

export async function readContentBoard() {
  const seed = createSeedBoard(await readSiteContent());
  try {
    const saved = JSON.parse(await readFile(boardPath, "utf8")) as ContentBoard;
    return mergeBoard(seed, saved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return seed;
  }
}

export async function writeContentBoard(board: ContentBoard) {
  await mkdir(boardRoot, { recursive: true });
  const next = { ...board, updatedAt: new Date().toISOString() };
  const temporary = `${boardPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(temporary, boardPath);
  return next;
}

export function updateBoardSlide(slideId: string, patch: Partial<Pick<BoardSlide, "status" | "note">>) {
  return enqueueMutation(async () => {
    const board = await readContentBoard();
    for (const page of board.pages) {
      const slide = page.slides.find((value) => value.id === slideId);
      if (!slide) continue;
      if (patch.status) slide.status = patch.status;
      if (typeof patch.note === "string") slide.note = patch.note;
      return writeContentBoard(board);
    }
    throw new Error("편집 슬라이드를 찾을 수 없습니다.");
  });
}

export function updateBoardItem(slideId: string, itemId: string, patch: Partial<BoardItem>) {
  return enqueueMutation(async () => {
    const board = await readContentBoard();
    for (const page of board.pages) {
      const slide = page.slides.find((value) => value.id === slideId);
      const itemIndex = slide?.items.findIndex((value) => value.id === itemId) ?? -1;
      if (!slide || itemIndex < 0) continue;
      const current = slide.items[itemIndex];
      if (patch.type && patch.type !== current.type) throw new Error("항목 형식은 바꿀 수 없습니다.");
      const merged = { ...current, ...patch } as BoardItem;
      if (current.type === "text" && "style" in patch && patch.style) {
        (merged as BoardTextItem).style = { ...current.style, ...patch.style };
      }
      if (isBoardImageItem(current) && "effects" in patch && patch.effects) {
        (merged as BoardImageItem).effects = { ...current.effects, ...patch.effects };
      }
      if ("layoutDesktop" in patch && patch.layoutDesktop) merged.layoutDesktop = { ...current.layoutDesktop, ...patch.layoutDesktop };
      if ("layoutMobile" in patch) merged.layoutMobile = patch.layoutMobile ? { ...(current.layoutMobile ?? current.layoutDesktop), ...patch.layoutMobile } : undefined;
      if ("motion" in patch && patch.motion) merged.motion = { ...current.motion, ...patch.motion };
      slide.items[itemIndex] = merged;
      return writeContentBoard(board);
    }
    throw new Error("편집 항목을 찾을 수 없습니다.");
  });
}

export async function saveBoardImage(slideId: string, itemId: string, fileName: string, mimeType: string, bytes: Uint8Array) {
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg" };
  const extension = extensions[mimeType];
  if (!extension) throw new Error("JPG, PNG, WebP, SVG 이미지만 사용할 수 있습니다.");
  const safeItem = itemId.replace(/[^a-z0-9.-]+/gi, "-");
  const safeOriginal = path.basename(fileName).normalize("NFC").replace(/[^\p{L}\p{N}._ ()-]/gu, "_");
  const storedName = `${safeItem}-${Date.now()}-${safeOriginal || `image.${extension}`}`;
  await mkdir(uploadsPath, { recursive: true });
  await writeFile(path.join(uploadsPath, storedName), bytes);
  const board = await updateBoardItem(slideId, itemId, { asset: storedName, originalFileName: safeOriginal || fileName } as Partial<BoardImageItem>);
  return { board, storedName };
}

export function contentBoardAssetPath(fileName: string) {
  const safe = path.basename(fileName);
  if (safe !== fileName || !safe) throw new Error("파일 이름이 올바르지 않습니다.");
  return path.join(uploadsPath, safe);
}
