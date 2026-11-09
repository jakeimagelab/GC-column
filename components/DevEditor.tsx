"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  EQUIPMENT_ITEMS_ID,
  getEditableEntry,
  getEquipmentItems,
  getHeroSlides,
  HERO_SLIDES_ID,
  withEditableEntry,
  type EquipmentContentItem,
  type HeroSlide,
  type ImageContentEntry,
  type SiteContent,
  type SiteContentCollection,
  type SiteContentEntry,
  type TextContentEntry,
} from "@/content/site-content-types";
import styles from "./DevEditor.module.css";

type DevEditorProps = {
  page: "home" | "column";
  content: SiteContent;
};

type EditorValue = SiteContentEntry | SiteContentCollection;
type HistoryItem = { id: string; before: EditorValue; after: EditorValue };
type SaveState = "saved" | "saving" | "error";
type InlineEdit = {
  id: string;
  original: TextContentEntry;
  rich: boolean;
  attribute?: "href";
  style: CSSProperties;
};
type HeroState = { index: number; count: number; slideId: string };
type EquipmentCommand = { action: "add" | "delete" | "moveBefore" | "moveAfter"; itemId: string };

const cloneValue = <T,>(value: T): T => structuredClone(value);

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownToHtml(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function editableToMarkdown(root: HTMLElement, rich: boolean) {
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";
    const children = Array.from(node.childNodes).map(walk).join("");
    if (node.tagName === "BR") return "\n";
    if (rich && (node.tagName === "STRONG" || node.tagName === "B")) return `**${children}**`;
    if (node !== root && (node.tagName === "DIV" || node.tagName === "P")) return `${children}\n`;
    return children;
  };
  return walk(root).replace(/\u00a0/g, " ").replace(/\n+$/g, "");
}

function applyDomEntry(id: string, entry: SiteContentEntry) {
  document.querySelectorAll<HTMLElement>(`[data-edit-id="${CSS.escape(id)}"]`).forEach((target) => {
    if (entry.type === "text") {
      const attribute = target.dataset.editAttribute;
      if (attribute === "href") {
        target.setAttribute("href", entry.value || "#");
      } else if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.value = entry.value;
      } else if (target.dataset.editRich === "true") {
        target.innerHTML = markdownToHtml(entry.value);
      } else {
        target.textContent = entry.value;
      }
      return;
    }

    target.setAttribute("aria-label", entry.alt);
    target.style.setProperty("--image-scale", String(entry.zoom / 100));
    target.style.setProperty("--image-focus-x", `${entry.focusX}%`);
    target.style.setProperty("--image-focus-y", `${entry.focusY}%`);
    const hint = target.querySelector<HTMLElement>("[data-bg-edit-hint]");
    target.querySelectorAll("img, [data-edit-preview]").forEach((node) => node.remove());
    Array.from(target.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => node.remove());
    if (entry.src) {
      const image = document.createElement("img");
      image.src = entry.src;
      image.alt = entry.alt;
      image.dataset.editPreview = "true";
      image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${entry.focusX}% ${entry.focusY}%;transform:scale(${entry.zoom / 100});transform-origin:${entry.focusX}% ${entry.focusY}%;`;
      target.insertBefore(image, hint ?? null);
    } else {
      target.insertBefore(document.createTextNode(entry.label), hint ?? null);
    }
  });
}

export function DevEditor({ page, content }: DevEditorProps) {
  const searchParams = useSearchParams();
  const active = searchParams.get("edit") === "1";
  const router = useRouter();
  const pathname = usePathname();
  const [entries, setEntries] = useState(content);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ImageContentEntry | null>(null);
  const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null);
  const [heroState, setHeroState] = useState<HeroState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const inlineEditor = useRef<HTMLDivElement>(null);

  useEffect(() => setEntries(content), [content]);

  useEffect(() => {
    const entry = selectedId ? getEditableEntry(entries, selectedId) : undefined;
    setDraft(entry && entry.type !== "text" ? cloneValue(entry) : null);
  }, [entries, selectedId]);

  useEffect(() => {
    const editor = inlineEditor.current;
    if (!inlineEdit || !editor) return;
    editor.innerHTML = inlineEdit.rich ? markdownToHtml(inlineEdit.original.value) : escapeHtml(inlineEdit.original.value);
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [inlineEdit]);

  const recordHistory = (id: string, before: EditorValue, after: EditorValue) => {
    setUndoStack((current) => [...current.slice(-99), { id, before: cloneValue(before), after: cloneValue(after) }]);
    setRedoStack([]);
  };

  const saveEntry = useCallback(async (
    id: string,
    next: SiteContentEntry,
    options: { record?: boolean; before?: SiteContentEntry } = {},
  ) => {
    const before = options.before ?? getEditableEntry(entries, id);
    if (!before || JSON.stringify(before) === JSON.stringify(next)) return true;
    setSaveState("saving");
    setError("");
    try {
      const response = await fetch("/api/dev-edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, entry: next }),
      });
      const result = await response.json() as { entry?: SiteContentEntry; error?: string };
      if (!response.ok || !result.entry) throw new Error(result.error || "저장에 실패했습니다.");
      const saved = result.entry;
      setEntries((current) => withEditableEntry(current, id, saved));
      applyDomEntry(id, saved);
      if (options.record !== false) recordHistory(id, before, saved);
      setSaveState("saved");
      return true;
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "저장에 실패했습니다.");
      return false;
    }
  }, [entries]);

  const saveCollection = useCallback(async (
    id: typeof HERO_SLIDES_ID | typeof EQUIPMENT_ITEMS_ID,
    next: SiteContentCollection,
    options: { record?: boolean; before?: SiteContentCollection } = {},
  ) => {
    const currentValue = entries[id];
    const before = options.before ?? (Array.isArray(currentValue) ? currentValue : undefined);
    if (!before || JSON.stringify(before) === JSON.stringify(next)) return true;
    setSaveState("saving");
    setError("");
    try {
      const response = await fetch("/api/dev-edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, collection: next }),
      });
      const result = await response.json() as { collection?: SiteContentCollection; error?: string };
      if (!response.ok || !result.collection) throw new Error(result.error || "저장에 실패했습니다.");
      const saved = result.collection;
      setEntries((current) => ({ ...current, [id]: saved }));
      if (options.record !== false) recordHistory(id, before, saved);
      setSaveState("saved");
      router.refresh();
      return true;
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "저장에 실패했습니다.");
      return false;
    }
  }, [entries, router]);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("devEditActive");

    const onClick = (event: MouseEvent) => {
      const origin = event.target as HTMLElement;
      if (origin.closest("[data-dev-editor]")) return;
      if (origin.closest("[data-edit-control]")) return;
      const editable = origin.closest<HTMLElement>("[data-edit-id]");
      if (!editable) {
        if (origin.closest("a, button")) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const id = editable.dataset.editId;
      if (!id) return;
      const entry = getEditableEntry(entries, id);
      if (!entry) return;
      setSelectedId(id);
      if (entry.type === "text") {
        const rect = editable.getBoundingClientRect();
        const computed = getComputedStyle(editable);
        setInlineEdit({
          id,
          original: cloneValue(entry),
          rich: editable.dataset.editRich === "true",
          attribute: editable.dataset.editAttribute === "href" ? "href" : undefined,
          style: {
            top: rect.top,
            left: rect.left,
            width: Math.max(rect.width, 120),
            height: Math.max(rect.height, 36),
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            letterSpacing: computed.letterSpacing,
            color: computed.color,
            textAlign: computed.textAlign as CSSProperties["textAlign"],
          },
        });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.body.classList.remove("devEditActive");
      document.removeEventListener("click", onClick, true);
    };
  }, [active, entries]);

  useEffect(() => {
    if (!active || page !== "home") return;
    const update = (event: Event) => setHeroState((event as CustomEvent<HeroState>).detail);
    window.addEventListener("glory:hero-state", update);
    window.dispatchEvent(new CustomEvent("glory:hero-request-state"));
    return () => window.removeEventListener("glory:hero-state", update);
  }, [active, page, entries]);

  useEffect(() => {
    if (!active || page !== "home") return;
    const handle = (event: Event) => {
      const { action, itemId } = (event as CustomEvent<EquipmentCommand>).detail;
      const items = getEquipmentItems(entries);
      const index = items.findIndex((item) => item.id === itemId);
      if (index < 0) return;
      const next = cloneValue(items);
      if (action === "add") {
        const item: EquipmentContentItem = {
          id: `equipment-${Date.now()}`,
          image: { type: "image", src: null, label: "[장비 누끼 사진]", alt: "장비 누끼 사진", zoom: 100, focusX: 50, focusY: 50 },
          name: "[장비명]",
          desc: "[설명]",
          link: "",
        };
        next.splice(index + 1, 0, item);
      } else if (action === "delete") {
        if (next.length <= 1) return;
        next.splice(index, 1);
      } else {
        const target = action === "moveBefore" ? index - 1 : index + 1;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
      }
      void saveCollection(EQUIPMENT_ITEMS_ID, next);
    };
    window.addEventListener("glory:equipment-command", handle);
    return () => window.removeEventListener("glory:equipment-command", handle);
  }, [active, entries, page, saveCollection]);

  const updateHeroSlides = (action: "add" | "delete" | "moveBefore" | "moveAfter") => {
    const slides = getHeroSlides(entries);
    const index = heroState?.index ?? 0;
    const next = cloneValue(slides);
    let nextIndex = index;
    if (action === "add") {
      if (next.length >= 6) return;
      const current = next[index] ?? next[0];
      const copy: HeroSlide = { ...cloneValue(current), id: `hero-slide-${Date.now()}` };
      next.splice(index + 1, 0, copy);
      nextIndex = index + 1;
    } else if (action === "delete") {
      if (next.length <= 1) return;
      next.splice(index, 1);
      nextIndex = Math.min(index, next.length - 1);
    } else {
      const target = action === "moveBefore" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      nextIndex = target;
    }
    void saveCollection(HERO_SLIDES_ID, next).then((saved) => {
      if (saved) window.dispatchEvent(new CustomEvent("glory:hero-navigate", { detail: { index: nextIndex } }));
    });
  };

  const upload = async (file: File) => {
    if (!selectedId || !draft) return;
    const before = getEditableEntry(entries, selectedId);
    if (!before) return;
    const form = new FormData();
    form.set("id", selectedId);
    form.set("file", file);
    setSaveState("saving");
    setError("");
    try {
      const response = await fetch("/api/dev-edit", { method: "POST", body: form });
      const result = await response.json() as { entry?: SiteContentEntry; error?: string };
      if (!response.ok || !result.entry) throw new Error(result.error || "업로드에 실패했습니다.");
      setEntries((current) => withEditableEntry(current, selectedId, result.entry!));
      applyDomEntry(selectedId, result.entry);
      recordHistory(selectedId, before, result.entry);
      setSaveState("saved");
    } catch (uploadError) {
      setSaveState("error");
      setError(uploadError instanceof Error ? uploadError.message : "업로드에 실패했습니다.");
    }
  };

  const commitImageDraft = (nextDraft: ImageContentEntry) => {
    setDraft(nextDraft);
    if (selectedId) void saveEntry(selectedId, nextDraft);
  };

  const saveHistoryValue = async (id: string, value: EditorValue, before: EditorValue) => {
    if (Array.isArray(value)) return saveCollection(id as typeof HERO_SLIDES_ID | typeof EQUIPMENT_ITEMS_ID, value, { record: false, before: before as SiteContentCollection });
    return saveEntry(id, value, { record: false, before: before as SiteContentEntry });
  };

  const undo = async () => {
    const item = undoStack.at(-1);
    if (!item) return;
    if (await saveHistoryValue(item.id, item.before, item.after)) {
      setUndoStack((current) => current.slice(0, -1));
      setRedoStack((current) => [...current.slice(-99), item]);
    }
  };

  const redo = async () => {
    const item = redoStack.at(-1);
    if (!item) return;
    if (await saveHistoryValue(item.id, item.after, item.before)) {
      setRedoStack((current) => current.slice(0, -1));
      setUndoStack((current) => [...current.slice(-99), item]);
    }
  };

  if (!active) return null;

  return (
    <>
      {inlineEdit ? (
        <div
          ref={inlineEditor}
          className={styles.inlineEditor}
          data-dev-editor
          style={inlineEdit.style}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline={inlineEdit.rich}
          aria-label={`${inlineEdit.id} 문구 편집`}
          onBlur={(event) => {
            const edit = inlineEdit;
            const value = editableToMarkdown(event.currentTarget, edit.rich);
            setInlineEdit(null);
            void saveEntry(edit.id, { type: "text", value }, { before: edit.original });
          }}
          onPaste={(event) => {
            event.preventDefault();
            document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setInlineEdit(null);
            } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b" && inlineEdit.rich) {
              event.preventDefault();
              document.execCommand("bold");
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (inlineEdit.rich) document.execCommand("insertLineBreak");
              else event.currentTarget.blur();
            }
          }}
        />
      ) : null}
      <aside
        className={styles.toolbar}
        data-dev-editor
        aria-label="화면 편집 도구"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void upload(file);
        }}
      >
        <div className={styles.topline}>
          <b>{page === "home" ? "홈" : "칼럼 메인"} 편집</b>
          <nav><Link href="/?edit=1">홈</Link><Link href="/column?edit=1">칼럼 메인</Link></nav>
          <button type="button" onClick={() => void undo()} disabled={!undoStack.length}>되돌리기</button>
          <button type="button" onClick={() => void redo()} disabled={!redoStack.length}>다시하기</button>
          <span role="status" aria-live="polite" className={`${styles.status} ${saveState === "error" ? styles.error : ""}`}>
            {saveState === "saving" ? "저장 중" : saveState === "error" ? `실패 · ${error}` : "저장됨"}
          </span>
          <button type="button" className={styles.exit} onClick={() => router.push(pathname)}>편집 종료</button>
        </div>

        {page === "home" && heroState ? (
          <div className={styles.slideTools}>
            <b>슬라이드</b>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("glory:hero-navigate", { detail: { delta: -1 } }))}>◀</button>
            <span>{heroState.index + 1} / {heroState.count}</span>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("glory:hero-navigate", { detail: { delta: 1 } }))}>▶</button>
            <span>·</span>
            <button type="button" onClick={() => updateHeroSlides("add")} disabled={heroState.count >= 6}>+ 추가</button>
            <button type="button" onClick={() => updateHeroSlides("delete")} disabled={heroState.count <= 1}>삭제</button>
            <button type="button" onClick={() => updateHeroSlides("moveBefore")} disabled={heroState.index === 0}>앞으로</button>
            <button type="button" onClick={() => updateHeroSlides("moveAfter")} disabled={heroState.index === heroState.count - 1}>뒤로</button>
          </div>
        ) : null}

        {draft && selectedId ? (
          <div className={styles.imageTools}>
            <span className={styles.selected}>{selectedId}</span>
            <button type="button" onClick={() => fileInput.current?.click()}>이미지 교체</button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }} />
            <label>확대 <input type="range" min="100" max="250" value={draft.zoom} onChange={(event) => setDraft({ ...draft, zoom: Number(event.target.value) })} onPointerUp={(event) => commitImageDraft({ ...draft, zoom: Number(event.currentTarget.value) })} onBlur={(event) => commitImageDraft({ ...draft, zoom: Number(event.currentTarget.value) })} /><output>{draft.zoom}%</output></label>
            <label>X <input type="range" min="0" max="100" value={draft.focusX} onChange={(event) => setDraft({ ...draft, focusX: Number(event.target.value) })} onPointerUp={(event) => commitImageDraft({ ...draft, focusX: Number(event.currentTarget.value) })} onBlur={(event) => commitImageDraft({ ...draft, focusX: Number(event.currentTarget.value) })} /><output>{draft.focusX}</output></label>
            <label>Y <input type="range" min="0" max="100" value={draft.focusY} onChange={(event) => setDraft({ ...draft, focusY: Number(event.target.value) })} onPointerUp={(event) => commitImageDraft({ ...draft, focusY: Number(event.currentTarget.value) })} onBlur={(event) => commitImageDraft({ ...draft, focusY: Number(event.currentTarget.value) })} /><output>{draft.focusY}</output></label>
            <label className={styles.alt}>대체 문구 <input value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} onBlur={(event) => commitImageDraft({ ...draft, alt: event.currentTarget.value })} /></label>
            <button type="button" className={styles.remove} onClick={() => void saveEntry(selectedId, { ...draft, src: null, zoom: 100, focusX: 50, focusY: 50 })}>이미지 지우기</button>
            <small>파일을 이 툴바에 끌어다 놓아도 교체됩니다.</small>
          </div>
        ) : (
          <p className={styles.help}>글자를 클릭해 바로 수정하거나, 이미지·배경을 클릭해 교체하세요. 통합 문구는 Enter로 줄바꿈하고 Cmd+B로 굵기를 바꿀 수 있습니다.</p>
        )}
      </aside>
    </>
  );
}
