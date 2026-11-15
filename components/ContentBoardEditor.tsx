"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import {
  BOARD_FONT_OPTIONS,
  BOARD_MOTION_OPTIONS,
  isBoardImageItem,
  type BoardElementTransform,
  type BoardImageItem,
  type BoardImageTransform,
  type BoardItem,
  type BoardMotion,
  type BoardSlide,
  type BoardStatus,
  type BoardTextItem,
  type BoardTextStyle,
  type BoardViewMode,
  type ContentBoard,
} from "@/lib/contentBoardTypes";
import styles from "./ContentBoardEditor.module.css";

type Props = { initialBoard: ContentBoard };
type SaveState = "saved" | "saving" | "error";
type PendingUpload = { slideId: string; item: BoardImageItem; file: File; objectUrl: string };
type BatchUploadEntry = { id: string; file: File; objectUrl: string; itemId: string };
type CanvasMode = "design" | "items";
type InteractionMode = "edit" | "move";
type HistoryAvailability = { undo: boolean; redo: boolean };

const clone = <T,>(value: T): T => structuredClone(value);
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const previewKey = (slideId: string, itemId: string) => `${slideId}:${itemId}`;
const defaultElementTransform: BoardElementTransform = { x: 0, y: 0, scale: 100, rotate: 0, zIndex: 0 };

function imageMime(file: File) {
  if (["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) return file.type;
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  return extension === "jpg" || extension === "jpeg" ? "image/jpeg"
    : extension === "png" ? "image/png"
      : extension === "webp" ? "image/webp"
        : extension === "svg" ? "image/svg+xml" : "";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownToHtml(value: string) {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
}

function editableToMarkdown(root: HTMLElement) {
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";
    if (node.tagName === "BR") return "\n";
    const children = Array.from(node.childNodes).map(walk).join("");
    if (node !== root && (node.tagName === "STRONG" || node.tagName === "B")) return `**${children}**`;
    if (node !== root && (node.tagName === "DIV" || node.tagName === "P")) return `${children}\n`;
    return children;
  };
  return walk(root).replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").replace(/\n+$/g, "");
}

function fontFamily(value: string) {
  const known: Record<string, string> = {
    "Noto Sans KR": "var(--font-sans)",
    Montserrat: "var(--font-en)",
    "Nanum Pen Script": "var(--font-sign)",
    Pretendard: 'Pretendard, "Apple SD Gothic Neo", var(--font-sans)',
    "Apple SD Gothic Neo": '"Apple SD Gothic Neo", var(--font-sans)',
    Georgia: "Georgia, serif",
    serif: '"Times New Roman", serif',
  };
  return known[value] ?? value;
}

function hexToRgba(hex: string, opacity: number) {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#2b2b2b";
  const red = parseInt(safe.slice(1, 3), 16);
  const green = parseInt(safe.slice(3, 5), 16);
  const blue = parseInt(safe.slice(5, 7), 16);
  return `rgba(${red},${green},${blue},${opacity / 100})`;
}

function itemImageUrl(item: BoardImageItem, temporary?: string) {
  if (temporary) return temporary;
  if (item.asset) return `/api/dev-content-board?asset=${encodeURIComponent(item.asset)}`;
  return item.sourceSrc ?? "";
}

function transformFor(item: BoardImageItem, mode: BoardViewMode) {
  return mode === "mobile" ? item.mobile ?? item.desktop : item.desktop;
}

function elementTransformFor(item: BoardItem, mode: BoardViewMode) {
  return mode === "mobile" ? item.layoutMobile ?? item.layoutDesktop : item.layoutDesktop;
}

function findSlide(board: ContentBoard, slideId: string) {
  return board.pages.flatMap((page) => page.slides).find((slide) => slide.id === slideId);
}

const HERO_ITEM_PATTERN = /^home\.hero\.slides\.([^.]+)\.(bgImage|eyebrow|title|titleStrong|description)$/;

function heroSlideIds(slide?: BoardSlide) {
  const ids: string[] = [];
  slide?.items.forEach((item) => {
    const id = item.id.match(HERO_ITEM_PATTERN)?.[1];
    if (id && !ids.includes(id)) ids.push(id);
  });
  return ids;
}

function cloneHeroSlideItems(slide: BoardSlide, sourceId: string, nextId: string) {
  const sourcePrefix = `home.hero.slides.${sourceId}.`;
  const nextPrefix = `home.hero.slides.${nextId}.`;
  return slide.items
    .filter((item) => item.id.startsWith(sourcePrefix))
    .map((item) => ({
      ...clone(item),
      id: `${nextPrefix}${item.id.slice(sourcePrefix.length)}`,
      label: item.label.replace(sourceId, nextId),
    } as BoardItem));
}

function previewPath(slide: BoardSlide) {
  if (slide.pageId === "column") return "/column";
  if (slide.pageId === "doctor") return "/doctor/lee-ho";
  if (slide.pageId === "detail") return "/column/xerf-vs-thermage";
  return "/";
}

function previewPageId(slide: BoardSlide) {
  return slide.pageId === "common" ? "home" : slide.pageId;
}

function TextCanvasItem({ item, selected, onSelect, onChange }: {
  item: BoardTextItem;
  selected: boolean;
  onSelect: () => void;
  onChange: (value: string) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = editor.current;
    if (node && document.activeElement !== node) node.innerHTML = markdownToHtml(item.value);
  }, [item.value]);

  const textStyle = {
    fontFamily: fontFamily(item.style.fontFamily),
    fontSize: `${item.style.fontSize}px`,
    fontWeight: item.style.fontWeight,
    color: item.style.color,
    opacity: item.style.opacity / 100,
    lineHeight: item.style.lineHeight,
    letterSpacing: `${item.style.letterSpacing}px`,
    textAlign: item.style.textAlign,
  } as CSSProperties;

  return (
    <article className={`${styles.textItem} ${selected ? styles.selectedItem : ""}`} onClick={onSelect}>
      <header><span>{item.label}</span><small>글자</small></header>
      <div
        ref={editor}
        className={styles.editableText}
        style={textStyle}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={`${item.label} 편집`}
        data-empty={!item.value ? "true" : undefined}
        onFocus={onSelect}
        onBlur={(event) => onChange(editableToMarkdown(event.currentTarget))}
        onPaste={(event) => {
          event.preventDefault();
          document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
            event.preventDefault();
            document.execCommand("bold");
          }
        }}
      />
      {selected ? <button
        type="button"
        className={styles.inlineBold}
        aria-label="선택 글자 굵게"
        onMouseDown={(event) => {
          event.preventDefault();
          document.execCommand("bold");
        }}
      >B</button> : null}
    </article>
  );
}

function ImageCanvasItem({ item, selected, mode, temporary, onSelect, onDropFile, onTransform }: {
  item: BoardImageItem;
  selected: boolean;
  mode: BoardViewMode;
  temporary?: string;
  onSelect: () => void;
  onDropFile: (file: File) => void;
  onTransform: (value: BoardImageTransform, commit: boolean) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number; start: BoardImageTransform; latest: BoardImageTransform } | null>(null);
  const wheel = useRef<{ latest: BoardImageTransform; timer: number } | null>(null);
  const value = transformFor(item, mode);
  const imageUrl = itemImageUrl(item, temporary);
  const aspect = item.effects.cropAspect === "free" ? "4 / 3" : item.effects.cropAspect.replace(":", " / ");

  const updateFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const next = {
      ...current.start,
      x: clamp(current.start.x - (event.clientX - current.x) / Math.max(rect.width, 1) * 100, 0, 100),
      y: clamp(current.start.y - (event.clientY - current.y) / Math.max(rect.height, 1) * 100, 0, 100),
    };
    current.latest = next;
    onTransform(next, false);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!imageUrl || !selected) return;
    event.preventDefault();
    const current = wheel.current?.latest ?? value;
    const step = clamp(Math.abs(event.deltaY) / 20, 1, 5);
    const zoom = Math.round(clamp(current.zoom + (event.deltaY < 0 ? step : -step), 100, 300) * 10) / 10;
    const next = { ...current, zoom };
    if (wheel.current?.timer) window.clearTimeout(wheel.current.timer);
    onTransform(next, false);
    const timer = window.setTimeout(() => {
      onTransform(next, true);
      wheel.current = null;
    }, 160);
    wheel.current = { latest: next, timer };
  };

  useEffect(() => () => {
    if (wheel.current?.timer) window.clearTimeout(wheel.current.timer);
  }, []);

  return (
    <article className={`${styles.imageItem} ${selected ? styles.selectedItem : ""}`} onClick={onSelect}>
      <header><span>{item.label}</span><small>{item.type === "bgImage" ? "배경" : "사진"}</small></header>
      <div
        className={styles.imageViewport}
        data-selected={selected ? "true" : undefined}
        style={{ aspectRatio: aspect }}
        role="group"
        tabIndex={0}
        aria-label={`${item.label} 사진 배치. 파일을 끌어 놓거나 사진 선택 버튼을 사용하세요.`}
        onDragOver={(event) => { event.preventDefault(); event.currentTarget.dataset.dragover = "true"; }}
        onDragLeave={(event) => { delete event.currentTarget.dataset.dragover; }}
        onDrop={(event) => {
          event.preventDefault();
          delete event.currentTarget.dataset.dragover;
          const file = event.dataTransfer.files[0];
          if (file) onDropFile(file);
        }}
        onPointerDown={(event) => {
          onSelect();
          if (!selected || !imageUrl || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: value, latest: value };
        }}
        onPointerMove={updateFromPointer}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          onTransform(drag.current.latest, true);
          drag.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drag.current = null; }}
        onWheel={handleWheel}
        onKeyDown={(event) => {
          if (!imageUrl) return;
          const step = event.shiftKey ? 5 : 2;
          const next = { ...value };
          if (event.key === "ArrowLeft") next.x = clamp(value.x - step, 0, 100);
          else if (event.key === "ArrowRight") next.x = clamp(value.x + step, 0, 100);
          else if (event.key === "ArrowUp") next.y = clamp(value.y - step, 0, 100);
          else if (event.key === "ArrowDown") next.y = clamp(value.y + step, 0, 100);
          else if (event.key === "+" || event.key === "=") next.zoom = clamp(value.zoom + 5, 100, 300);
          else if (event.key === "-" || event.key === "_") next.zoom = clamp(value.zoom - 5, 100, 300);
          else return;
          event.preventDefault();
          onSelect();
          onTransform(next, true);
        }}
      >
        {imageUrl ? <img
          src={imageUrl}
          alt={item.alt}
          draggable={false}
          style={{
            objectPosition: `${value.x}% ${value.y}%`,
            transform: `scale(${value.zoom / 100})`,
            transformOrigin: `${value.x}% ${value.y}%`,
            opacity: item.effects.opacity / 100,
          }}
        /> : <div className={styles.dropEmpty}><b>사진을 여기에 놓으세요</b><span>파인더에서 바로 드래그</span></div>}
        <span className={styles.colorOverlay} style={{ background: item.effects.overlayColor, opacity: item.effects.overlayOpacity / 100 }} />
        {item.effects.gradientEnabled ? <span className={styles.gradientOverlay} style={{ background: `linear-gradient(${item.effects.gradientDirection}, ${hexToRgba(item.effects.gradientColor, item.effects.gradientOpacity)}, transparent)` }} /> : null}
        {imageUrl ? <div className={styles.imageHint}>{selected ? "드래그 이동 · 휠 확대" : "클릭해 활성화"}</div> : null}
      </div>
      <footer>
        <span>{item.originalFileName || item.sourceSrc?.split("/").at(-1) || "사진 미지정"}</span>
        <b>{Math.round(value.zoom)}%</b>
        <button type="button" onClick={(event) => { event.stopPropagation(); fileInput.current?.click(); }}>{imageUrl ? "교체" : "사진 선택"}</button>
        <input
          ref={fileInput}
          className={styles.fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onDropFile(file);
            event.currentTarget.value = "";
          }}
        />
      </footer>
    </article>
  );
}

function DesignPreview({ slide, viewMode, iframeRef, onLoad }: {
  slide: BoardSlide;
  viewMode: BoardViewMode;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onLoad: () => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const width = viewMode === "mobile" ? 390 : 1440;
  const height = viewMode === "mobile" ? 844 : 900;

  useEffect(() => {
    const target = frame.current;
    if (!target) return;
    const update = () => setScale(Math.min(1, Math.max(.2, (target.clientWidth - 24) / width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(target);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={frame} className={styles.designPreview} style={{ height: `${height * scale + 48}px` }}>
      <div className={styles.previewGuide}><b>실제 홈페이지 디자인</b><span>사진·박스는 클릭해 활성화한 뒤 확대·이동 · 스마트 가이드 자동 정렬 · Option(Alt): 스냅 잠시 해제</span><em>{Math.round(scale * 100)}%</em></div>
      <iframe
        ref={iframeRef}
        key={`${previewPath(slide)}-${viewMode}`}
        title={`${slide.pageTitle} ${slide.title} 실제 디자인 편집 화면`}
        src={`${previewPath(slide)}?content-board-preview=1`}
        style={{ width, height, transform: `translateX(-50%) scale(${scale})` }}
        onLoad={onLoad}
      />
    </div>
  );
}

function LayoutControls({ item, viewMode, onViewMode, onLayout }: {
  item: BoardItem;
  viewMode: BoardViewMode;
  onViewMode: (mode: BoardViewMode) => void;
  onLayout: (value: BoardElementTransform, commit?: boolean) => void;
}) {
  const layout = elementTransformFor(item, viewMode);
  const nudge = (x: number, y: number) => onLayout({ ...layout, x: layout.x + x, y: layout.y + y }, true);
  const numberValue = (value: string, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  return <>
    <div className={styles.inspectorMode} aria-label="반응형 편집 기준">
      <button type="button" className={viewMode === "desktop" ? styles.active : ""} onClick={() => onViewMode("desktop")}>PC</button>
      <button type="button" className={viewMode === "mobile" ? styles.active : ""} onClick={() => onViewMode("mobile")}>모바일</button>
    </div>
    <fieldset>
      <legend>배치·크기</legend>
      <div className={styles.controlGridCompact}>
        <label>X 이동<input type="number" min="-2000" max="2000" value={Math.round(layout.x)} onChange={(event) => onLayout({ ...layout, x: numberValue(event.target.value, layout.x) })} /></label>
        <label>Y 이동<input type="number" min="-2000" max="2000" value={Math.round(layout.y)} onChange={(event) => onLayout({ ...layout, y: numberValue(event.target.value, layout.y) })} /></label>
        <label>회전<input type="number" min="-360" max="360" value={Math.round(layout.rotate)} onChange={(event) => onLayout({ ...layout, rotate: numberValue(event.target.value, layout.rotate) })} /></label>
        <label>레이어<input type="number" min="-100" max="1000" value={layout.zIndex} onChange={(event) => onLayout({ ...layout, zIndex: Math.round(numberValue(event.target.value, layout.zIndex)) })} /></label>
      </div>
      <label className={styles.rangeLabel}>전체 크기 <input type="range" min="10" max="300" value={layout.scale} onChange={(event) => onLayout({ ...layout, scale: Number(event.target.value) })} /><output>{Math.round(layout.scale)}%</output></label>
      <div className={styles.nudgePad} aria-label="위치 미세 조정">
        <button type="button" onClick={() => nudge(0, -10)} aria-label="위로 10픽셀">↑</button>
        <button type="button" onClick={() => nudge(-10, 0)} aria-label="왼쪽으로 10픽셀">←</button>
        <button type="button" onClick={() => onLayout({ ...layout, x: 0, y: 0 }, true)}>위치 0</button>
        <button type="button" onClick={() => nudge(10, 0)} aria-label="오른쪽으로 10픽셀">→</button>
        <button type="button" onClick={() => nudge(0, 10)} aria-label="아래로 10픽셀">↓</button>
      </div>
      <button type="button" className={styles.resetWide} onClick={() => onLayout({ ...defaultElementTransform }, true)}>현재 화면 배치 초기화</button>
    </fieldset>
  </>;
}

function MotionControls({ item, onMotion, onPreview }: {
  item: BoardItem;
  onMotion: (value: BoardMotion) => void;
  onPreview: () => void;
}) {
  const numberValue = (value: string, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  return (
    <fieldset>
      <legend>나타나는 모션</legend>
      <label>효과<select value={item.motion.preset} onChange={(event) => onMotion({ ...item.motion, preset: event.target.value as BoardMotion["preset"] })}>{BOARD_MOTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <div className={styles.controlGridCompact}>
        <label>시간(ms)<input type="number" min="100" max="5000" step="50" value={item.motion.duration} onChange={(event) => onMotion({ ...item.motion, duration: numberValue(event.target.value, item.motion.duration) })} /></label>
        <label>지연(ms)<input type="number" min="0" max="5000" step="50" value={item.motion.delay} onChange={(event) => onMotion({ ...item.motion, delay: numberValue(event.target.value, item.motion.delay) })} /></label>
      </div>
      <label className={styles.rangeLabel}>이동 거리 <input type="range" min="0" max="240" value={item.motion.distance} onChange={(event) => onMotion({ ...item.motion, distance: Number(event.target.value) })} /><output>{Math.round(item.motion.distance)}px</output></label>
      <label>움직임<select value={item.motion.easing} onChange={(event) => onMotion({ ...item.motion, easing: event.target.value as BoardMotion["easing"] })}><option value="smooth">부드럽게</option><option value="ease-out">차분하게</option><option value="spring">살짝 탄력</option><option value="linear">일정하게</option></select></label>
      <button type="button" className={styles.motionPreviewButton} onClick={onPreview} disabled={item.motion.preset === "none"}>▶ 선택 항목 모션 보기</button>
    </fieldset>
  );
}

export function ContentBoardEditor({ initialBoard }: Props) {
  const [board, setBoard] = useState(() => clone(initialBoard));
  const boardRef = useRef(board);
  const firstSlide = initialBoard.pages[0]?.slides[0]?.id ?? "";
  const [activeSlideId, setActiveSlideId] = useState(firstSlide);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<BoardViewMode>("desktop");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("design");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("edit");
  const [focusPreview, setFocusPreview] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [batchUploads, setBatchUploads] = useState<BatchUploadEntry[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [temporaryPreviews, setTemporaryPreviews] = useState<Record<string, string>>({});
  const temporaryPreviewsRef = useRef<Record<string, string>>({});
  const pendingUploadRef = useRef<PendingUpload | null>(null);
  const batchUploadsRef = useRef<BatchUploadEntry[]>([]);
  const batchFileInput = useRef<HTMLInputElement>(null);
  const timers = useRef(new Map<string, number>());
  const pendingPayloads = useRef(new Map<string, Record<string, unknown>>());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const savingCount = useRef(0);
  const historyPast = useRef<ContentBoard[]>([]);
  const historyFuture = useRef<ContentBoard[]>([]);
  const historyGroup = useRef<{ key: string; at: number } | null>(null);
  const [historyAvailability, setHistoryAvailability] = useState<HistoryAvailability>({ undo: false, redo: false });
  const [heroEditorIndex, setHeroEditorIndex] = useState(0);

  const slides = useMemo(() => board.pages.flatMap((page) => page.slides), [board.pages]);
  const activeSlide = findSlide(board, activeSlideId) ?? slides[0];
  const activeIndex = slides.findIndex((slide) => slide.id === activeSlide?.id);
  const activeImageItems = useMemo(
    () => activeSlide?.items.filter(isBoardImageItem) ?? [],
    [activeSlide],
  );
  const activeHeroSlideIds = useMemo(
    () => activeSlide?.id === "home-hero" ? heroSlideIds(activeSlide) : [],
    [activeSlide],
  );
  const previewSlides = useMemo(() => {
    if (!activeSlide) return [];
    const pageId = previewPageId(activeSlide);
    return [
      activeSlide,
      ...slides.filter((slide) => slide.id !== activeSlide.id && (slide.pageId === "common" || slide.pageId === pageId)),
    ];
  }, [activeSlide, slides]);
  const previewItems = useMemo(() => {
    const seen = new Set<string>();
    return previewSlides.flatMap((slide) => slide.items).filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [previewSlides]);
  const previewItemSlideIds = useMemo(() => {
    const owners = new Map<string, string>();
    previewSlides.forEach((slide) => slide.items.forEach((item) => {
      if (!owners.has(item.id)) owners.set(item.id, slide.id);
    }));
    return owners;
  }, [previewSlides]);
  const selectedItemSlide = selectedItemId
    ? slides.find((slide) => slide.items.some((item) => item.id === selectedItemId))
    : undefined;
  const selectedItem = selectedItemSlide?.items.find((item) => item.id === selectedItemId);
  const selectedSlideId = selectedItemSlide?.id ?? activeSlide?.id ?? "";
  const completed = slides.filter((slide) => slide.status === "작성 완료").length;

  useEffect(() => {
    temporaryPreviewsRef.current = temporaryPreviews;
  }, [temporaryPreviews]);

  useEffect(() => {
    batchUploadsRef.current = batchUploads;
  }, [batchUploads]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    Object.values(temporaryPreviewsRef.current).forEach((url) => URL.revokeObjectURL(url));
    if (pendingUploadRef.current) URL.revokeObjectURL(pendingUploadRef.current.objectUrl);
    batchUploadsRef.current.forEach((entry) => URL.revokeObjectURL(entry.objectUrl));
  }, []);

  const setUploadDraft = (draft: PendingUpload | null) => {
    pendingUploadRef.current = draft;
    setPendingUpload(draft);
  };

  const updateHistoryAvailability = useCallback(() => {
    setHistoryAvailability({ undo: historyPast.current.length > 0, redo: historyFuture.current.length > 0 });
  }, []);

  const recordHistory = useCallback((current: ContentBoard, key: string) => {
    const now = Date.now();
    const group = historyGroup.current;
    const grouped = group?.key === key && now - group.at < 800;
    if (!grouped) {
      historyPast.current.push(clone(current));
      if (historyPast.current.length > 60) historyPast.current.shift();
      historyFuture.current = [];
    }
    historyGroup.current = { key, at: now };
    updateHistoryAvailability();
  }, [updateHistoryAvailability]);

  const mutateBoard = useCallback((historyKey: string, mutate: (draft: ContentBoard) => boolean) => {
    const current = boardRef.current;
    const next = clone(current);
    if (!mutate(next)) return false;
    recordHistory(current, historyKey);
    boardRef.current = next;
    setBoard(next);
    return true;
  }, [recordHistory]);

  const performSave = useCallback(async (payload: Record<string, unknown>) => {
    savingCount.current += 1;
    setSaveState("saving");
    setError("");
    try {
      const response = await fetch("/api/dev-content-board", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "저장하지 못했습니다.");
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "저장하지 못했습니다.");
    } finally {
      savingCount.current -= 1;
      if (!savingCount.current) setSaveState((current) => current === "error" ? current : "saved");
    }
  }, []);

  const queueSave = useCallback((key: string, payload: Record<string, unknown>, delay = 260) => {
    const previous = timers.current.get(key);
    if (previous) window.clearTimeout(previous);
    const queued = pendingPayloads.current.get(key);
    const previousPatch = queued?.patch && typeof queued.patch === "object" ? queued.patch as Record<string, unknown> : {};
    const nextPatch = payload.patch && typeof payload.patch === "object" ? payload.patch as Record<string, unknown> : {};
    const mergedPatch = {
      ...previousPatch,
      ...nextPatch,
      ...(previousPatch.style || nextPatch.style ? {
        style: { ...(previousPatch.style as Record<string, unknown> ?? {}), ...(nextPatch.style as Record<string, unknown> ?? {}) },
      } : {}),
      ...(previousPatch.effects || nextPatch.effects ? {
        effects: { ...(previousPatch.effects as Record<string, unknown> ?? {}), ...(nextPatch.effects as Record<string, unknown> ?? {}) },
      } : {}),
    };
    pendingPayloads.current.set(key, { ...(queued ?? {}), ...payload, patch: mergedPatch });
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      timers.current.delete(key);
      const nextPayload = pendingPayloads.current.get(key) ?? payload;
      pendingPayloads.current.delete(key);
      void performSave(nextPayload);
    }, delay);
    timers.current.set(key, timer);
  }, [performSave]);

  const clearQueuedSaves = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    pendingPayloads.current.clear();
  }, []);

  const restoreHistorySnapshot = useCallback((snapshot: ContentBoard) => {
    clearQueuedSaves();
    historyGroup.current = null;
    const next = clone(snapshot);
    boardRef.current = next;
    setBoard(next);
    updateHistoryAvailability();
    void performSave({ kind: "history", board: next });
  }, [clearQueuedSaves, performSave, updateHistoryAvailability]);

  const undo = useCallback(() => {
    const previous = historyPast.current.pop();
    if (!previous) return;
    historyFuture.current.push(clone(boardRef.current));
    if (historyFuture.current.length > 60) historyFuture.current.shift();
    restoreHistorySnapshot(previous);
  }, [restoreHistorySnapshot]);

  const redo = useCallback(() => {
    const next = historyFuture.current.pop();
    if (!next) return;
    historyPast.current.push(clone(boardRef.current));
    if (historyPast.current.length > 60) historyPast.current.shift();
    restoreHistorySnapshot(next);
  }, [restoreHistorySnapshot]);

  useEffect(() => {
    const flushQueuedSaves = () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
      const payloads = Array.from(pendingPayloads.current.values());
      pendingPayloads.current.clear();
      payloads.forEach((payload) => {
        void fetch("/api/dev-content-board", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      });
    };
    window.addEventListener("pagehide", flushQueuedSaves);
    return () => window.removeEventListener("pagehide", flushQueuedSaves);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key !== "z" && !(event.ctrlKey && key === "y")) return;
      const target = event.target as HTMLElement | null;
      const editingText = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;
      if (editingText) return;
      event.preventDefault();
      if (event.shiftKey || (event.ctrlKey && key === "y")) redo();
      else undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  const updateItem = useCallback((slideId: string, itemId: string, patch: Partial<BoardItem>, saveKind: "text" | "image", immediate = false) => {
    const changed = mutateBoard(`item:${slideId}:${itemId}`, (next) => {
      const slide = findSlide(next, slideId);
      if (!slide) return false;
      const index = slide.items.findIndex((item) => item.id === itemId);
      if (index < 0) return false;
      const existing = slide.items[index];
      const merged = { ...existing, ...patch } as BoardItem;
      if (existing.type === "text" && "style" in patch && patch.style) {
        (merged as BoardTextItem).style = { ...existing.style, ...patch.style };
      }
      if (isBoardImageItem(existing) && "effects" in patch && patch.effects) {
        (merged as BoardImageItem).effects = { ...existing.effects, ...patch.effects };
      }
      if (JSON.stringify(existing) === JSON.stringify(merged)) return false;
      slide.items[index] = merged;
      return true;
    });
    if (changed) queueSave(`${slideId}:${itemId}`, { kind: saveKind, slideId, itemId, patch }, immediate ? 0 : 260);
  }, [mutateBoard, queueSave]);

  const updateSlide = (slideId: string, patch: Partial<Pick<BoardSlide, "status" | "note">>, immediate = false) => {
    const changed = mutateBoard(`slide:${slideId}`, (next) => {
      const slide = findSlide(next, slideId);
      if (!slide) return false;
      if (Object.entries(patch).every(([key, value]) => slide[key as keyof Pick<BoardSlide, "status" | "note">] === value)) return false;
      Object.assign(slide, patch);
      return true;
    });
    if (changed) queueSave(`slide:${slideId}`, { kind: "slide", slideId, patch }, immediate ? 0 : 260);
  };

  const uploadImage = async (draft: PendingUpload) => {
    setUploadDraft(null);
    setSaveState("saving");
    const key = previewKey(draft.slideId, draft.item.id);
    setTemporaryPreviews((current) => ({ ...current, [key]: draft.objectUrl }));
    const form = new FormData();
    form.set("slideId", draft.slideId);
    form.set("itemId", draft.item.id);
    form.set("file", draft.file);
    try {
      const response = await fetch("/api/dev-content-board", { method: "POST", body: form });
      const result = await response.json() as { storedName?: string; error?: string };
      if (!response.ok || !result.storedName) throw new Error(result.error || "사진을 저장하지 못했습니다.");
      mutateBoard(`upload:${draft.slideId}:${draft.item.id}`, (next) => {
        const slide = findSlide(next, draft.slideId);
        const item = slide?.items.find((value) => value.id === draft.item.id);
        if (item && isBoardImageItem(item)) {
          item.asset = result.storedName!;
          item.originalFileName = draft.file.name;
          return true;
        }
        return false;
      });
      URL.revokeObjectURL(draft.objectUrl);
      setTemporaryPreviews((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setSaveState("saved");
    } catch (uploadError) {
      URL.revokeObjectURL(draft.objectUrl);
      setTemporaryPreviews((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setSaveState("error");
      setError(uploadError instanceof Error ? uploadError.message : "사진을 저장하지 못했습니다.");
    }
  };

  const requestUpload = (slideId: string, item: BoardImageItem, file: File) => {
    if (!imageMime(file)) {
      setSaveState("error");
      setError("JPG, PNG, WebP, SVG 이미지만 넣을 수 있습니다.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setSaveState("error");
      setError("사진은 한 장당 30MB 이하여야 합니다.");
      return;
    }
    const draft = { slideId, item, file, objectUrl: URL.createObjectURL(file) };
    if (pendingUploadRef.current) URL.revokeObjectURL(pendingUploadRef.current.objectUrl);
    if (item.asset || item.sourceSrc) setUploadDraft(draft);
    else void uploadImage(draft);
  };

  const closeBatchUpload = () => {
    if (batchUploading) return;
    batchUploadsRef.current.forEach((entry) => URL.revokeObjectURL(entry.objectUrl));
    batchUploadsRef.current = [];
    setBatchUploads([]);
    setBatchProgress({ done: 0, total: 0 });
  };

  const openBatchUpload = (files: File[]) => {
    if (!activeSlide || activeImageItems.length < 2) return;
    const accepted = files.filter((file) => imageMime(file) && file.size <= 30 * 1024 * 1024).slice(0, 40);
    const rejected = files.length - accepted.length;
    if (!accepted.length) {
      setSaveState("error");
      setError("JPG, PNG, WebP, SVG 이미지를 한 장당 30MB 이하로 선택해 주세요.");
      return;
    }

    batchUploadsRef.current.forEach((entry) => URL.revokeObjectURL(entry.objectUrl));
    const empty = (item: BoardImageItem) => !item.asset && !item.sourceSrc;
    const orderedSlots = [
      ...activeImageItems.filter((item) => item.type === "image" && empty(item)),
      ...activeImageItems.filter((item) => item.type === "bgImage" && empty(item)),
      ...activeImageItems.filter((item) => item.type === "image" && !empty(item)),
      ...activeImageItems.filter((item) => item.type === "bgImage" && !empty(item)),
    ];
    const entries = accepted.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      file,
      objectUrl: URL.createObjectURL(file),
      itemId: orderedSlots[index]?.id ?? "",
    }));
    batchUploadsRef.current = entries;
    setBatchUploads(entries);
    setBatchProgress({ done: 0, total: entries.filter((entry) => entry.itemId).length });
    setError(rejected > 0 ? `${rejected}개 파일은 형식·용량 제한으로 제외했습니다.` : "");
    setSaveState(rejected > 0 ? "error" : "saved");
  };

  const uploadBatchImages = async () => {
    if (!activeSlide || batchUploading) return;
    const entries = batchUploads.filter((entry) => entry.itemId);
    const destinations = entries.map((entry) => entry.itemId);
    if (!entries.length) {
      setSaveState("error");
      setError("배치할 사진 자리를 한 개 이상 선택해 주세요.");
      return;
    }
    if (new Set(destinations).size !== destinations.length) {
      setSaveState("error");
      setError("같은 자리에 두 장을 배치할 수 없습니다. 사진마다 다른 자리를 선택해 주세요.");
      return;
    }

    setBatchUploading(true);
    setBatchProgress({ done: 0, total: entries.length });
    setSaveState("saving");
    setError("");
    setTemporaryPreviews((current) => {
      const next = { ...current };
      entries.forEach((entry) => { next[previewKey(activeSlide.id, entry.itemId)] = entry.objectUrl; });
      return next;
    });

    const uploaded: { itemId: string; storedName: string; originalFileName: string }[] = [];
    const failures: string[] = [];
    for (const entry of entries) {
      const form = new FormData();
      form.set("slideId", activeSlide.id);
      form.set("itemId", entry.itemId);
      form.set("file", entry.file);
      try {
        const response = await fetch("/api/dev-content-board", { method: "POST", body: form });
        const result = await response.json() as { storedName?: string; error?: string };
        if (!response.ok || !result.storedName) throw new Error(result.error || "저장 실패");
        uploaded.push({ itemId: entry.itemId, storedName: result.storedName, originalFileName: entry.file.name });
      } catch {
        failures.push(entry.file.name);
      }
      setBatchProgress((current) => ({ ...current, done: current.done + 1 }));
    }

    if (uploaded.length) {
      mutateBoard(`batch-upload:${activeSlide.id}`, (next) => {
        const slide = findSlide(next, activeSlide.id);
        if (!slide) return false;
        uploaded.forEach((result) => {
          const item = slide.items.find((value) => value.id === result.itemId);
          if (item && isBoardImageItem(item)) {
            item.asset = result.storedName;
            item.originalFileName = result.originalFileName;
          }
        });
        return true;
      });
      setSelectedItemId(uploaded.at(-1)?.itemId ?? null);
    }

    setTemporaryPreviews((current) => {
      const next = { ...current };
      entries.forEach((entry) => { delete next[previewKey(activeSlide.id, entry.itemId)]; });
      return next;
    });
    batchUploadsRef.current.forEach((entry) => URL.revokeObjectURL(entry.objectUrl));
    batchUploadsRef.current = [];
    setBatchUploads([]);
    setBatchUploading(false);
    setSaveState(failures.length ? "error" : "saved");
    setError(failures.length ? `${failures.length}장 저장 실패: ${failures.join(", ")}` : "");
  };

  const showHeroSlide = useCallback((nextIndex: number) => {
    const count = activeHeroSlideIds.length;
    if (!count) return;
    const normalized = (nextIndex + count) % count;
    setHeroEditorIndex(normalized);
    iframeRef.current?.contentWindow?.postMessage({
      type: "content-board:hero-navigate",
      index: normalized,
    }, window.location.origin);
  }, [activeHeroSlideIds.length]);

  const addHeroSlide = () => {
    if (!activeSlide || activeSlide.id !== "home-hero") return;
    const ids = heroSlideIds(activeSlide);
    if (ids.length >= 6) {
      setSaveState("error");
      setError("히어로 슬라이드는 최대 6장까지 추가할 수 있습니다.");
      return;
    }
    const sourceIndex = Math.min(heroEditorIndex, Math.max(0, ids.length - 1));
    const sourceId = ids[sourceIndex];
    if (!sourceId) return;
    const nextId = `hero-slide-${Date.now().toString(36)}`;
    const changed = mutateBoard(`hero-add:${nextId}`, (next) => {
      const slide = findSlide(next, "home-hero");
      if (!slide) return false;
      const clonedItems = cloneHeroSlideItems(slide, sourceId, nextId);
      if (!clonedItems.length) return false;
      const sourcePrefix = `home.hero.slides.${sourceId}.`;
      const insertionIndex = slide.items.reduce((last, item, index) => item.id.startsWith(sourcePrefix) ? index + 1 : last, slide.items.length);
      slide.items.splice(insertionIndex, 0, ...clonedItems);
      return true;
    });
    if (!changed) return;
    const nextIndex = sourceIndex + 1;
    setSelectedItemId(`home.hero.slides.${nextId}.title`);
    setHeroEditorIndex(nextIndex);
    void performSave({ kind: "history", board: clone(boardRef.current) });
    window.setTimeout(() => iframeRef.current?.contentWindow?.postMessage({
      type: "content-board:hero-navigate",
      index: nextIndex,
    }, window.location.origin), 120);
  };

  const navigate = (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    setActiveSlideId(slide.id);
    setSelectedItemId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveTextStyle = (item: BoardTextItem, patch: Partial<BoardTextStyle>) => {
    const slideId = slides.find((slide) => slide.items.some((value) => value.id === item.id))?.id;
    if (!slideId) return;
    updateItem(slideId, item.id, { style: { ...item.style, ...patch }, styleTouched: true } as Partial<BoardTextItem>, "text");
  };

  const saveImageTransform = (item: BoardImageItem, next: BoardImageTransform, commit: boolean) => {
    const slideId = slides.find((slide) => slide.items.some((value) => value.id === item.id))?.id;
    if (!slideId) return;
    if (viewMode === "mobile") updateItem(slideId, item.id, { mobile: next } as Partial<BoardImageItem>, "image", commit);
    else updateItem(slideId, item.id, { desktop: next } as Partial<BoardImageItem>, "image", commit);
  };

  const saveElementTransform = (item: BoardItem, next: BoardElementTransform, commit = false) => {
    const slideId = slides.find((slide) => slide.items.some((value) => value.id === item.id))?.id;
    if (!slideId) return;
    const patch = viewMode === "mobile" ? { layoutMobile: next } : { layoutDesktop: next };
    updateItem(slideId, item.id, patch as Partial<BoardItem>, item.type === "text" ? "text" : "image", commit);
  };

  const saveMotion = (item: BoardItem, motion: BoardMotion) => {
    const slideId = slides.find((slide) => slide.items.some((value) => value.id === item.id))?.id;
    if (!slideId) return;
    updateItem(slideId, item.id, { motion } as Partial<BoardItem>, item.type === "text" ? "text" : "image");
  };

  const previewMotion = (itemId?: string) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: "content-board:play-motion",
      itemId: itemId ?? null,
    }, window.location.origin);
  };

  const resetImage = (item: BoardImageItem) => {
    const slideId = slides.find((slide) => slide.items.some((value) => value.id === item.id))?.id;
    if (!slideId) return;
    const effects = { ...item.effects, opacity: 100, overlayOpacity: 0, gradientEnabled: false };
    const changed = mutateBoard(`item:${slideId}:${item.id}`, (next) => {
      const slide = findSlide(next, slideId);
      const found = slide?.items.find((value) => value.id === item.id);
      if (found && isBoardImageItem(found)) {
        found.desktop = { x: 50, y: 50, zoom: 100 };
        delete found.mobile;
        found.effects = effects;
        return true;
      }
      return false;
    });
    if (!changed) return;
    queueSave(`${slideId}:${item.id}`, {
      kind: "image",
      slideId,
      itemId: item.id,
      patch: { desktop: { x: 50, y: 50, zoom: 100 }, mobile: null, effects },
    }, 0);
  };

  const sendPreview = useCallback(() => {
    if (!activeSlide || canvasMode !== "design") return;
    const items = previewItems.map((item) => {
      if (!isBoardImageItem(item)) return item;
      const ownerSlideId = previewItemSlideIds.get(item.id) ?? activeSlide.id;
      const previewSrc = temporaryPreviews[previewKey(ownerSlideId, item.id)];
      return previewSrc ? { ...item, previewSrc } : item;
    });
    iframeRef.current?.contentWindow?.postMessage({
      type: "content-board:sync",
      slideId: activeSlide.id,
      items,
      itemScopes: previewSlides.map((slide) => ({ slideId: slide.id, itemIds: slide.items.map((item) => item.id) })),
      viewMode,
      selectedItemId,
      interactionMode,
    }, window.location.origin);
  }, [activeSlide, canvasMode, interactionMode, previewItemSlideIds, previewItems, previewSlides, selectedItemId, temporaryPreviews, viewMode]);

  useEffect(() => {
    sendPreview();
  }, [sendPreview]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<Record<string, unknown>>) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow || !activeSlide) return;
      if (event.data.type === "content-board:history") {
        if (event.data.direction === "redo") redo();
        else undo();
        return;
      }
      if (event.data.type === "content-board:hero-state" && typeof event.data.index === "number") {
        setHeroEditorIndex(Math.max(0, Math.round(event.data.index)));
        return;
      }
      const id = typeof event.data.id === "string" ? event.data.id : "";
      const item = previewItems.find((value) => value.id === id);
      const ownerSlideId = previewItemSlideIds.get(id);
      if (event.data.type === "content-board:ready") {
        sendPreview();
      } else if (event.data.type === "content-board:error" && typeof event.data.message === "string") {
        setSaveState("error");
        setError(event.data.message);
      } else if (event.data.type === "content-board:select" && item && ownerSlideId) {
        const ownerSlide = slides.find((slide) => slide.id === ownerSlideId);
        if (ownerSlide && previewPath(ownerSlide) === previewPath(activeSlide)) setActiveSlideId(ownerSlideId);
        setSelectedItemId(id);
      } else if (event.data.type === "content-board:text" && ownerSlideId && item?.type === "text" && typeof event.data.value === "string") {
        updateItem(ownerSlideId, id, { value: event.data.value } as Partial<BoardTextItem>, "text", true);
      } else if (event.data.type === "content-board:image-drop" && ownerSlideId && item && isBoardImageItem(item) && event.data.file instanceof File) {
        setSelectedItemId(id);
        requestUpload(ownerSlideId, item, event.data.file);
      } else if (event.data.type === "content-board:image-transform" && ownerSlideId && item && isBoardImageItem(item) && event.data.value && typeof event.data.value === "object") {
        const value = event.data.value as BoardImageTransform;
        const mode = event.data.viewMode === "mobile" ? "mobile" : "desktop";
        if (mode === "mobile") updateItem(ownerSlideId, id, { mobile: value } as Partial<BoardImageItem>, "image", true);
        else updateItem(ownerSlideId, id, { desktop: value } as Partial<BoardImageItem>, "image", true);
      } else if (event.data.type === "content-board:layout-transform" && ownerSlideId && item && event.data.value && typeof event.data.value === "object") {
        const value = event.data.value as BoardElementTransform;
        const mode = event.data.viewMode === "mobile" ? "mobile" : "desktop";
        const patch = mode === "mobile" ? { layoutMobile: value } : { layoutDesktop: value };
        updateItem(ownerSlideId, id, patch as Partial<BoardItem>, item.type === "text" ? "text" : "image", true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [activeSlide, previewItemSlideIds, previewItems, redo, sendPreview, slides, undo, updateItem]);

  if (!activeSlide) return <main className={styles.empty}>편집할 슬라이드가 없습니다.</main>;

  return (
    <main className={`${styles.boardShell} ${focusPreview ? styles.focusMode : ""}`}>
      <header className={styles.topbar}>
        <div className={styles.brand}><span>G</span><div><b>CONTENT BOARD</b><small>글로리의원 콘텐츠 편집 슬라이드</small></div></div>
        <div className={styles.topProgress}><span>{completed} / {slides.length} 완료</span><div><i style={{ width: `${slides.length ? completed / slides.length * 100 : 0}%` }} /></div></div>
        <nav><a href="/" target="_blank" rel="noreferrer">홈페이지 보기 ↗</a><a href="/?edit=1" target="_blank" rel="noreferrer">기존 편집툴 ↗</a></nav>
        <div className={`${styles.saveState} ${saveState === "error" ? styles.saveError : ""}`} role="status">
          <i />{saveState === "saving" ? "저장 중" : saveState === "error" ? `저장 실패 · ${error}` : "자동 저장됨"}
        </div>
      </header>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}><span>PAGE / SECTION</span><b>편집할 슬라이드</b></div>
        {board.pages.map((page) => (
          <section key={page.id}>
            <h2>{page.title}<small>{page.slides.filter((slide) => slide.status === "작성 완료").length}/{page.slides.length}</small></h2>
            {page.slides.map((slide) => (
              <button
                type="button"
                key={slide.id}
                className={slide.id === activeSlide.id ? styles.activeSlide : ""}
                onClick={() => { setActiveSlideId(slide.id); setSelectedItemId(null); }}
              >
                <i data-status={slide.status} />
                <span>{slide.title}<small>{slide.items.length}개 항목</small></span>
                <b>›</b>
              </button>
            ))}
          </section>
        ))}
      </aside>

      <section className={styles.workspace}>
        <div className={styles.slideHeading}>
          <div><span>{activeSlide.pageTitle} · {String(activeIndex + 1).padStart(2, "0")}</span><h1>{activeSlide.title}</h1><p>{activeSlide.description}</p></div>
          <div className={styles.headingActions}>
            <div className={styles.historyActions} aria-label="편집 기록">
              <button type="button" onClick={undo} disabled={!historyAvailability.undo} title="되돌리기 · ⌘Z" aria-label="되돌리기, Command Z">↶</button>
              <button type="button" onClick={redo} disabled={!historyAvailability.redo} title="다시 실행 · ⌘⇧Z" aria-label="다시 실행, Command Shift Z">↷</button>
            </div>
            {activeImageItems.length > 1 ? <>
              <button type="button" className={styles.batchUploadButton} onClick={() => batchFileInput.current?.click()}>＋ 사진 여러 장 넣기</button>
              <input
                ref={batchFileInput}
                className={styles.fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                multiple
                tabIndex={-1}
                onChange={(event) => {
                  openBatchUpload(Array.from(event.currentTarget.files ?? []));
                  event.currentTarget.value = "";
                }}
              />
            </> : null}
            <div className={styles.canvasSwitch}><button type="button" className={canvasMode === "design" ? styles.active : ""} onClick={() => setCanvasMode("design")}>실제 디자인</button><button type="button" className={canvasMode === "items" ? styles.active : ""} onClick={() => setCanvasMode("items")}>항목 목록</button></div>
            {canvasMode === "design" ? <div className={styles.interactionSwitch} aria-label="디자인 조작 방식"><button type="button" className={interactionMode === "edit" ? styles.active : ""} onClick={() => setInteractionMode("edit")}>내용 편집</button><button type="button" className={interactionMode === "move" ? styles.active : ""} onClick={() => setInteractionMode("move")}>위치 이동</button></div> : null}
            <div className={styles.viewSwitch}><button type="button" className={viewMode === "desktop" ? styles.active : ""} onClick={() => setViewMode("desktop")}>PC</button><button type="button" className={viewMode === "mobile" ? styles.active : ""} onClick={() => setViewMode("mobile")}>모바일</button></div>
            {canvasMode === "design" ? <button type="button" className={styles.motionAllButton} onClick={() => previewMotion()}>▶ 전체 모션</button> : null}
            {canvasMode === "design" ? <button type="button" className={styles.focusButton} onClick={() => setFocusPreview((value) => !value)}>{focusPreview ? "패널 보기" : "크게 보기"}</button> : null}
            <select value={activeSlide.status} onChange={(event) => updateSlide(activeSlide.id, { status: event.target.value as BoardStatus }, true)} aria-label="슬라이드 상태">
              <option>작성 중</option><option>확인 필요</option><option>작성 완료</option>
            </select>
          </div>
        </div>

        {canvasMode === "design" && activeSlide.id === "home-hero" ? <div className={styles.heroSlideToolbar}>
          <b>히어로 슬라이드</b>
          <button type="button" onClick={() => showHeroSlide(heroEditorIndex - 1)} aria-label="이전 히어로 슬라이드">‹</button>
          <span>{String(Math.min(heroEditorIndex + 1, activeHeroSlideIds.length)).padStart(2, "0")} / {String(activeHeroSlideIds.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => showHeroSlide(heroEditorIndex + 1)} aria-label="다음 히어로 슬라이드">›</button>
          <button type="button" className={styles.heroAddButton} onClick={addHeroSlide} disabled={activeHeroSlideIds.length >= 6}>＋ 현재 슬라이드 복제</button>
          <small>사진·문구·효과를 그대로 복사해 바로 뒤에 추가합니다.</small>
        </div> : null}

        {canvasMode === "design" ? (
          <DesignPreview slide={activeSlide} viewMode={viewMode} iframeRef={iframeRef} onLoad={sendPreview} />
        ) : (
          <div className={`${styles.stageWrap} ${viewMode === "mobile" ? styles.mobileStage : ""}`}>
            <div className={styles.stage}>
              <div className={styles.stageMeta}><span>{activeSlide.pageTitle.toUpperCase()}</span><b>{activeSlide.title}</b><small>글자는 직접 클릭 · 사진은 파인더에서 드래그 · 세부 배치는 오른쪽 패널</small></div>
              <div className={styles.itemsGrid}>
                {activeSlide.items.map((item) => isBoardImageItem(item) ? (
                  <ImageCanvasItem
                    key={item.id}
                    item={item}
                    selected={selectedItemId === item.id}
                    mode={viewMode}
                    temporary={temporaryPreviews[previewKey(activeSlide.id, item.id)]}
                    onSelect={() => setSelectedItemId(item.id)}
                    onDropFile={(file) => requestUpload(activeSlide.id, item, file)}
                    onTransform={(next, commit) => saveImageTransform(item, next, commit)}
                  />
                ) : (
                  <TextCanvasItem
                    key={item.id}
                    item={item}
                    selected={selectedItemId === item.id}
                    onSelect={() => setSelectedItemId(item.id)}
                    onChange={(value) => updateItem(activeSlide.id, item.id, { value } as Partial<BoardTextItem>, "text", true)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.slideFooter}>
          <button type="button" onClick={() => navigate(activeIndex - 1)} disabled={activeIndex <= 0}>← 이전 섹션</button>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => navigate(activeIndex + 1)} disabled={activeIndex >= slides.length - 1}>다음 섹션 →</button>
        </div>
      </section>

      <aside className={styles.inspector}>
        {selectedItem?.type === "text" ? (() => {
          const item = selectedItem as BoardTextItem;
          return <>
            <div className={styles.inspectorHeader}><span>TEXT</span><b>{item.label}</b><small>{item.id}</small></div>
            <label className={styles.contentField}>내용<textarea value={item.value} rows={Math.min(8, Math.max(3, item.value.split("\n").length + 1))} onChange={(event) => updateItem(selectedSlideId, item.id, { value: event.target.value } as Partial<BoardTextItem>, "text")} onBlur={(event) => updateItem(selectedSlideId, item.id, { value: event.target.value } as Partial<BoardTextItem>, "text", true)} /></label>
            <fieldset><legend>글꼴</legend><select value={item.style.fontFamily} onChange={(event) => saveTextStyle(item, { fontFamily: event.target.value })}>{BOARD_FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select></fieldset>
            <div className={styles.controlGrid}>
              <label>크기<input type="number" min="10" max="120" value={item.style.fontSize} onChange={(event) => saveTextStyle(item, { fontSize: Number(event.target.value) })} /></label>
              <label>굵기<select value={item.style.fontWeight} onChange={(event) => saveTextStyle(item, { fontWeight: Number(event.target.value) })}><option value="300">Light</option><option value="400">Regular</option><option value="500">Medium</option><option value="700">Bold</option><option value="900">Black</option></select></label>
              <label>행간<input type="number" min="0.8" max="2.5" step="0.05" value={item.style.lineHeight} onChange={(event) => saveTextStyle(item, { lineHeight: Number(event.target.value) })} /></label>
              <label>자간<input type="number" min="-5" max="20" step="0.1" value={item.style.letterSpacing} onChange={(event) => saveTextStyle(item, { letterSpacing: Number(event.target.value) })} /></label>
            </div>
            <label className={styles.rangeLabel}>글자 투명도 <input type="range" min="0" max="100" value={item.style.opacity} onChange={(event) => saveTextStyle(item, { opacity: Number(event.target.value) })} /><output>{item.style.opacity}%</output></label>
            <fieldset><legend>글자색</legend><div className={styles.colorControl}><input type="color" value={item.style.color} onChange={(event) => saveTextStyle(item, { color: event.target.value })} /><code>{item.style.color}</code></div></fieldset>
            <fieldset><legend>정렬</legend><div className={styles.segmented}>{(["left", "center", "right"] as const).map((align) => <button type="button" key={align} className={item.style.textAlign === align ? styles.active : ""} onClick={() => saveTextStyle(item, { textAlign: align })}>{align === "left" ? "왼쪽" : align === "center" ? "가운데" : "오른쪽"}</button>)}</div></fieldset>
            <LayoutControls item={item} viewMode={viewMode} onViewMode={setViewMode} onLayout={(value, commit) => saveElementTransform(item, value, commit)} />
            <MotionControls item={item} onMotion={(value) => saveMotion(item, value)} onPreview={() => previewMotion(item.id)} />
            <label className={styles.noteField}>개발 메모<textarea value={item.note} placeholder="이 글자에 대한 요청을 적으세요" onChange={(event) => updateItem(selectedSlideId, item.id, { note: event.target.value } as Partial<BoardTextItem>, "text")} onBlur={(event) => updateItem(selectedSlideId, item.id, { note: event.target.value } as Partial<BoardTextItem>, "text", true)} /></label>
            <p className={styles.inspectorHelp}>글자를 클릭하면 바로 입력할 수 있습니다. 선택 테두리 위의 ‘이동’을 끌거나 방향키로 1px·Shift+방향키로 10px씩 움직입니다.</p>
          </>;
        })() : selectedItem && isBoardImageItem(selectedItem) ? (() => {
          const item = selectedItem;
          const value = transformFor(item, viewMode);
          const updateEffects = (patch: Partial<BoardImageItem["effects"]>) => updateItem(selectedSlideId, item.id, { effects: patch } as Partial<BoardImageItem>, "image");
          return <>
            <div className={styles.inspectorHeader}><span>IMAGE</span><b>{item.label}</b><small>{item.id}</small></div>
            <fieldset><legend>크롭·위치</legend>
              <label>비율<select value={item.effects.cropAspect} onChange={(event) => updateEffects({ cropAspect: event.target.value as BoardImageItem["effects"]["cropAspect"] })}><option value="free">자유</option><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="3:4">3:4</option></select></label>
              <label className={styles.rangeLabel}>확대 <input type="range" min="100" max="300" value={value.zoom} onChange={(event) => saveImageTransform(item, { ...value, zoom: Number(event.target.value) }, false)} onPointerUp={(event) => saveImageTransform(item, { ...value, zoom: Number(event.currentTarget.value) }, true)} /><output>{Math.round(value.zoom)}%</output></label>
              <div className={styles.segmented}><button type="button" onClick={() => saveImageTransform(item, { ...value, zoom: clamp(value.zoom - 10, 100, 300) }, true)}>−</button><button type="button" onClick={() => saveImageTransform(item, { ...value, x: 50, y: 50 }, true)}>가운데</button><button type="button" onClick={() => saveImageTransform(item, { ...value, zoom: clamp(value.zoom + 10, 100, 300) }, true)}>＋</button></div>
            </fieldset>
            <fieldset><legend>사진 효과</legend>
              <label className={styles.rangeLabel}>투명도 <input type="range" min="0" max="100" value={item.effects.opacity} onChange={(event) => updateEffects({ opacity: Number(event.target.value) })} /><output>{item.effects.opacity}%</output></label>
              <label>컬러 오버레이<div className={styles.colorControl}><input type="color" value={item.effects.overlayColor} onChange={(event) => updateEffects({ overlayColor: event.target.value })} /><code>{item.effects.overlayColor}</code></div></label>
              <label className={styles.rangeLabel}>컬러 농도 <input type="range" min="0" max="100" value={item.effects.overlayOpacity} onChange={(event) => updateEffects({ overlayOpacity: Number(event.target.value) })} /><output>{item.effects.overlayOpacity}%</output></label>
            </fieldset>
            <fieldset><legend>그라데이션</legend>
              <label className={styles.checkLabel}><input type="checkbox" checked={item.effects.gradientEnabled} onChange={(event) => updateEffects({ gradientEnabled: event.target.checked })} /> 사용</label>
              <label>방향<select value={item.effects.gradientDirection} onChange={(event) => updateEffects({ gradientDirection: event.target.value as BoardImageItem["effects"]["gradientDirection"] })}><option value="to right">왼쪽 → 오른쪽</option><option value="to left">오른쪽 → 왼쪽</option><option value="to bottom">위 → 아래</option><option value="to top">아래 → 위</option></select></label>
              <div className={styles.colorControl}><input type="color" value={item.effects.gradientColor} onChange={(event) => updateEffects({ gradientColor: event.target.value })} /><code>{item.effects.gradientColor}</code></div>
              <label className={styles.rangeLabel}>농도 <input type="range" min="0" max="100" value={item.effects.gradientOpacity} onChange={(event) => updateEffects({ gradientOpacity: Number(event.target.value) })} /><output>{item.effects.gradientOpacity}%</output></label>
            </fieldset>
            <LayoutControls item={item} viewMode={viewMode} onViewMode={setViewMode} onLayout={(value, commit) => saveElementTransform(item, value, commit)} />
            <MotionControls item={item} onMotion={(value) => saveMotion(item, value)} onPreview={() => previewMotion(item.id)} />
            <label>사진 설명(alt)<input value={item.alt} placeholder="설명 필요" onChange={(event) => updateItem(selectedSlideId, item.id, { alt: event.target.value } as Partial<BoardImageItem>, "image")} /></label>
            {!item.alt ? <p className={styles.altWarning}>사진 설명이 비어 있습니다. 검색·접근성을 위해 입력해 주세요.</p> : null}
            <label className={styles.noteField}>개발 메모<textarea value={item.note} placeholder="사진 처리 요청을 적으세요" onChange={(event) => updateItem(selectedSlideId, item.id, { note: event.target.value } as Partial<BoardImageItem>, "image")} onBlur={(event) => updateItem(selectedSlideId, item.id, { note: event.target.value } as Partial<BoardImageItem>, "image", true)} /></label>
            <div className={styles.inspectorButtons}><button type="button" onClick={() => resetImage(item)}>효과 초기화</button><button type="button" className={styles.danger} onClick={() => updateItem(selectedSlideId, item.id, { asset: null, originalFileName: null } as Partial<BoardImageItem>, "image", true)}>새 사진 지우기</button></div>
          </>;
        })() : <>
          <div className={styles.inspectorHeader}><span>SECTION</span><b>{activeSlide.title}</b><small>{activeSlide.id}</small></div>
          <label>진행 상태<select value={activeSlide.status} onChange={(event) => updateSlide(activeSlide.id, { status: event.target.value as BoardStatus }, true)}><option>작성 중</option><option>확인 필요</option><option>작성 완료</option></select></label>
          <label className={styles.noteField}>섹션 전체 메모<textarea value={activeSlide.note} placeholder="이 섹션 전체에 대한 개발 요청을 적으세요" onChange={(event) => updateSlide(activeSlide.id, { note: event.target.value })} onBlur={(event) => updateSlide(activeSlide.id, { note: event.target.value }, true)} /></label>
          <div className={styles.guideBox}><b>사용 방법</b><ol><li>내용 편집에서 글자를 한 번 클릭해 바로 수정</li><li>파인더 사진을 원하는 점선 박스에 드래그</li><li>위치 이동에서 모든 항목을 직접 움직임(스마트 가이드 자동 정렬)</li><li>오른쪽에서 배치·크기·회전·레이어·모션 조정</li><li>완료되면 상태를 ‘작성 완료’로 변경</li></ol></div>
        </>}
      </aside>

      {batchUploads.length ? <div className={styles.batchLayer} role="dialog" aria-modal="true" aria-label="사진 여러 장 배치">
        <section className={styles.batchDialog}>
          <header>
            <div><span>BATCH IMAGE PLACEMENT</span><h2>{activeSlide.title} 사진 여러 장 넣기</h2><p>파일 순서대로 빈 사진 자리에 먼저 배치했습니다. 아래에서 자리만 확인하거나 바꾼 뒤 한 번에 저장하세요.</p></div>
            <b>{batchUploads.filter((entry) => entry.itemId).length} / {batchUploads.length}장 배치</b>
          </header>
          <div className={styles.batchList}>
            {batchUploads.map((entry, index) => {
              const assigned = activeImageItems.find((item) => item.id === entry.itemId);
              const occupied = Boolean(assigned?.asset || assigned?.sourceSrc);
              return <article key={entry.id}>
                <img src={entry.objectUrl} alt="" />
                <div><b>{entry.file.name}</b><small>{Math.max(.1, entry.file.size / 1024 / 1024).toFixed(1)}MB</small></div>
                <span aria-hidden="true">→</span>
                <label>
                  <span>배치할 자리</span>
                  <select
                    value={entry.itemId}
                    disabled={batchUploading}
                    onChange={(event) => setBatchUploads((current) => current.map((value, row) => row === index ? { ...value, itemId: event.target.value } : value))}
                  >
                    <option value="">배치하지 않음</option>
                    {activeImageItems.map((item) => {
                      const usedElsewhere = batchUploads.some((value, row) => row !== index && value.itemId === item.id);
                      const hasImage = Boolean(item.asset || item.sourceSrc);
                      return <option key={item.id} value={item.id} disabled={usedElsewhere}>{item.label}{hasImage ? " · 기존 사진 교체" : " · 빈 자리"}</option>;
                    })}
                  </select>
                  {entry.itemId ? <small data-occupied={occupied ? "true" : undefined}>{occupied ? "기존 사진을 교체합니다" : "빈 자리에 추가됩니다"}</small> : <small>이 파일은 업로드하지 않습니다</small>}
                </label>
              </article>;
            })}
          </div>
          <footer>
            <p>{batchUploading ? `${batchProgress.done} / ${batchProgress.total}장 저장 중` : "저장 후 각 사진을 클릭해 위치·확대만 조정하면 됩니다."}</p>
            <div><button type="button" onClick={closeBatchUpload} disabled={batchUploading}>취소</button><button type="button" onClick={() => void uploadBatchImages()} disabled={batchUploading || !batchUploads.some((entry) => entry.itemId)}>{batchUploading ? "저장 중…" : `${batchUploads.filter((entry) => entry.itemId).length}장 한 번에 배치`}</button></div>
          </footer>
        </section>
      </div> : null}

      {pendingUpload ? <div className={styles.confirmLayer} role="dialog" aria-modal="true" aria-label="사진 교체 확인">
        <section><span>REPLACE IMAGE</span><h2>이 사진으로 교체할까요?</h2><img className={styles.confirmPreview} src={pendingUpload.objectUrl} alt="새로 놓은 사진 미리보기" /><p><b>{pendingUpload.item.label}</b><br />{pendingUpload.file.name}</p><div><button type="button" onClick={() => { URL.revokeObjectURL(pendingUpload.objectUrl); setUploadDraft(null); }}>취소</button><button type="button" onClick={() => void uploadImage(pendingUpload)}>교체하기</button></div></section>
      </div> : null}
    </main>
  );
}
