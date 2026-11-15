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
  itemScopes: Array<{ slideId: string; itemIds: string[] }>;
  viewMode: BoardViewMode;
  selectedItemId?: string | null;
  interactionMode: "edit" | "move";
};

type PlayMotionMessage = { type: "content-board:play-motion"; itemId?: string | null };
type NavigateHeroMessage = { type: "content-board:hero-navigate"; index: number };

type SnapCandidate = {
  value: number;
  label: string;
};

type SnapResult = {
  value: number;
  guide: SnapCandidate | null;
};

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

function heroPreviewSlides(boardItems: BoardItem[]) {
  const groups = new Map<string, Record<string, BoardItem>>();
  boardItems.forEach((item) => {
    const match = item.id.match(/^home\.hero\.slides\.([^.]+)\.(bgImage|eyebrow|title|titleStrong|description)$/);
    if (!match) return;
    const fields = groups.get(match[1]) ?? {};
    fields[match[2]] = item;
    groups.set(match[1], fields);
  });
  return Array.from(groups, ([id, fields]) => ({
    id,
    eyebrow: fields.eyebrow?.type === "text" ? fields.eyebrow.value : "",
    title: fields.title?.type === "text" ? fields.title.value : "",
    titleStrong: fields.titleStrong?.type === "text" ? fields.titleStrong.value : "",
    description: fields.description?.type === "text" ? fields.description.value : "",
    backgroundLabel: isBoardImageItem(fields.bgImage) ? fields.bgImage.label : "글로리의원 브랜딩 이미지",
    backgroundAlt: isBoardImageItem(fields.bgImage) ? fields.bgImage.alt : "",
  }));
}

export function ContentBoardPreviewBridge() {
  const items = useRef(new Map<string, BoardItem>());
  const viewMode = useRef<BoardViewMode>("desktop");
  const interactionMode = useRef<"edit" | "move">("edit");
  const slideId = useRef("");
  const drag = useRef<{ target: HTMLElement; item: BoardImageItem; pointerId: number; startX: number; startY: number; start: BoardImageTransform; latest: BoardImageTransform } | null>(null);
  const layoutDrag = useRef<{
    target: HTMLElement;
    captureTarget: HTMLElement;
    item: BoardItem;
    pointerId: number;
    startX: number;
    startY: number;
    start: BoardElementTransform;
    startRect: DOMRect;
    xCandidates: SnapCandidate[];
    yCandidates: SnapCandidate[];
    latest: BoardElementTransform;
  } | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (new URLSearchParams(window.location.search).get("content-board-preview") !== "1") return;
    if (window.parent === window) {
      window.location.replace("/content-board");
      return;
    }

    document.body.classList.add("contentBoardCanvas");

    const moveHandle = document.createElement("button");
    moveHandle.type = "button";
    moveHandle.className = "contentBoardMoveHandle";
    moveHandle.textContent = "↕ 이동";
    moveHandle.setAttribute("aria-label", "선택한 박스 이동");
    moveHandle.hidden = true;
    document.body.append(moveHandle);

    const verticalGuide = document.createElement("span");
    verticalGuide.className = "contentBoardSnapGuide contentBoardSnapGuideVertical";
    verticalGuide.hidden = true;
    verticalGuide.setAttribute("aria-hidden", "true");
    document.body.append(verticalGuide);

    const horizontalGuide = document.createElement("span");
    horizontalGuide.className = "contentBoardSnapGuide contentBoardSnapGuideHorizontal";
    horizontalGuide.hidden = true;
    horizontalGuide.setAttribute("aria-hidden", "true");
    document.body.append(horizontalGuide);

    let selectedTarget: HTMLElement | null = null;
    let wheelCommitTimer = 0;
    let pendingWheelCommit: Record<string, unknown> | null = null;

    const scheduleWheelCommit = (message: Record<string, unknown>) => {
      pendingWheelCommit = message;
      if (wheelCommitTimer) window.clearTimeout(wheelCommitTimer);
      wheelCommitTimer = window.setTimeout(() => {
        wheelCommitTimer = 0;
        if (!pendingWheelCommit) return;
        post(pendingWheelCommit);
        pendingWheelCommit = null;
      }, 160);
    };

    const clearVirtualBackgroundTargets = () => {
      document.querySelectorAll<HTMLElement>('[data-board-virtual-background="true"]').forEach((target) => {
        target.querySelectorAll(":scope > [data-board-generated]").forEach((node) => node.remove());
        target.removeAttribute("data-edit-id");
        target.removeAttribute("data-edit-type");
        target.removeAttribute("data-board-label");
        target.removeAttribute("data-board-virtual-background");
        target.style.isolation = target.dataset.boardOriginalIsolation ?? "";
        target.style.position = target.dataset.boardOriginalPosition ?? "";
        delete target.dataset.boardOriginalIsolation;
        delete target.dataset.boardOriginalPosition;
      });
    };

    const prepareVirtualBackgroundTargets = (scopes: SyncMessage["itemScopes"], boardItems: BoardItem[]) => {
      clearVirtualBackgroundTargets();
      const itemById = new Map(boardItems.map((item) => [item.id, item]));
      scopes.forEach((scope) => {
        const background = scope.itemIds.map((id) => itemById.get(id)).find((item) => item?.id === `board.section.${scope.slideId}.background`);
        if (!background || !isBoardImageItem(background)) return;
        const anchor = scope.itemIds
          .filter((id) => id !== background.id)
          .flatMap((id) => Array.from(document.querySelectorAll<HTMLElement>(targetSelector(id))))
          .find((target) => target.offsetParent !== null);
        const section = anchor?.closest<HTMLElement>("section, header, footer, article, aside") ?? null;
        if (!section || section.dataset.editId) return;
        section.dataset.boardOriginalIsolation = section.style.isolation;
        section.dataset.boardOriginalPosition = section.style.position;
        if (getComputedStyle(section).position === "static") section.style.position = "relative";
        section.style.isolation = "isolate";
        section.dataset.editId = background.id;
        section.dataset.editType = "bgImage";
        section.dataset.boardLabel = background.label;
        section.dataset.boardVirtualBackground = "true";
      });
    };

    const hideSnapGuides = () => {
      verticalGuide.hidden = true;
      horizontalGuide.hidden = true;
    };

    const showSnapGuide = (guide: HTMLElement, candidate: SnapCandidate | null, axis: "x" | "y") => {
      if (!candidate) {
        guide.hidden = true;
        return;
      }
      guide.hidden = false;
      guide.dataset.boardGuideLabel = candidate.label;
      if (axis === "x") guide.style.left = `${candidate.value}px`;
      else guide.style.top = `${candidate.value}px`;
    };

    const uniqueCandidates = (candidates: SnapCandidate[]) => {
      const seen = new Set<number>();
      return candidates.filter((candidate) => {
        const key = Math.round(candidate.value * 10);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const snapCandidatesFor = (target: HTMLElement) => {
      const safeInset = viewMode.current === "mobile" ? 20 : 32;
      const xCandidates: SnapCandidate[] = [
        { value: safeInset, label: "안전 여백" },
        { value: window.innerWidth / 2, label: "화면 중앙" },
        { value: window.innerWidth - safeInset, label: "안전 여백" },
      ];
      const yCandidates: SnapCandidate[] = [
        { value: safeInset, label: "안전 여백" },
        { value: window.innerHeight / 2, label: "화면 중앙" },
        { value: window.innerHeight - safeInset, label: "안전 여백" },
      ];
      const scope = target.closest<HTMLElement>("section, header, footer, article, aside, main") ?? document.body;
      const scopeRect = scope.getBoundingClientRect();
      if (scope !== target && scopeRect.width > 0 && scopeRect.height > 0) {
        xCandidates.push(
          { value: scopeRect.left, label: "섹션 왼쪽" },
          { value: scopeRect.left + scopeRect.width / 2, label: "섹션 중앙" },
          { value: scopeRect.right, label: "섹션 오른쪽" },
        );
        yCandidates.push(
          { value: scopeRect.top, label: "섹션 위" },
          { value: scopeRect.top + scopeRect.height / 2, label: "섹션 중앙" },
          { value: scopeRect.bottom, label: "섹션 아래" },
        );
      }

      scope.querySelectorAll<HTMLElement>("[data-edit-id]").forEach((peer) => {
        if (
          peer === target
          || peer.contains(target)
          || target.contains(peer)
          || peer.dataset.editId === target.dataset.editId
          || peer.offsetParent === null
        ) return;
        const rect = peer.getBoundingClientRect();
        if (
          rect.width <= 0
          || rect.height <= 0
          || rect.right < 0
          || rect.left > window.innerWidth
          || rect.bottom < 0
          || rect.top > window.innerHeight
        ) return;
        xCandidates.push(
          { value: rect.left, label: "박스 왼쪽" },
          { value: rect.left + rect.width / 2, label: "박스 중앙" },
          { value: rect.right, label: "박스 오른쪽" },
        );
        yCandidates.push(
          { value: rect.top, label: "박스 위" },
          { value: rect.top + rect.height / 2, label: "박스 중앙" },
          { value: rect.bottom, label: "박스 아래" },
        );
      });

      return { xCandidates: uniqueCandidates(xCandidates), yCandidates: uniqueCandidates(yCandidates) };
    };

    const snapAxis = (rawValue: number, anchors: number[], candidates: SnapCandidate[]): SnapResult => {
      const threshold = 7;
      let closestDelta: number | null = null;
      let closestCandidate: SnapCandidate | null = null;
      for (const anchor of anchors) {
        for (const candidate of candidates) {
          const delta = candidate.value - anchor;
          if (Math.abs(delta) > threshold || (closestDelta !== null && Math.abs(delta) >= Math.abs(closestDelta))) continue;
          closestDelta = delta;
          closestCandidate = candidate;
        }
      }
      return closestDelta !== null && closestCandidate
        ? { value: rawValue + closestDelta, guide: closestCandidate }
        : { value: rawValue, guide: null };
    };

    const updateMoveHandle = () => {
      if (!selectedTarget?.isConnected) {
        moveHandle.hidden = true;
        return;
      }
      const rect = selectedTarget.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
        moveHandle.hidden = true;
        return;
      }
      moveHandle.hidden = false;
      moveHandle.style.left = `${Math.max(4, Math.min(window.innerWidth - 66, rect.left))}px`;
      moveHandle.style.top = `${Math.max(30, rect.top)}px`;
    };

    const applyLayout = (target: HTMLElement, item: BoardItem) => {
      const value = elementTransformFor(item, viewMode.current);
      target.style.translate = value.x || value.y ? `${value.x}px ${value.y}px` : "";
      target.style.scale = value.scale !== 100 ? String(value.scale / 100) : "";
      target.style.rotate = value.rotate ? `${value.rotate}deg` : "";
      target.style.zIndex = value.zIndex ? String(value.zIndex) : "";
      if (target === selectedTarget) updateMoveHandle();
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
      const virtualBackground = target.dataset.boardVirtualBackground === "true";
      target.dataset.boardLabel = item.label;
      // Preview-only images must stay inside their original image slot. Without
      // a local stacking context, the generated absolute image can escape a
      // background slot and cover the section's real copy, shade, or controls.
      target.style.isolation = "isolate";
      target.style.setProperty("--image-scale", String(item.desktop.zoom / 100));
      target.style.setProperty("--image-focus-x", `${item.desktop.x}%`);
      target.style.setProperty("--image-focus-y", `${item.desktop.y}%`);
      const mobile = item.mobile ?? item.desktop;
      target.style.setProperty("--image-mobile-scale", String(mobile.zoom / 100));
      target.style.setProperty("--image-mobile-focus-x", `${mobile.x}%`);
      target.style.setProperty("--image-mobile-focus-y", `${mobile.y}%`);
      target.setAttribute("aria-label", item.alt || "설명 필요");
      target.querySelectorAll(":scope > [data-board-generated]").forEach((node) => node.remove());

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
          zIndex: virtualBackground ? "-3" : "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        });
        if (virtualBackground) target.prepend(image);
        else target.append(image);
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
        Object.assign(overlay.style, { position: "absolute", inset: "0", zIndex: virtualBackground ? "-2" : "1", pointerEvents: "none", background: item.effects.overlayColor, opacity: String(item.effects.overlayOpacity / 100) });
        target.append(overlay);
      }
      if (item.effects.gradientEnabled) {
        const gradient = document.createElement("span");
        gradient.dataset.boardGenerated = "gradient";
        Object.assign(gradient.style, { position: "absolute", inset: "0", zIndex: virtualBackground ? "-1" : "2", pointerEvents: "none", background: `linear-gradient(${item.effects.gradientDirection}, ${hexToRgba(item.effects.gradientColor, item.effects.gradientOpacity)}, transparent)` });
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
      selectedTarget = target ?? null;
      if (target) target.dataset.boardSelected = "true";
      updateMoveHandle();
    };

    const onMessage = (event: MessageEvent<SyncMessage | PlayMotionMessage | NavigateHeroMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "content-board:hero-navigate") {
        window.dispatchEvent(new CustomEvent("glory:hero-navigate", { detail: { index: event.data.index } }));
        return;
      }
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
      hideSnapGuides();
      document.body.dataset.boardInteraction = event.data.interactionMode;
      prepareVirtualBackgroundTargets(event.data.itemScopes ?? [], event.data.items);
      const projectedHeroSlides = heroPreviewSlides(event.data.items);
      if (projectedHeroSlides.length) {
        window.dispatchEvent(new CustomEvent("glory:content-board-hero-sync", { detail: { slides: projectedHeroSlides } }));
        // React renders board-only hero slides after this event. Re-apply the
        // editable values and uploaded images once those real design nodes exist.
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => applyAll(shouldScroll)));
      } else {
        applyAll(shouldScroll);
      }
      const selected = event.data.selectedItemId
        ? document.querySelector<HTMLElement>(targetSelector(event.data.selectedItemId))
        : null;
      markSelected(selected);
    };

    const onClick = (event: MouseEvent) => {
      const origin = event.target as HTMLElement;
      // Real-page controls such as gallery pagination and equipment arrows must
      // remain usable inside the slide editor. They change the visible editing
      // target but never navigate away from the preview.
      if (origin.closest("[data-edit-control]")) return;
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
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && (key === "z" || (event.ctrlKey && key === "y"))) {
        event.preventDefault();
        post({
          type: "content-board:history",
          direction: event.shiftKey || (event.ctrlKey && key === "y") ? "redo" : "undo",
        });
        return;
      }
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
      if ((event.target as HTMLElement | null)?.closest(".contentBoardMoveHandle")) {
        const target = selectedTarget;
        const item = target?.dataset.editId ? items.current.get(target.dataset.editId) : null;
        if (!target || !item || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const start = elementTransformFor(item, viewMode.current);
        const candidates = snapCandidatesFor(target);
        moveHandle.setPointerCapture(event.pointerId);
        layoutDrag.current = {
          target,
          captureTarget: moveHandle,
          item,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          start,
          startRect: target.getBoundingClientRect(),
          ...candidates,
          latest: start,
        };
        return;
      }
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-edit-id]");
      const item = target?.dataset.editId ? items.current.get(target.dataset.editId) : null;
      const wasSelected = Boolean(target && target === selectedTarget);
      if (target && item && !wasSelected) {
        markSelected(target);
        post({ type: "content-board:select", id: item.id });
      }
      if (target && item && interactionMode.current === "move" && event.button === 0) {
        if (!wasSelected) return;
        event.preventDefault();
        event.stopPropagation();
        if (!target.matches("a, button, input, textarea, select, [tabindex]")) target.tabIndex = -1;
        target.focus({ preventScroll: true });
        const start = elementTransformFor(item, viewMode.current);
        const candidates = snapCandidatesFor(target);
        target.setPointerCapture(event.pointerId);
        layoutDrag.current = {
          target,
          captureTarget: target,
          item,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          start,
          startRect: target.getBoundingClientRect(),
          ...candidates,
          latest: start,
        };
        return;
      }
      if (target && item?.type === "text" && interactionMode.current === "edit" && !target.dataset.editAttribute) {
        target.dataset.boardEditing = "true";
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) target.contentEditable = "true";
        return;
      }
      const found = imageTarget(event.target);
      if (!found || event.button !== 0 || interactionMode.current !== "edit") return;
      if (!wasSelected || found.target !== selectedTarget) return;
      event.preventDefault();
      const start = transformFor(found.item, viewMode.current);
      found.target.setPointerCapture(event.pointerId);
      drag.current = { target: found.target, item: found.item, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, start, latest: start };
    };

    const onPointerMove = (event: PointerEvent) => {
      const moving = layoutDrag.current;
      if (moving && moving.pointerId === event.pointerId) {
        const raw = {
          ...moving.start,
          x: clamp(moving.start.x + event.clientX - moving.startX, -2000, 2000),
          y: clamp(moving.start.y + event.clientY - moving.startY, -2000, 2000),
        };
        const deltaX = raw.x - moving.start.x;
        const deltaY = raw.y - moving.start.y;
        const movedLeft = moving.startRect.left + deltaX;
        const movedTop = moving.startRect.top + deltaY;
        const xSnap = event.altKey
          ? { value: raw.x, guide: null }
          : snapAxis(raw.x, [movedLeft, movedLeft + moving.startRect.width / 2, movedLeft + moving.startRect.width], moving.xCandidates);
        const ySnap = event.altKey
          ? { value: raw.y, guide: null }
          : snapAxis(raw.y, [movedTop, movedTop + moving.startRect.height / 2, movedTop + moving.startRect.height], moving.yCandidates);
        const next = { ...raw, x: xSnap.value, y: ySnap.value };
        showSnapGuide(verticalGuide, xSnap.guide, "x");
        showSnapGuide(horizontalGuide, ySnap.guide, "y");
        moving.latest = next;
        const updated = withElementTransform(moving.item, viewMode.current, next);
        items.current.set(updated.id, updated);
        applyLayout(moving.target, updated);
        updateMoveHandle();
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
        if (moving.captureTarget.hasPointerCapture(event.pointerId)) moving.captureTarget.releasePointerCapture(event.pointerId);
        post({ type: "content-board:layout-transform", id: moving.item.id, value: moving.latest, viewMode: viewMode.current });
        layoutDrag.current = null;
        hideSnapGuides();
        updateMoveHandle();
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
      if (target && item && target === selectedTarget && interactionMode.current === "move") {
        event.preventDefault();
        const current = elementTransformFor(item, viewMode.current);
        const step = clamp(Math.abs(event.deltaY) / 20, 1, 5);
        const next = { ...current, scale: Math.round(clamp(current.scale + (event.deltaY < 0 ? step : -step), 10, 500) * 10) / 10 };
        const updated = withElementTransform(item, viewMode.current, next);
        items.current.set(updated.id, updated);
        applyLayout(target, updated);
        scheduleWheelCommit({ type: "content-board:layout-transform", id: item.id, value: next, viewMode: viewMode.current });
        return;
      }
      const found = imageTarget(event.target);
      if (!found || found.target !== selectedTarget) return;
      event.preventDefault();
      const current = transformFor(found.item, viewMode.current);
      const step = clamp(Math.abs(event.deltaY) / 20, 1, 5);
      const next = { ...current, zoom: Math.round(clamp(current.zoom + (event.deltaY < 0 ? step : -step), 100, 300) * 10) / 10 };
      const updated = { ...found.item, ...(viewMode.current === "mobile" ? { mobile: next } : { desktop: next }) };
      items.current.set(updated.id, updated);
      applyImage(found.target, updated);
      scheduleWheelCommit({ type: "content-board:image-transform", id: found.item.id, value: next, viewMode: viewMode.current });
    };

    const onHeroState = (event: Event) => {
      const detail = (event as CustomEvent<{ index?: number; count?: number; slideId?: string }>).detail ?? {};
      post({ type: "content-board:hero-state", ...detail });
      window.setTimeout(() => applyAll(false), 0);
    };
    let viewportFrame = 0;
    const onViewportChange = () => {
      if (viewportFrame) return;
      viewportFrame = window.requestAnimationFrame(() => {
        viewportFrame = 0;
        updateMoveHandle();
      });
    };
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
    window.addEventListener("scroll", onViewportChange, { capture: true, passive: true });
    window.addEventListener("resize", onViewportChange);
    post({ type: "content-board:ready" });

    return () => {
      document.body.classList.remove("contentBoardCanvas");
      document.body.removeAttribute("data-board-interaction");
      clearVirtualBackgroundTargets();
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
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
      if (wheelCommitTimer) window.clearTimeout(wheelCommitTimer);
      if (pendingWheelCommit) post(pendingWheelCommit);
      if (viewportFrame) window.cancelAnimationFrame(viewportFrame);
      moveHandle.remove();
      verticalGuide.remove();
      horizontalGuide.remove();
    };
  }, []);

  return null;
}
