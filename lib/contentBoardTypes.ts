export type BoardStatus = "작성 중" | "확인 필요" | "작성 완료";
export type BoardViewMode = "desktop" | "mobile";

export type BoardTextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  opacity: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right";
};

export type BoardElementTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  zIndex: number;
};

export type BoardMotionPreset =
  | "none"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "blur-in"
  | "clip-reveal"
  | "letter-spread";

export type BoardMotion = {
  preset: BoardMotionPreset;
  duration: number;
  delay: number;
  distance: number;
  easing: "smooth" | "ease-out" | "spring" | "linear";
};

export type BoardEditableBase = {
  layoutDesktop: BoardElementTransform;
  layoutMobile?: BoardElementTransform;
  motion: BoardMotion;
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

export type BoardTextItem = BoardEditableBase & {
  id: string;
  type: "text";
  label: string;
  value: string;
  style: BoardTextStyle;
  styleTouched?: boolean;
  note: string;
};

export type BoardImageItem = BoardEditableBase & {
  id: string;
  type: "image" | "bgImage";
  label: string;
  sourceSrc: string | null;
  /** Client-only object URL used while a newly dropped file is uploading. */
  previewSrc?: string;
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

export const BOARD_MOTION_OPTIONS: ReadonlyArray<{ value: BoardMotionPreset; label: string }> = [
  { value: "none", label: "없음" },
  { value: "fade-up", label: "아래에서 페이드" },
  { value: "fade-down", label: "위에서 페이드" },
  { value: "fade-left", label: "오른쪽에서 페이드" },
  { value: "fade-right", label: "왼쪽에서 페이드" },
  { value: "zoom-in", label: "작게 시작해 확대" },
  { value: "zoom-out", label: "크게 시작해 축소" },
  { value: "blur-in", label: "흐림에서 선명하게" },
  { value: "clip-reveal", label: "커튼처럼 열기" },
  { value: "letter-spread", label: "넓은 자간에서 모이기" },
];

export function isBoardImageItem(item: BoardItem): item is BoardImageItem {
  return item.type === "image" || item.type === "bgImage";
}
