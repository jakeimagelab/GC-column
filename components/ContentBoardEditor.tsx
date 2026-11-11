"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import {
  BOARD_FONT_OPTIONS,
  isBoardImageItem,
  type BoardImageItem,
  type BoardImageTransform,
  type BoardItem,
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
type CanvasMode = "design" | "items";

const clone = <T,>(value: T): T => structuredClone(value);
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

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
    if (node.tagName === "STRONG" || node.tagName === "B") return `**${children}**`;
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

function findSlide(board: ContentBoard, slideId: string) {
  return board.pages.flatMap((page) => page.slides).find((slide) => slide.id === slideId);
}

function previewPath(slide: BoardSlide) {
  if (slide.pageId === "column") return "/column";
  if (slide.pageId === "doctor") return "/doctor/lee-ho";
  if (slide.pageId === "detail") return "/column/xerf-vs-thermage";
  return "/";
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
    if (!imageUrl) return;
    event.preventDefault();
    onSelect();
    onTransform({ ...value, zoom: clamp(value.zoom + (event.deltaY < 0 ? 5 : -5), 100, 300) }, true);
  };

  return (
    <article className={`${styles.imageItem} ${selected ? styles.selectedItem : ""}`} onClick={onSelect}>
      <header><span>{item.label}</span><small>{item.type === "bgImage" ? "배경" : "사진"}</small></header>
      <div
        className={styles.imageViewport}
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
          if (!imageUrl || event.button !== 0) return;
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
        {imageUrl ? <div className={styles.imageHint}>드래그 이동 · 휠 확대</div> : null}
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
      <div className={styles.previewGuide}><b>실제 홈페이지 디자인</b><span>글자 클릭 · 사진 드롭 · 사진 드래그/휠</span><em>{Math.round(scale * 100)}%</em></div>
      <iframe
        ref={iframeRef}
        key={`${slide.id}-${viewMode}`}
        title={`${slide.pageTitle} ${slide.title} 실제 디자인 편집 화면`}
        src={`${previewPath(slide)}?content-board-preview=1`}
        style={{ width, height, transform: `translateX(-50%) scale(${scale})` }}
        onLoad={onLoad}
      />
    </div>
  );
}

export function ContentBoardEditor({ initialBoard }: Props) {
  const [board, setBoard] = useState(() => clone(initialBoard));
  const firstSlide = initialBoard.pages[0]?.slides[0]?.id ?? "";
  const [activeSlideId, setActiveSlideId] = useState(firstSlide);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<BoardViewMode>("desktop");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("design");
  const [focusPreview, setFocusPreview] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [temporaryPreviews, setTemporaryPreviews] = useState<Record<string, string>>({});
  const temporaryPreviewsRef = useRef<Record<string, string>>({});
  const timers = useRef(new Map<string, number>());
  const pendingPayloads = useRef(new Map<string, Record<string, unknown>>());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const savingCount = useRef(0);

  const slides = useMemo(() => board.pages.flatMap((page) => page.slides), [board.pages]);
  const activeSlide = findSlide(board, activeSlideId) ?? slides[0];
  const activeIndex = slides.findIndex((slide) => slide.id === activeSlide?.id);
  const selectedItem = activeSlide?.items.find((item) => item.id === selectedItemId);
  const completed = slides.filter((slide) => slide.status === "작성 완료").length;

  useEffect(() => {
    temporaryPreviewsRef.current = temporaryPreviews;
  }, [temporaryPreviews]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    Object.values(temporaryPreviewsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

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

  const updateItem = useCallback((slideId: string, itemId: string, patch: Partial<BoardItem>, saveKind: "text" | "image", immediate = false) => {
    setBoard((current) => {
      const next = clone(current);
      const slide = findSlide(next, slideId);
      if (!slide) return current;
      const index = slide.items.findIndex((item) => item.id === itemId);
      if (index < 0) return current;
      const existing = slide.items[index];
      const merged = { ...existing, ...patch } as BoardItem;
      if (existing.type === "text" && "style" in patch && patch.style) {
        (merged as BoardTextItem).style = { ...existing.style, ...patch.style };
      }
      if (isBoardImageItem(existing) && "effects" in patch && patch.effects) {
        (merged as BoardImageItem).effects = { ...existing.effects, ...patch.effects };
      }
      slide.items[index] = merged;
      return next;
    });
    queueSave(`${slideId}:${itemId}`, { kind: saveKind, slideId, itemId, patch }, immediate ? 0 : 260);
  }, [queueSave]);

  const updateSlide = (slideId: string, patch: Partial<Pick<BoardSlide, "status" | "note">>, immediate = false) => {
    setBoard((current) => {
      const next = clone(current);
      const slide = findSlide(next, slideId);
      if (slide) Object.assign(slide, patch);
      return next;
    });
    queueSave(`slide:${slideId}`, { kind: "slide", slideId, patch }, immediate ? 0 : 260);
  };

  const uploadImage = async (draft: PendingUpload) => {
    setPendingUpload(null);
    setSaveState("saving");
    setTemporaryPreviews((current) => ({ ...current, [draft.item.id]: draft.objectUrl }));
    const form = new FormData();
    form.set("slideId", draft.slideId);
    form.set("itemId", draft.item.id);
    form.set("file", draft.file);
    try {
      const response = await fetch("/api/dev-content-board", { method: "POST", body: form });
      const result = await response.json() as { storedName?: string; error?: string };
      if (!response.ok || !result.storedName) throw new Error(result.error || "사진을 저장하지 못했습니다.");
      setBoard((current) => {
        const next = clone(current);
        const slide = findSlide(next, draft.slideId);
        const item = slide?.items.find((value) => value.id === draft.item.id);
        if (item && isBoardImageItem(item)) {
          item.asset = result.storedName!;
          item.originalFileName = draft.file.name;
        }
        return next;
      });
      URL.revokeObjectURL(draft.objectUrl);
      setTemporaryPreviews((current) => {
        const next = { ...current };
        delete next[draft.item.id];
        return next;
      });
      setSaveState("saved");
    } catch (uploadError) {
      URL.revokeObjectURL(draft.objectUrl);
      setTemporaryPreviews((current) => {
        const next = { ...current };
        delete next[draft.item.id];
        return next;
      });
      setSaveState("error");
      setError(uploadError instanceof Error ? uploadError.message : "사진을 저장하지 못했습니다.");
    }
  };

  const requestUpload = (slideId: string, item: BoardImageItem, file: File) => {
    if (!new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]).has(file.type)) {
      setSaveState("error");
      setError("JPG, PNG, WebP, SVG 이미지만 넣을 수 있습니다.");
      return;
    }
    const draft = { slideId, item, file, objectUrl: URL.createObjectURL(file) };
    if (item.asset || item.sourceSrc) setPendingUpload(draft);
    else void uploadImage(draft);
  };

  const navigate = (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    setActiveSlideId(slide.id);
    setSelectedItemId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveTextStyle = (item: BoardTextItem, patch: Partial<BoardTextStyle>) => {
    updateItem(activeSlide!.id, item.id, { style: { ...item.style, ...patch }, styleTouched: true } as Partial<BoardTextItem>, "text");
  };

  const saveImageTransform = (item: BoardImageItem, next: BoardImageTransform, commit: boolean) => {
    if (viewMode === "mobile") updateItem(activeSlide!.id, item.id, { mobile: next } as Partial<BoardImageItem>, "image", commit);
    else updateItem(activeSlide!.id, item.id, { desktop: next } as Partial<BoardImageItem>, "image", commit);
  };

  const resetImage = (item: BoardImageItem) => {
    const effects = { ...item.effects, opacity: 100, overlayOpacity: 0, gradientEnabled: false };
    setBoard((current) => {
      const next = clone(current);
      const slide = findSlide(next, activeSlide!.id);
      const found = slide?.items.find((value) => value.id === item.id);
      if (found && isBoardImageItem(found)) {
        found.desktop = { x: 50, y: 50, zoom: 100 };
        delete found.mobile;
        found.effects = effects;
      }
      return next;
    });
    queueSave(`${activeSlide!.id}:${item.id}`, {
      kind: "image",
      slideId: activeSlide!.id,
      itemId: item.id,
      patch: { desktop: { x: 50, y: 50, zoom: 100 }, mobile: null, effects },
    }, 0);
  };

  const sendPreview = useCallback(() => {
    if (!activeSlide || canvasMode !== "design") return;
    iframeRef.current?.contentWindow?.postMessage({
      type: "content-board:sync",
      slideId: activeSlide.id,
      items: activeSlide.items,
      viewMode,
    }, window.location.origin);
  }, [activeSlide, canvasMode, viewMode]);

  useEffect(() => {
    sendPreview();
  }, [sendPreview]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<Record<string, unknown>>) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow || !activeSlide) return;
      const id = typeof event.data.id === "string" ? event.data.id : "";
      const item = activeSlide.items.find((value) => value.id === id);
      if (event.data.type === "content-board:ready") {
        sendPreview();
      } else if (event.data.type === "content-board:select" && item) {
        setSelectedItemId(id);
      } else if (event.data.type === "content-board:text" && item?.type === "text" && typeof event.data.value === "string") {
        updateItem(activeSlide.id, id, { value: event.data.value } as Partial<BoardTextItem>, "text", true);
      } else if (event.data.type === "content-board:image-drop" && item && isBoardImageItem(item) && event.data.file instanceof File) {
        setSelectedItemId(id);
        requestUpload(activeSlide.id, item, event.data.file);
      } else if (event.data.type === "content-board:image-transform" && item && isBoardImageItem(item) && event.data.value && typeof event.data.value === "object") {
        const value = event.data.value as BoardImageTransform;
        const mode = event.data.viewMode === "mobile" ? "mobile" : "desktop";
        if (mode === "mobile") updateItem(activeSlide.id, id, { mobile: value } as Partial<BoardImageItem>, "image", true);
        else updateItem(activeSlide.id, id, { desktop: value } as Partial<BoardImageItem>, "image", true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [activeSlide, sendPreview, updateItem]);

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
            <div className={styles.canvasSwitch}><button type="button" className={canvasMode === "design" ? styles.active : ""} onClick={() => setCanvasMode("design")}>실제 디자인</button><button type="button" className={canvasMode === "items" ? styles.active : ""} onClick={() => setCanvasMode("items")}>항목 목록</button></div>
            <div className={styles.viewSwitch}><button type="button" className={viewMode === "desktop" ? styles.active : ""} onClick={() => setViewMode("desktop")}>PC</button><button type="button" className={viewMode === "mobile" ? styles.active : ""} onClick={() => setViewMode("mobile")}>모바일</button></div>
            {canvasMode === "design" ? <button type="button" className={styles.focusButton} onClick={() => setFocusPreview((value) => !value)}>{focusPreview ? "패널 보기" : "크게 보기"}</button> : null}
            <select value={activeSlide.status} onChange={(event) => updateSlide(activeSlide.id, { status: event.target.value as BoardStatus }, true)} aria-label="슬라이드 상태">
              <option>작성 중</option><option>확인 필요</option><option>작성 완료</option>
            </select>
          </div>
        </div>

        {canvasMode === "design" ? (
          <DesignPreview slide={activeSlide} viewMode={viewMode} iframeRef={iframeRef} onLoad={sendPreview} />
        ) : (
          <div className={`${styles.stageWrap} ${viewMode === "mobile" ? styles.mobileStage : ""}`}>
            <div className={styles.stage}>
              <div className={styles.stageMeta}><span>{activeSlide.pageTitle.toUpperCase()}</span><b>{activeSlide.title}</b><small>글자는 직접 클릭 · 사진은 파인더에서 드래그</small></div>
              <div className={styles.itemsGrid}>
                {activeSlide.items.map((item) => isBoardImageItem(item) ? (
                  <ImageCanvasItem
                    key={item.id}
                    item={item}
                    selected={selectedItemId === item.id}
                    mode={viewMode}
                    temporary={temporaryPreviews[item.id]}
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
            <fieldset><legend>글꼴</legend><select value={item.style.fontFamily} onChange={(event) => saveTextStyle(item, { fontFamily: event.target.value })}>{BOARD_FONT_OPTIONS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select></fieldset>
            <div className={styles.controlGrid}>
              <label>크기<input type="number" min="10" max="120" value={item.style.fontSize} onChange={(event) => saveTextStyle(item, { fontSize: Number(event.target.value) })} /></label>
              <label>굵기<select value={item.style.fontWeight} onChange={(event) => saveTextStyle(item, { fontWeight: Number(event.target.value) })}><option value="300">Light</option><option value="400">Regular</option><option value="500">Medium</option><option value="700">Bold</option><option value="900">Black</option></select></label>
              <label>행간<input type="number" min="0.8" max="2.5" step="0.05" value={item.style.lineHeight} onChange={(event) => saveTextStyle(item, { lineHeight: Number(event.target.value) })} /></label>
              <label>자간<input type="number" min="-5" max="20" step="0.1" value={item.style.letterSpacing} onChange={(event) => saveTextStyle(item, { letterSpacing: Number(event.target.value) })} /></label>
            </div>
            <fieldset><legend>글자색</legend><div className={styles.colorControl}><input type="color" value={item.style.color} onChange={(event) => saveTextStyle(item, { color: event.target.value })} /><code>{item.style.color}</code></div></fieldset>
            <fieldset><legend>정렬</legend><div className={styles.segmented}>{(["left", "center", "right"] as const).map((align) => <button type="button" key={align} className={item.style.textAlign === align ? styles.active : ""} onClick={() => saveTextStyle(item, { textAlign: align })}>{align === "left" ? "왼쪽" : align === "center" ? "가운데" : "오른쪽"}</button>)}</div></fieldset>
            <label className={styles.noteField}>개발 메모<textarea value={item.note} placeholder="이 글자에 대한 요청을 적으세요" onChange={(event) => updateItem(activeSlide.id, item.id, { note: event.target.value } as Partial<BoardTextItem>, "text")} /></label>
            <p className={styles.inspectorHelp}>슬라이드에서 글자를 직접 수정하세요. Enter는 줄바꿈, Cmd+B는 선택 글자 굵게입니다.</p>
          </>;
        })() : selectedItem && isBoardImageItem(selectedItem) ? (() => {
          const item = selectedItem;
          const value = transformFor(item, viewMode);
          const updateEffects = (patch: Partial<BoardImageItem["effects"]>) => updateItem(activeSlide.id, item.id, { effects: patch } as Partial<BoardImageItem>, "image");
          return <>
            <div className={styles.inspectorHeader}><span>IMAGE</span><b>{item.label}</b><small>{item.id}</small></div>
            <div className={styles.inspectorMode}><button type="button" className={viewMode === "desktop" ? styles.active : ""} onClick={() => setViewMode("desktop")}>PC</button><button type="button" className={viewMode === "mobile" ? styles.active : ""} onClick={() => setViewMode("mobile")}>모바일</button></div>
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
            <label>사진 설명(alt)<input value={item.alt} placeholder="설명 필요" onChange={(event) => updateItem(activeSlide.id, item.id, { alt: event.target.value } as Partial<BoardImageItem>, "image")} /></label>
            <label className={styles.noteField}>개발 메모<textarea value={item.note} placeholder="사진 처리 요청을 적으세요" onChange={(event) => updateItem(activeSlide.id, item.id, { note: event.target.value } as Partial<BoardImageItem>, "image")} /></label>
            <div className={styles.inspectorButtons}><button type="button" onClick={() => resetImage(item)}>효과 초기화</button><button type="button" className={styles.danger} onClick={() => updateItem(activeSlide.id, item.id, { asset: null, originalFileName: null } as Partial<BoardImageItem>, "image", true)}>새 사진 지우기</button></div>
          </>;
        })() : <>
          <div className={styles.inspectorHeader}><span>SECTION</span><b>{activeSlide.title}</b><small>{activeSlide.id}</small></div>
          <label>진행 상태<select value={activeSlide.status} onChange={(event) => updateSlide(activeSlide.id, { status: event.target.value as BoardStatus }, true)}><option>작성 중</option><option>확인 필요</option><option>작성 완료</option></select></label>
          <label className={styles.noteField}>섹션 전체 메모<textarea value={activeSlide.note} placeholder="이 섹션 전체에 대한 개발 요청을 적으세요" onChange={(event) => updateSlide(activeSlide.id, { note: event.target.value })} /></label>
          <div className={styles.guideBox}><b>사용 방법</b><ol><li>글자를 클릭해 직접 수정</li><li>파인더 사진을 원하는 칸에 드래그</li><li>선택한 항목을 오른쪽에서 세부 조정</li><li>완료되면 상태를 ‘작성 완료’로 변경</li></ol></div>
        </>}
      </aside>

      {pendingUpload ? <div className={styles.confirmLayer} role="dialog" aria-modal="true" aria-label="사진 교체 확인">
        <section><span>REPLACE IMAGE</span><h2>이 사진으로 교체할까요?</h2><p><b>{pendingUpload.item.label}</b><br />{pendingUpload.file.name}</p><div><button type="button" onClick={() => { URL.revokeObjectURL(pendingUpload.objectUrl); setPendingUpload(null); }}>취소</button><button type="button" onClick={() => void uploadImage(pendingUpload)}>교체하기</button></div></section>
      </div> : null}
    </main>
  );
}
