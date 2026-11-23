export type TextContentEntry = {
  type: "text";
  value: string;
};

export type ImageContentEntry = {
  type: "image" | "bgImage";
  src: string | null;
  label: string;
  alt: string;
  zoom: number;
  focusX: number;
  focusY: number;
  desktop?: { x: number; y: number; zoom: number };
  mobile?: { x: number; y: number; zoom: number };
};

export type HeroSlide = {
  id: string;
  type: "image";
  bgImage: ImageContentEntry;
  eyebrow: string;
  title: string;
  titleStrong: string;
  description: string;
};

export type EquipmentContentItem = {
  id: string;
  image: ImageContentEntry;
  name: string;
  desc: string;
  hover?: string;
  link: string;
};

export type ConcernContentItem = {
  num: string;
  name: string;
  desc: string;
  link: string;
};

export type VisionPrincipleContentItem = {
  num: string;
  title: string;
  desc: string;
};

export type SiteContentEntry = TextContentEntry | ImageContentEntry;
export type TypingExamplesContent = string[];
export type SiteContentCollection = HeroSlide[] | EquipmentContentItem[] | ConcernContentItem[] | VisionPrincipleContentItem[] | TypingExamplesContent;
export type SiteContentValue = SiteContentEntry | SiteContentCollection;
export type SiteContent = Record<string, SiteContentValue>;

export const HERO_SLIDES_ID = "home.hero.slides";
export const EQUIPMENT_ITEMS_ID = "home.equipment.items";
export const TYPING_EXAMPLES_ID = "home.question.typingExamples";
export const HOME_CONCERN_ITEMS_ID = "home.concern.items";
export const VISION_PRINCIPLES_ID = "home.vision.principles";

export function isSiteContentEntry(value: SiteContentValue | undefined): value is SiteContentEntry {
  return Boolean(value && !Array.isArray(value) && (value.type === "text" || value.type === "image" || value.type === "bgImage"));
}

export function getText(content: SiteContent, id: string) {
  const entry = content[id];
  if (!isSiteContentEntry(entry) || entry.type !== "text") {
    throw new Error(`Missing text content: ${id}`);
  }
  return entry.value;
}

export function getImage(content: SiteContent, id: string) {
  const entry = content[id];
  if (!isSiteContentEntry(entry) || (entry.type !== "image" && entry.type !== "bgImage")) {
    throw new Error(`Missing image content: ${id}`);
  }
  return entry;
}

export function getHeroSlides(content: SiteContent): HeroSlide[] {
  const slides = content[HERO_SLIDES_ID];
  if (!Array.isArray(slides)) throw new Error("Missing home hero slides");
  return slides as HeroSlide[];
}

export function getEquipmentItems(content: SiteContent): EquipmentContentItem[] {
  const items = content[EQUIPMENT_ITEMS_ID];
  if (!Array.isArray(items)) throw new Error("Missing home equipment items");
  return items as EquipmentContentItem[];
}

export function getTypingExamples(content: SiteContent): TypingExamplesContent {
  const examples = content[TYPING_EXAMPLES_ID];
  if (!Array.isArray(examples) || !examples.every((item) => typeof item === "string")) {
    throw new Error("Missing home question typing examples");
  }
  return examples;
}

export function getConcernItems(content: SiteContent): ConcernContentItem[] {
  const items = content[HOME_CONCERN_ITEMS_ID];
  if (!Array.isArray(items)) throw new Error("Missing home concern items");
  return items as ConcernContentItem[];
}

export function getVisionPrinciples(content: SiteContent): VisionPrincipleContentItem[] {
  const items = content[VISION_PRINCIPLES_ID];
  if (!Array.isArray(items)) throw new Error("Missing home vision principles");
  return items as VisionPrincipleContentItem[];
}

export function getEditableEntry(content: SiteContent, id: string): SiteContentEntry | undefined {
  const direct = content[id];
  if (isSiteContentEntry(direct)) return direct;

  for (const slide of getHeroSlides(content)) {
    const prefix = `${HERO_SLIDES_ID}.${slide.id}.`;
    if (!id.startsWith(prefix)) continue;
    const field = id.slice(prefix.length);
    if (field === "bgImage") return slide.bgImage;
    if (field === "eyebrow" || field === "title" || field === "titleStrong" || field === "description") {
      return { type: "text", value: slide[field] };
    }
  }

  for (const item of getEquipmentItems(content)) {
    const prefix = `${EQUIPMENT_ITEMS_ID}.${item.id}.`;
    if (!id.startsWith(prefix)) continue;
    const field = id.slice(prefix.length);
    if (field === "image") return item.image;
    if (field === "name" || field === "desc" || field === "link" || field === "hover") {
      return { type: "text", value: item[field] ?? "" };
    }
  }

  for (const item of getConcernItems(content)) {
    const prefix = `${HOME_CONCERN_ITEMS_ID}.${item.num}.`;
    if (!id.startsWith(prefix)) continue;
    const field = id.slice(prefix.length);
    if (field === "num" || field === "name" || field === "desc" || field === "link") {
      return { type: "text", value: item[field] };
    }
  }

  for (const item of getVisionPrinciples(content)) {
    const prefix = `${VISION_PRINCIPLES_ID}.${item.num}.`;
    if (!id.startsWith(prefix)) continue;
    const field = id.slice(prefix.length);
    if (field === "num" || field === "title" || field === "desc") {
      return { type: "text", value: item[field] };
    }
  }

  return undefined;
}

export function withEditableEntry(content: SiteContent, id: string, entry: SiteContentEntry): SiteContent {
  const direct = content[id];
  if (isSiteContentEntry(direct)) return { ...content, [id]: entry };

  const slides = getHeroSlides(content);
  const slideIndex = slides.findIndex((slide) => id.startsWith(`${HERO_SLIDES_ID}.${slide.id}.`));
  if (slideIndex >= 0) {
    const slide = slides[slideIndex];
    const field = id.slice(`${HERO_SLIDES_ID}.${slide.id}.`.length);
    const updated = [...slides];
    if (field === "bgImage" && entry.type !== "text") {
      updated[slideIndex] = { ...slide, bgImage: entry };
    } else if ((field === "eyebrow" || field === "title" || field === "titleStrong" || field === "description") && entry.type === "text") {
      updated[slideIndex] = { ...slide, [field]: entry.value };
    } else {
      throw new Error(`Content type cannot be changed: ${id}`);
    }
    return { ...content, [HERO_SLIDES_ID]: updated };
  }

  const items = getEquipmentItems(content);
  const itemIndex = items.findIndex((item) => id.startsWith(`${EQUIPMENT_ITEMS_ID}.${item.id}.`));
  if (itemIndex >= 0) {
    const item = items[itemIndex];
    const field = id.slice(`${EQUIPMENT_ITEMS_ID}.${item.id}.`.length);
    const updated = [...items];
    if (field === "image" && entry.type !== "text") {
      updated[itemIndex] = { ...item, image: entry };
    } else if ((field === "name" || field === "desc" || field === "link" || field === "hover") && entry.type === "text") {
      updated[itemIndex] = { ...item, [field]: entry.value };
    } else {
      throw new Error(`Content type cannot be changed: ${id}`);
    }
    return { ...content, [EQUIPMENT_ITEMS_ID]: updated };
  }

  const concernItems = getConcernItems(content);
  const concernIndex = concernItems.findIndex((item) => id.startsWith(`${HOME_CONCERN_ITEMS_ID}.${item.num}.`));
  if (concernIndex >= 0) {
    if (entry.type !== "text") throw new Error(`Content type cannot be changed: ${id}`);
    const item = concernItems[concernIndex];
    const field = id.slice(`${HOME_CONCERN_ITEMS_ID}.${item.num}.`.length);
    if (field !== "num" && field !== "name" && field !== "desc" && field !== "link") {
      throw new Error(`Unknown content id: ${id}`);
    }
    const updated = [...concernItems];
    updated[concernIndex] = { ...item, [field]: entry.value };
    return { ...content, [HOME_CONCERN_ITEMS_ID]: updated };
  }

  const principles = getVisionPrinciples(content);
  const principleIndex = principles.findIndex((item) => id.startsWith(`${VISION_PRINCIPLES_ID}.${item.num}.`));
  if (principleIndex >= 0) {
    if (entry.type !== "text") throw new Error(`Content type cannot be changed: ${id}`);
    const item = principles[principleIndex];
    const field = id.slice(`${VISION_PRINCIPLES_ID}.${item.num}.`.length);
    if (field !== "num" && field !== "title" && field !== "desc") {
      throw new Error(`Unknown content id: ${id}`);
    }
    const updated = [...principles];
    updated[principleIndex] = { ...item, [field]: entry.value };
    return { ...content, [VISION_PRINCIPLES_ID]: updated };
  }

  throw new Error(`Unknown content id: ${id}`);
}

export function textEditProps(id: string, rich = false) {
  return {
    "data-edit-id": id,
    "data-edit-type": "text",
    ...(rich ? { "data-edit-rich": "true" } : {}),
    suppressHydrationWarning: true,
  } as const;
}

export function attributeEditProps(id: string, attribute: "href") {
  return {
    "data-edit-id": id,
    "data-edit-type": "text",
    "data-edit-attribute": attribute,
    suppressHydrationWarning: true,
  } as const;
}
