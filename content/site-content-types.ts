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
};

export type SiteContentEntry = TextContentEntry | ImageContentEntry;
export type SiteContent = Record<string, SiteContentEntry>;

export function getText(content: SiteContent, id: string) {
  const entry = content[id];
  if (!entry || entry.type !== "text") {
    throw new Error(`Missing text content: ${id}`);
  }
  return entry.value;
}

export function getImage(content: SiteContent, id: string) {
  const entry = content[id];
  if (!entry || (entry.type !== "image" && entry.type !== "bgImage")) {
    throw new Error(`Missing image content: ${id}`);
  }
  return entry;
}

export function textEditProps(id: string) {
  return {
    "data-edit-id": id,
    "data-edit-type": "text",
    suppressHydrationWarning: true,
  } as const;
}
