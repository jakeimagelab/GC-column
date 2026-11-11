"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  EQUIPMENT_ITEMS_ID,
  getEditableEntry,
  getEquipmentItems,
  getHeroSlides,
  getText,
  getTypingExamples,
  HERO_SLIDES_ID,
  TYPING_EXAMPLES_ID,
  withEditableEntry,
  type EquipmentContentItem,
  type HeroSlide,
  type ImageContentEntry,
  type SiteContent,
  type SiteContentCollection,
  type SiteContentEntry,
  type TextContentEntry,
} from "@/content/site-content-types";
import { desktopTransform, mobileTransform } from "@/lib/imagePlacement";
import styles from "./DevEditor.module.css";
import { ImagePlacementEditor } from "./ImagePlacementEditor";

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

type SiteInfoField = {
  id: string;
  label: string;
  multiline?: boolean;
  kind?: "boolean" | "number" | "url" | "stringList";
};

const SITE_INFO_GROUPS: Array<{ title: string; fields: SiteInfoField[] }> = [
  {
    title: "홈 질문창",
    fields: [
      { id: TYPING_EXAMPLES_ID, label: "타이핑 예시 (한 줄에 하나)", multiline: true, kind: "stringList" },
    ],
  },
  {
    title: "병원",
    fields: [
      { id: "common.brand.name", label: "병원명" },
      { id: "common.brand.nameEn", label: "영문명" },
      { id: "clinic.address.street", label: "도로명 주소" },
      { id: "clinic.address.detail", label: "상세 주소" },
      { id: "clinic.address.postalCode", label: "우편번호" },
      { id: "clinic.address.locality", label: "시·구" },
      { id: "clinic.address.region", label: "시·도" },
      { id: "clinic.address.country", label: "국가 코드" },
      { id: "common.clinic.phone", label: "전화" },
      { id: "home.location.lat", label: "위도", kind: "number" },
      { id: "home.location.lng", label: "경도", kind: "number" },
      { id: "clinic.showSpecialty", label: "진료과목 표시", kind: "boolean" },
    ],
  },
  {
    title: "진료시간",
    fields: [
      { id: "clinic.hours.monday", label: "월요일" },
      { id: "clinic.hours.tuesday", label: "화요일" },
      { id: "clinic.hours.wednesday", label: "수요일" },
      { id: "clinic.hours.thursday", label: "목요일" },
      { id: "clinic.hours.friday", label: "금요일" },
      { id: "clinic.hours.saturday", label: "토요일" },
      { id: "clinic.hours.sunday", label: "일요일" },
    ],
  },
  {
    title: "원장",
    fields: [
      { id: "doctor.name", label: "이름" },
      { id: "doctor.jobTitle", label: "직함" },
      { id: "doctor.careers", label: "경력 (한 줄에 하나)", multiline: true },
      { id: "doctor.education", label: "학력 (한 줄에 하나)", multiline: true },
      { id: "doctor.alumniOf", label: "출신 학교 (한 줄에 하나)", multiline: true },
      { id: "doctor.associations", label: "학회 (한 줄에 하나)", multiline: true },
      { id: "doctor.licenses", label: "자격·면허 (한 줄에 하나)", multiline: true },
      { id: "doctor.specialties", label: "전문 시술 (한 줄에 하나)", multiline: true },
      { id: "doctor.philosophy", label: "진료 철학", multiline: true },
      { id: "doctor.sameAs", label: "외부 프로필 (한 줄에 하나)", multiline: true },
    ],
  },
  {
    title: "외부 프로필 주소",
    fields: [
      { id: "common.quick.kakaoUrl", label: "카카오톡 상담 링크", kind: "url" },
      { id: "common.quick.reserveUrl", label: "예약 링크", kind: "url" },
      { id: "clinic.sameAs.naverPlace", label: "네이버 플레이스", kind: "url" },
      { id: "clinic.sameAs.kakaoMap", label: "카카오맵", kind: "url" },
      { id: "clinic.sameAs.googleMap", label: "구글 지도", kind: "url" },
      { id: "clinic.sameAs.website", label: "기존 홈페이지", kind: "url" },
      { id: "clinic.sameAs.youtube", label: "유튜브", kind: "url" },
      { id: "clinic.sameAs.instagram", label: "인스타그램", kind: "url" },
      { id: "clinic.sameAs.modoodoc", label: "모두닥", kind: "url" },
    ],
  },
  {
    title: "질문 접수",
    fields: [
      { id: "qna.consentText", label: "필수 수집·이용 동의 문구", multiline: true },
      { id: "qna.publicConsentText", label: "답변 공개 선택 동의 문구", multiline: true },
      { id: "qna.notice", label: "개인정보·진료 안내", multiline: true },
    ],
  },
  {
    title: "검색·공유",
    fields: [
      { id: "seo.home.title", label: "홈 제목" },
      { id: "seo.home.description", label: "홈 설명", multiline: true },
      { id: "seo.column.title", label: "칼럼 메인 제목" },
      { id: "seo.column.description", label: "칼럼 메인 설명", multiline: true },
      { id: "seo.doctor.title", label: "원장 프로필 제목" },
      { id: "seo.doctor.description", label: "원장 프로필 설명", multiline: true },
      { id: "seo.all.title", label: "전체 칼럼 제목" },
      { id: "seo.all.description", label: "전체 칼럼 설명", multiline: true },
      { id: "seo.verification.google", label: "Google 확인 코드" },
      { id: "seo.verification.naver", label: "Naver 확인 코드" },
      { id: "seo.verification.bing", label: "Bing 확인 코드" },
    ],
  },
];

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
    const desktop = desktopTransform(entry);
    const mobile = mobileTransform(entry);
    target.style.setProperty("--image-scale", String(desktop.zoom / 100));
    target.style.setProperty("--image-focus-x", `${desktop.x}%`);
    target.style.setProperty("--image-focus-y", `${desktop.y}%`);
    target.style.setProperty("--image-mobile-scale", String(mobile.zoom / 100));
    target.style.setProperty("--image-mobile-focus-x", `${mobile.x}%`);
    target.style.setProperty("--image-mobile-focus-y", `${mobile.y}%`);
    const hint = target.querySelector<HTMLElement>("[data-bg-edit-hint]");
    target.querySelectorAll("img, [data-edit-preview]").forEach((node) => node.remove());
    Array.from(target.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => node.remove());
    if (entry.src) {
      const image = document.createElement("img");
      image.src = entry.src;
      image.alt = entry.alt;
      image.dataset.editPreview = "true";
      image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${desktop.x}% ${desktop.y}%;transform:scale(${desktop.zoom / 100});transform-origin:${desktop.x}% ${desktop.y}%;`;
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
  const [siteInfoOpen, setSiteInfoOpen] = useState(false);
  const [siteDrafts, setSiteDrafts] = useState<Record<string, string>>({});
  const [undoStack, setUndoStack] = useState<HistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryItem[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const inlineEditor = useRef<HTMLDivElement>(null);

  useEffect(() => setEntries(content), [content]);

  useEffect(() => {
    if (!siteInfoOpen) return;
    const next: Record<string, string> = {};
    for (const group of SITE_INFO_GROUPS) {
      for (const field of group.fields) {
        next[field.id] = field.kind === "stringList" ? getTypingExamples(entries).join("\n") : getText(entries, field.id);
      }
    }
    setSiteDrafts(next);
  }, [entries, siteInfoOpen]);

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
    id: typeof HERO_SLIDES_ID | typeof EQUIPMENT_ITEMS_ID | typeof TYPING_EXAMPLES_ID,
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
    const withDesktop = {
      ...nextDraft,
      desktop: { x: nextDraft.focusX, y: nextDraft.focusY, zoom: nextDraft.zoom },
    };
    setDraft(withDesktop);
    if (selectedId) void saveEntry(selectedId, withDesktop);
  };

  const saveHistoryValue = async (id: string, value: EditorValue, before: EditorValue) => {
    if (Array.isArray(value)) return saveCollection(id as typeof HERO_SLIDES_ID | typeof EQUIPMENT_ITEMS_ID | typeof TYPING_EXAMPLES_ID, value, { record: false, before: before as SiteContentCollection });
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

  const saveSiteInfoField = (id: string) => {
    const field = SITE_INFO_GROUPS.flatMap((group) => group.fields).find((item) => item.id === id);
    if (field?.kind === "stringList") {
      const before = entries[id];
      if (!Array.isArray(before)) return;
      const next = (siteDrafts[id] ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
      void saveCollection(TYPING_EXAMPLES_ID, next, { before: before as SiteContentCollection }).then((saved) => {
        if (saved) router.refresh();
      });
      return;
    }
    const before = getEditableEntry(entries, id);
    if (!before || before.type !== "text") return;
    void saveEntry(id, { type: "text", value: siteDrafts[id] ?? "" }, { before }).then((saved) => {
      if (saved) router.refresh();
    });
  };

  return (
    <>
      <ImagePlacementEditor content={entries} />
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
      {siteInfoOpen ? (
        <aside className={styles.sitePanel} data-dev-editor aria-label="사이트 정보 편집">
          <div className={styles.sitePanelHeader}>
            <div><b>사이트 정보</b><small>화면·메타·구조화 데이터에 함께 반영됩니다.</small></div>
            <button type="button" onClick={() => setSiteInfoOpen(false)}>닫기</button>
          </div>
          <div className={styles.sitePanelBody}>
            {SITE_INFO_GROUPS.map((group) => (
              <fieldset key={group.title}>
                <legend>{group.title}</legend>
                {group.fields.map((field) => (
                  <label key={field.id}>
                    <span>{field.label}</span>
                    {field.kind === "boolean" ? (
                      <select
                        value={siteDrafts[field.id] ?? "false"}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setSiteDrafts((current) => ({ ...current, [field.id]: value }));
                          const before = getEditableEntry(entries, field.id);
                          if (before?.type === "text") void saveEntry(field.id, { type: "text", value }, { before }).then((saved) => {
                            if (saved) router.refresh();
                          });
                        }}
                      >
                        <option value="true">표시</option>
                        <option value="false">숨김</option>
                      </select>
                    ) : field.multiline ? (
                      <textarea
                        value={siteDrafts[field.id] ?? ""}
                        onChange={(event) => setSiteDrafts((current) => ({ ...current, [field.id]: event.currentTarget.value }))}
                        onBlur={() => saveSiteInfoField(field.id)}
                        rows={field.id.includes("philosophy") ? 4 : 3}
                      />
                    ) : (
                      <input
                        type={field.kind === "url" ? "url" : "text"}
                        inputMode={field.kind === "number" ? "decimal" : undefined}
                        value={siteDrafts[field.id] ?? ""}
                        onChange={(event) => setSiteDrafts((current) => ({ ...current, [field.id]: event.currentTarget.value }))}
                        onBlur={() => saveSiteInfoField(field.id)}
                      />
                    )}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </aside>
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
          <nav><Link href="/?edit=1">홈</Link><Link href="/column?edit=1">칼럼 메인</Link><Link href="/content-board">콘텐츠 슬라이드</Link></nav>
          <button type="button" onClick={() => void undo()} disabled={!undoStack.length}>되돌리기</button>
          <button type="button" onClick={() => void redo()} disabled={!redoStack.length}>다시하기</button>
          <button type="button" onClick={() => setSiteInfoOpen((current) => !current)}>사이트 정보</button>
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
            <input ref={fileInput} type="file" accept={selectedId.endsWith("signatureImage") ? "image/jpeg,image/png,image/webp,image/svg+xml" : "image/jpeg,image/png,image/webp"} hidden onChange={(event) => {
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
