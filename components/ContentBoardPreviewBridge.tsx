"use client";

import { useEffect, useRef } from "react";
import {
  isBoardImageItem,
  type BoardElementTransform,
  type BoardImageItem,
  type BoardImageTransform,
  type BoardItem,
  type BoardMotion,
  type BoardTextItem,
  type BoardViewMode,
} from "@/lib/contentBoardTypes";

type SyncMessage = {
  type: "content-board:sync";
  slideId: string;
  items: BoardItem[];
  viewMode: BoardViewMode;
  selectedItemId?: string | null;
  interactionMode: "edit" | "move";
};

type PlayMotionMessage = { type: "content-board:play-motion"; itemId?: string | null };

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

function targetSelector(id: string) {
  return `[data-edit-id="${CSS.escape(id)}"]`;
}

function transformFor(item: BoardImageItem, mode: BoardViewMode) {
  return mode === "mobile" ? item.mobile ?? item.desktop : item.desktop;
}

function elementTransformFor(item: BoardItem, mode: BoardViewMode) {
  return mode === "mobile" ? item.layoutMobile ?? item.layoutDesktop : item.layoutDesktop;
}

function withElementTransform(item: BoardItem, mode: BoardViewMode, value: BoardElementTransform): BoardItem {
  return { ...item, ...(mode === "mobile" ? { layoutMobile: value } : { layoutDesktop: value }) } as BoardItem;
}

const easingValue: Record<BoardMotion["easing"], string> = {
  smooth: "cubic-bezier(.22,.61,.36,1)",
  "ease-out": "ease-out",
  spring: "cubic-bezier(.34,1.56,.64,1)",
  linear: "linear",
};

function post(message: Record<string, unknown>) {
  window.parent.postMessage(message, window.location.origin);
}

export function ContentBoardPreviewBridge() {
  const items = useRef(new Map<string, BoardItem>());
  const viewMode = useRef<BoardViewMode>("desktop");
  const interactionMode = useRef<"edit" | "move">("edit");
  const slideId = useRef("");
  const drag = useRef<{ target: HTMLElement; item: BoardImageItem; pointerId: number; startX: number; startY: number; start: BoardImageTransform; latest: BoardImageTransform } | null>(null);
  const layoutDrag = useRef<{ target: HTMLElement; item: BoardItem; pointerId: number; startX: number; startY: number; start: BoardElementTransform; latest: BoardElementTransform } | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (new URLSearchParams(window.location.search).get("content-board-preview") !== "1") return;

    document.body.classList.add("contentBoardCanvas");

    const applyLayout = (target: HTMLElement, item: BoardItem) => {
      const value = elementTransformFor(item, viewMode.current);
      target.style.translate = value.x || value.y ? `${value.x}px ${value.y}px` : "";
      target.style.scale = value.scale !== 100 ? String(value.scale / 100) : "";
      target.style.rotate = value.rotate ? `${value.rotate}deg` : "";
      target.style.zIndex = value.zIndex ? String(value.zIndex) : "";
    };

    const applyText = (target: HTMLElement, item: BoardTextItem) => {
      target.dataset.boardLabel = item.label;
      if (document.activeElement !== target || target.dataset.boardEditing !== "true") {
        if (target.dataset.editAttribute === "href") target.setAttribute("href", item.value || "#");
        else if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) target.value = item.value;
        else if ((target.tagName === "STRONG" || target.tagName === "B") && /^\*\*[\s\S]*\*\*$/.test(item.value)) target.textContent = item.value.slice(2, -2);
        else if (target.dataset.editRich === "true" || item.value.includes("**") || item.value.includes("\n")) target.innerHTML = markdownToHtml(item.value);
        else target.textContent = item.value;
      }
      if (item.styleTouched) {
        target.style.fontFamily = fontFamily(item.style.fontFamily);
        target.style.fontSize = `${item.style.fontSize}px`;
        target.style.fontWeight = String(item.style.fontWeight);
        target.style.color = item.style.color;
        target.style.opacity = String(item.style.opacity / 100);
        target.style.lineHeight = String(item.style.lineHeight);
        target.style.letterSpacing = `${item.style.letterSpacing}px`;
        target.style.textAlign = item.style.textAlign;
      }
    };

    const applyImage = (target: HTMLElement, item: BoardImageItem) => {
      const value = transformFor(item, viewMode.current);
      target.dataset.boardLabel = item.label;
      target.style.setProperty("--image-scale", String(item.desktop.zoom / 100));
      target.style.setProperty("--image-focus-x", `${item.desktop.x}%`);
      target.style.setProperty("--image-focus-y", `${item.desktop.y}%`);
      const mobile = item.mobile ?? item.desktop;
      target.style.setProperty("--image-mobile-scale", String(mobile.zoom / 100));
      target.style.setProperty("--image-mobile-focus-x", `${mobile.x}%`);
      target.style.setProperty("--image-mobile-focus-y", `${mobile.y}%`);
      target.setAttribute("aria-label", item.alt || "설명 필요");
      target.querySelectorAll("[data-board-generated]").forEach((node) => node.remove());

      const source = item.previewSrc ?? (item.asset ? `/api/dev-content-board?asset=${encodeURIComponent(item.asset)}` : null);
      let image = source ? null : target.querySelector<HTMLImageElement>("img:not([data-board-generated])");
      if (source) {
        image = document.createElement("img");
        image.src = source;
        image.alt = item.alt;
        image.dataset.boardGenerated = "image";
        Object.assign(image.style, {
          position: "absolute",
          inset: "0",
          zIndex: "18",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        });
        target.append(image);
      }
      if (image) {
        image.style.objectPosition = `${value.x}% ${value.y}%`;
        image.style.transform = `scale(${value.zoom / 100})`;
        image.style.transformOrigin = `${value.x}% ${value.y}%`;
        image.style.opacity = String(item.effects.opacity / 100);
      }

      if (item.effects.overlayOpacity > 0) {
        const overlay = document.createElement("span");
        overlay.dataset.boardGenerated = "overlay";
        Object.assign(overlay.style, { position: "absolute", inset: "0", zIndex: "19", pointerEvents: "none", background: item.effects.overlayColor, opacity: String(item.effects.overlayOpacity / 100) });
        target.append(overlay);
      }
      if (item.effects.gradientEnabled) {
        const gradient = document.createElement("span");
        gradient.dataset.boardGenerated = "gradient";
        Object.assign(gradient.style, { position: "absolute", inset: "0", zIndex: "20", pointerEvents: "none", background: `linear-gradient(${item.effects.gradientDirection}, ${hexToRgba(item.effects.gradientColor, item.effects.gradientOpacity)}, transparent)` });
        target.append(gradient);
      }
    };

    const applyItem = (item: BoardItem) => {
      document.querySelectorAll<HTMLElement>(targetSelector(item.id)).forEach((target) => {
        applyLayout(target, item);
        if (item.type === "text") applyText(target, item);
        else applyImage(target, item);
      });
    };

    const playMotion = (target: HTMLElement, item: BoardItem, extraDelay = 0) => {
      if (item.motion.preset === "none" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      target.getAnimations().forEach((animation) => animation.cancel());
      const distance = item.motion.distance;
      const visibleOpacity = Number.parseFloat(getComputedStyle(target).opacity) || 1;
      const frames: Keyframe[] = item.motion.preset === "fade-up" ? [{ opacity: 0, transform: `translateY(${distance}px)` }, { opacity: visibleOpacity, transform: "translateY(0)" }]
        : item.motion.preset === "fade-down" ? [{ opacity: 0, transform: `translateY(-${distance}px)` }, { opacity: visibleOpacity, transform: "translateY(0)" }]
          : item.motion.preset === "fade-left" ? [{ opacity: 0, transform: `translateX(${distance}px)` }, { opacity: visibleOpacity, transform: "translateX(0)" }]
            : item.motion.preset === "fade-right" ? [{ opacity: 0, transform: `translateX(-${distance}px)` }, { opacity: visibleOpacity, transform: "translateX(0)" }]
              : item.motion.preset === "zoom-in" ? [{ opacity: 0, transform: "scale(.82)" }, { opacity: visibleOpacity, transform: "scale(1)" }]
                : item.motion.preset === "zoom-out" ? [{ opacity: 0, transform: "scale(1.18)" }, { opacity: visibleOpacity, transform: "scale(1)" }]
                  : item.motion.preset === "blur-in" ? [{ opacity: 0, filter: `blur(${Math.max(4, distance / 3)}px)` }, { opacity: visibleOpacity, filter: "blur(0)" }]
                    : item.motion.preset === "clip-reveal" ? [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }]
                      : [{ opacity: 0, letterSpacing: `${Math.max(8, distance / 2)}px` }, { opacity: visibleOpacity, letterSpacing: getComputedStyle(target).letterSpacing }];
      target.animate(frames, {
        duration: item.motion.duration,
        delay: item.motion.delay + extraDelay,
        easing: easingValue[item.motion.easing],
        fill: "backwards",
      });
    };

    const applyAll = (scroll = false) => {
      items.current.forEach(applyItem);
      if (!scroll) return;
      const firstTarget = Array.from(items.current.keys()).flatMap((id) => Array.from(document.querySelectorAll<HTMLElement>(targetSelector(id)))).find((target) => target.offsetParent !== null);
      const section = firstTarget?.closest<HTMLElement>("section, footer, header, aside, article") ?? firstTarget;
      if (section) requestAnimationFrame(() => {
        const top = window.scrollY + section.getBoundingClientRect().top;
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      });
    };

    const markSelected = (target?: HTMLElement | null) => {
      document.querySelectorAll("[data-board-selected]").forEach((node) => node.removeAttribute("data-board-selected"));
      if (target) target.dataset.boardSelected = "true";
    };

    const onMessage = (event: MessageEvent<SyncMessage | PlayMotionMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "content-board:play-motion") {
        const selected = event.data.itemId;
        const candidates = selected ? [items.current.get(selected)].filter(Boolean) as BoardItem[] : Array.from(items.current.values()).filter((item) => item.motion.preset !== "none");
        candidates.forEach((item, index) => {
          document.querySelectorAll<HTMLElement>(targetSelector(item.id)).forEach((target) => playMotion(target, item, selected ? 0 : index * 90));
        });
        return;
      }
      if (event.data?.type !== "content-board:sync") return;
      const shouldScroll = slideId.current !== event.data.slideId;
      slideId.current = event.data.slideId;
      items.current = new Map(event.data.items.map((item) => [item.id, item]));
      viewMode.current = event.data.viewMode;
      interactionMode.current = event.data.interactionMode;
      document.body.dataset.boardInteraction = event.data.interactionMode;
      applyAll(shouldScroll);
      const selected = event.data.selectedItemId
        ? document.querySelector<HTMLElement>(targetSelector(event.data.selectedItemId))
        : null;
      markSelected(selected);
    };

    const onClick = (event: MouseEvent) => {
      const origin = event.target as HTMLElement;
      const target = origin.closest<HTMLElement>("[data-edit-id]");
      if (!target || !items.current.has(target.dataset.editId ?? "")) {
        if (origin.closest("a, button")) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      event.stopPropagation();
      if (origin.closest("a, button")) event.preventDefault();
      const id = target.dataset.editId!;
      const item = items.current.get(id)!;
      markSelected(target);
      post({ type: "content-board:select", id });
      if (interactionMode.current === "move" || item.type !== "text" || target.dataset.editAttribute) return;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.dataset.boardEditing = "true";
        target.focus();
        return;
      }
      target.contentEditable = "true";
      target.dataset.boardEditing = "true";
      target.focus();
    };

    const onBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.dataset.boardEditing !== "true" || !target.dataset.editId) return;
      const item = items.current.get(target.dataset.editId);
      let value = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target.value : editableToMarkdown(target);
      if (
        item?.type === "text"
        && (target.tagName === "STRONG" || target.tagName === "B")
        && /^\*\*[\s\S]*\*\*$/.test(item.value)
        && !/^\*\*[\s\S]*\*\*$/.test(value)
      ) value = `**${value}**`;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) target.contentEditable = "false";
      delete target.dataset.boardEditing;
      post({ type: "content-board:text", id: target.dataset.editId, value });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.dataset.boardEditing === "true") {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b" && !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
          event.preventDefault();
          document.execCommand("bold");
        } else if (event.key === "Escape") {
          event.preventDefault();
          target.blur();
        }
        return;
      }
      if (interactionMode.current !== "move") return;
      const selected = document.querySelector<HTMLElement>("[data-board-selected='true']");
      const item = selected?.dataset.editId ? items.current.get(selected.dataset.editId) : null;
      if (!selected || !item) return;
      const step = event.shiftKey ? 10 : 1;
      const value = elementTransformFor(item, viewMode.current);
      const next = { ...value };
      if (event.key === "ArrowLeft") next.x -= step;
      else if (event.key === "ArrowRight") next.x += step;
      else if (event.key === "ArrowUp") next.y -= step;
      else if (event.key === "ArrowDown") next.y += step;
      else return;
      event.preventDefault();
      const updated = withElementTransform(item, viewMode.current, next);
      items.current.set(item.id, updated);
      applyLayout(selected, updated);
      post({ type: "content-board:layout-transform", id: item.id, value: next, viewMode: viewMode.current });
    };

    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.dataset.boardEditing !== "true") return;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      document.execCommand("insertText", false, event.clipboardData?.getData("text/plain") ?? "");
    };

    const imageTarget = (origin: EventTarget | null) => {
      const target = (origin as HTMLElement | null)?.closest<HTMLElement>('[data-edit-id][data-edit-type="image"], [data-edit-id][data-edit-type="bgImage"]');
      if (!target) return null;
      const item = items.current.get(target.dataset.editId ?? "");
      return item && isBoardImageItem(item) ? { target, item } : null;
    };

    const onDragOver = (event: DragEvent) => {
      const found = imageTarget(event.target);
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      document.body.dataset.boardFileDragging = "true";
      if (!found) return;
      found.target.dataset.boardDragover = "true";
    };

    const onDragLeave = (event: DragEvent) => {
      imageTarget(event.target)?.target.removeAttribute("data-board-dragover");
    };

    const onDrop = (event: DragEvent) => {
      const found = imageTarget(event.target);
      const file = event.dataTransfer?.files[0];
      document.body.removeAttribute("data-board-file-dragging");
      document.querySelectorAll("[data-board-dragover]").forEach((node) => node.removeAttribute("data-board-dragover"));
      if (!file) return;
      event.preventDefault();
      event.stopPropagation();
      if (!found) {
        post({ type: "content-board:error", message: "사진을 점선으로 표시된 이미지 박스 위에 놓아주세요." });
        return;
      }
      markSelected(found.target);
      post({ type: "content-board:select", id: found.item.id });
      post({ type: "content-board:image-drop", id: found.item.id, file });
    };

    const onDragEnd = () => {
      document.body.removeAttribute("data-board-file-dragging");
      document.querySelectorAll("[data-board-dragover]").forEach((node) => node.removeAttribute("data-board-dragover"));
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-edit-id]");
      const item = target?.dataset.editId ? items.current.get(target.dataset.editId) : null;
      if (target && item) {
        markSelected(target);
        post({ type: "content-board:select", id: item.id });
      }
      if (target && item && interactionMode.current === "move" && event.button === 0) {
        event.preventDefault();
        event.stopPropagation();
        if (!target.matches("a, button, input, textarea, select, [tabindex]")) target.tabIndex = -1;
        target.focus({ preventScroll: true });
        const start = elementTransformFor(item, viewMode.current);
        target.setPointerCapture(event.pointerId);
        layoutDrag.current = { target, item, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, start, latest: start };
        return;
      }
      if (target && item?.type === "text" && interactionMode.current === "edit" && !target.dataset.editAttribute) {
        target.dataset.boardEditing = "true";
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) target.contentEditable = "true";
        return;
      }
      const found = imageTarget(event.target);
      if (!found || event.button !== 0 || interactionMode.current !== "edit") return;
      event.preventDefault();
      const start = transformFor(found.item, viewMode.current);
      found.target.setPointerCapture(event.pointerId);
      drag.current = { target: found.target, item: found.item, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, start, latest: start };
    };

    const onPointerMove = (event: PointerEvent) => {
      const moving = layoutDrag.current;
      if (moving && moving.pointerId === event.pointerId) {
        const next = {
          ...moving.start,
          x: clamp(moving.start.x + event.clientX - moving.startX, -2000, 2000),
          y: clamp(moving.start.y + event.clientY - moving.startY, -2000, 2000),
        };
        moving.latest = next;
        const updated = withElementTransform(moving.item, viewMode.current, next);
        items.current.set(updated.id, updated);
        applyLayout(moving.target, updated);
        return;
      }
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      const rect = current.target.getBoundingClientRect();
      const next = {
        ...current.start,
        x: clamp(current.start.x - (event.clientX - current.startX) / Math.max(rect.width, 1) * 100, 0, 100),
        y: clamp(current.start.y - (event.clientY - current.startY) / Math.max(rect.height, 1) * 100, 0, 100),
      };
      current.latest = next;
      const updated = { ...current.item, ...(viewMode.current === "mobile" ? { mobile: next } : { desktop: next }) };
      items.current.set(updated.id, updated);
      applyImage(current.target, updated);
    };

    const finishPointer = (event: PointerEvent) => {
      const moving = layoutDrag.current;
      if (moving && moving.pointerId === event.pointerId) {
        moving.target.releasePointerCapture(event.pointerId);
        post({ type: "content-board:layout-transform", id: moving.item.id, value: moving.latest, viewMode: viewMode.current });
        layoutDrag.current = null;
        return;
      }
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      current.target.releasePointerCapture(event.pointerId);
      post({ type: "content-board:image-transform", id: current.item.id, value: current.latest, viewMode: viewMode.current });
      drag.current = null;
    };

    const onWheel = (event: WheelEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-edit-id]");
      const item = target?.dataset.editId ? items.current.get(target.dataset.editId) : null;
      if (target && item && interactionMode.current === "move") {
        event.preventDefault();
        const current = elementTransformFor(item, viewMode.current);
        const next = { ...current, scale: clamp(current.scale + (event.deltaY < 0 ? 5 : -5), 10, 500) };
        const updated = withElementTransform(item, viewMode.current, next);
        items.current.set(updated.id, updated);
        applyLayout(target, updated);
        markSelected(target);
        post({ type: "content-board:select", id: item.id });
        post({ type: "content-board:layout-transform", id: item.id, value: next, viewMode: viewMode.current });
        return;
      }
      const found = imageTarget(event.target);
      if (!found) return;
      event.preventDefault();
      const current = transformFor(found.item, viewMode.current);
      const next = { ...current, zoom: clamp(current.zoom + (event.deltaY < 0 ? 5 : -5), 100, 300) };
      const updated = { ...found.item, ...(viewMode.current === "mobile" ? { mobile: next } : { desktop: next }) };
      items.current.set(updated.id, updated);
      applyImage(found.target, updated);
      post({ type: "content-board:select", id: found.item.id });
      post({ type: "content-board:image-transform", id: found.item.id, value: next, viewMode: viewMode.current });
    };

    const onHeroState = () => window.setTimeout(() => applyAll(false), 0);
    window.addEventListener("message", onMessage);
    window.addEventListener("glory:hero-state", onHeroState);
    document.addEventListener("click", onClick, true);
    document.addEventListener("blur", onBlur, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("dragover", onDragOver, true);
    document.addEventListener("dragleave", onDragLeave, true);
    document.addEventListener("drop", onDrop, true);
    document.addEventListener("dragend", onDragEnd, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", finishPointer, true);
    document.addEventListener("pointercancel", finishPointer, true);
    document.addEventListener("wheel", onWheel, { capture: true, passive: false });
    post({ type: "content-board:ready" });

    return () => {
      document.body.classList.remove("contentBoardCanvas");
      document.body.removeAttribute("data-board-interaction");
      window.removeEventListener("message", onMessage);
      window.removeEventListener("glory:hero-state", onHeroState);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("blur", onBlur, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("dragover", onDragOver, true);
      document.removeEventListener("dragleave", onDragLeave, true);
      document.removeEventListener("drop", onDrop, true);
      document.removeEventListener("dragend", onDragEnd, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", finishPointer, true);
      document.removeEventListener("pointercancel", finishPointer, true);
      document.removeEventListener("wheel", onWheel, true);
    };
  }, []);

  return null;
}
