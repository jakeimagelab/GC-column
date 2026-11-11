export type BoardStatus = "작성 중" | "확인 필요" | "작성 완료";
export type BoardViewMode = "desktop" | "mobile";

export type BoardTextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right";
};

export type BoardImageTransform = {
  x: number;
  y: number;
  zoom: number;
};

export type BoardImageEffects = {
  opacity: number;
  cropAspect: "free" | "16:9" | "4:3" | "1:1" | "3:4";
  overlayColor: string;
  overlayOpacity: number;
  gradientEnabled: boolean;
  gradientDirection: "to right" | "to left" | "to bottom" | "to top";
  gradientColor: string;
  gradientOpacity: number;
};

export type BoardTextItem = {
  id: string;
  type: "text";
  label: string;
  value: string;
  style: BoardTextStyle;
  note: string;
};

export type BoardImageItem = {
  id: string;
  type: "image" | "bgImage";
  label: string;
  sourceSrc: string | null;
  asset: string | null;
  originalFileName: string | null;
  alt: string;
  desktop: BoardImageTransform;
  mobile?: BoardImageTransform;
  effects: BoardImageEffects;
  note: string;
};

export type BoardItem = BoardTextItem | BoardImageItem;

export type BoardSlide = {
  id: string;
  pageId: string;
  pageTitle: string;
  title: string;
  description: string;
  status: BoardStatus;
  note: string;
  items: BoardItem[];
};

export type BoardPage = {
  id: string;
  title: string;
  slides: BoardSlide[];
};

export type ContentBoard = {
  version: 1;
  updatedAt: string;
  pages: BoardPage[];
};

export const BOARD_FONT_OPTIONS = [
  { value: "Noto Sans KR", label: "Noto Sans KR" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Nanum Pen Script", label: "Nanum Pen Script" },
  { value: "Pretendard", label: "Pretendard" },
  { value: "Apple SD Gothic Neo", label: "Apple SD Gothic Neo" },
  { value: "Georgia", label: "Georgia" },
  { value: "serif", label: "명조 계열" },
] as const;

export function isBoardImageItem(item: BoardItem): item is BoardImageItem {
  return item.type === "image" || item.type === "bgImage";
}
