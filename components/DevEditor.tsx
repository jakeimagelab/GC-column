"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { ImageContentEntry, SiteContent, SiteContentEntry, TextContentEntry } from "@/content/site-content-types";
import styles from "./DevEditor.module.css";

type DevEditorProps = {
  page: "home" | "column";
  content: SiteContent;
};

type HistoryItem = {
  id: string;
  before: SiteContentEntry;
  after: SiteContentEntry;
};

type SaveState = "saved" | "saving" | "error";
type InlineEdit = {
  id: string;
  value: string;
  original: TextContentEntry;
  multiline: boolean;
  style: CSSProperties;
};

const cloneEntry = <T extends SiteContentEntry>(entry: T): T => structuredClone(entry);

function applyDomEntry(id: string, entry: SiteContentEntry) {
  document.querySelectorAll<HTMLElement>(`[data-edit-id="${CSS.escape(id)}"]`).forEach((target) => {
    if (entry.type === "text") {
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) target.value = entry.value;
      else target.textContent = entry.value;
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
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setEntries(content), [content]);

  useEffect(() => {
    const entry = selectedId ? entries[selectedId] : null;
    setDraft(entry && entry.type !== "text" ? cloneEntry(entry) : null);
  }, [entries, selectedId]);

  const saveEntry = useCallback(async (
    id: string,
    next: SiteContentEntry,
    options: { record?: boolean; before?: SiteContentEntry } = {},
  ) => {
    const before = options.before ?? entries[id];
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
      setEntries((current) => ({ ...current, [id]: saved }));
      applyDomEntry(id, saved);
      if (options.record !== false) {
        setUndoStack((current) => [...current.slice(-99), { id, before: cloneEntry(before), after: cloneEntry(saved) }]);
        setRedoStack([]);
      }
      setSaveState("saved");
      return true;
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "저장에 실패했습니다.");
      return false;
    }
  }, [entries]);

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
      const entry = entries[id];
      if (!entry) return;
      setSelectedId(id);
      if (entry.type === "text") {
        const rect = editable.getBoundingClientRect();
        const computed = getComputedStyle(editable);
        setInlineEdit({
          id,
          value: entry.value,
          original: cloneEntry(entry),
          multiline: entry.value.includes("\n"),
          style: {
            top: rect.top,
            left: rect.left,
            width: Math.max(rect.width, 80),
            height: Math.max(rect.height, 34),
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

  if (!active) return null;

  const upload = async (file: File) => {
    if (!selectedId || !draft) return;
    const before = entries[selectedId];
    const form = new FormData();
    form.set("id", selectedId);
    form.set("file", file);
    setSaveState("saving");
    setError("");
    try {
      const response = await fetch("/api/dev-edit", { method: "POST", body: form });
      const result = await response.json() as { entry?: SiteContentEntry; error?: string };
      if (!response.ok || !result.entry) throw new Error(result.error || "업로드에 실패했습니다.");
      setEntries((current) => ({ ...current, [selectedId]: result.entry! }));
      applyDomEntry(selectedId, result.entry);
      setUndoStack((current) => [...current.slice(-99), { id: selectedId, before: cloneEntry(before), after: cloneEntry(result.entry!) }]);
      setRedoStack([]);
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

  const undo = async () => {
    const item = undoStack.at(-1);
    if (!item) return;
    if (await saveEntry(item.id, item.before, { record: false, before: item.after })) {
      setUndoStack((current) => current.slice(0, -1));
      setRedoStack((current) => [...current.slice(-99), item]);
    }
  };

  const redo = async () => {
    const item = redoStack.at(-1);
    if (!item) return;
    if (await saveEntry(item.id, item.after, { record: false, before: item.before })) {
      setRedoStack((current) => current.slice(0, -1));
      setUndoStack((current) => [...current.slice(-99), item]);
    }
  };

  return (
    <>
      {inlineEdit ? (
        <textarea
          className={styles.inlineEditor}
          data-dev-editor
          style={inlineEdit.style}
          value={inlineEdit.value}
          autoFocus
          aria-label={`${inlineEdit.id} 문구 편집`}
          rows={inlineEdit.multiline ? Math.max(2, inlineEdit.value.split("\n").length) : 1}
          onChange={(event) => setInlineEdit({
            ...inlineEdit,
            value: inlineEdit.multiline ? event.target.value : event.target.value.replace(/[\r\n]+/g, " "),
          })}
          onBlur={() => {
            const edit = inlineEdit;
            setInlineEdit(null);
            void saveEntry(edit.id, { type: "text", value: edit.value }, { before: edit.original });
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setInlineEdit(null);
            } else if (event.key === "Enter" && !inlineEdit.multiline) {
              event.preventDefault();
              event.currentTarget.blur();
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
          {saveState === "saving" ? "저장 중" : saveState === "error" ? `실패 · ${error}` : "저장됨"}
        </span>
        <button type="button" className={styles.exit} onClick={() => router.push(pathname)}>편집 종료</button>
      </div>

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
        <p className={styles.help}>글자를 클릭해 바로 수정하거나, 이미지·배경을 클릭해 교체하세요.</p>
      )}
      </aside>
    </>
  );
}
