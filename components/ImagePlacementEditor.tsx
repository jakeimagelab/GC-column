"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { getEditableEntry, type ImageContentEntry, type SiteContent } from "@/content/site-content-types";
import {
  desktopTransform,
  getImagePlacementMeta,
  mobileTransform,
  normalizePlacementTransform,
  type ImagePlacement,
  type PlacementTransform,
} from "@/lib/imagePlacement";
import styles from "./ImagePlacementEditor.module.css";

type Props = { content: SiteContent };
type ViewMode = "desktop" | "mobile";
type SelectedSlot = {
  slotId: string;
  target: HTMLElement;
  mode: ViewMode;
  desktop: PlacementTransform;
  mobile?: PlacementTransform;
};
type DropDraft = {
  target: HTMLElement;
  slotId: string;
  file: File;
  objectUrl: string;
  alt: string;
  existing: boolean;
  page: string;
  section: string;
  slotName: string;
  width?: number;
  height?: number;
  warning?: string;
};

const imageSelector = '[data-edit-id][data-edit-type="image"], [data-edit-id][data-edit-type="bgImage"]';

function pendingForSlot(placements: ImagePlacement[], slotId: string) {
  return [...placements].reverse().find((item) => item.slotId === slotId && item.status === "임시");
}

function placementFileUrl(placement: ImagePlacement) {
  return placement.kind === "사진"
    ? `/api/dev-image-placement?file=${encodeURIComponent(placement.fileName)}&v=${encodeURIComponent(placement.placedAt)}`
    : placement.sourceSrc ?? "";
}

function applyTransform(target: HTMLElement, desktop: PlacementTransform, mobile?: PlacementTransform) {
  const mobileValue = mobile ?? desktop;
  target.style.setProperty("--image-scale", String(desktop.zoom / 100));
  target.style.setProperty("--image-focus-x", `${desktop.x}%`);
  target.style.setProperty("--image-focus-y", `${desktop.y}%`);
  target.style.setProperty("--image-mobile-scale", String(mobileValue.zoom / 100));
  target.style.setProperty("--image-mobile-focus-x", `${mobileValue.x}%`);
  target.style.setProperty("--image-mobile-focus-y", `${mobileValue.y}%`);
}

function removePlacementPreview(target: HTMLElement) {
  target.querySelectorAll("[data-placement-preview]").forEach((node) => node.remove());
  delete target.dataset.placementPending;
}

function addPlacementPreview(target: HTMLElement, src: string, alt: string) {
  removePlacementPreview(target);
  if (!src) return;
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.dataset.placementPreview = "true";
  target.appendChild(image);
}

function fileDimensions(file: File) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => { resolve({}); URL.revokeObjectURL(url); };
    image.src = url;
  });
}

export function ImagePlacementEditor({ content }: Props) {
  const [placements, setPlacements] = useState<ImagePlacement[]>([]);
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [dropDraft, setDropDraft] = useState<DropDraft | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [layoutTick, setLayoutTick] = useState(0);
  const selectedRef = useRef<SelectedSlot | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; transform: PlacementTransform } | null>(null);

  selectedRef.current = selected;

  const refresh = useCallback(async () => {
    const response = await fetch("/api/dev-image-placement", { cache: "no-store" });
    const result = await response.json() as { placements?: ImagePlacement[]; error?: string };
    if (!response.ok) throw new Error(result.error || "배치표를 불러오지 못했습니다.");
    setPlacements(result.placements ?? []);
  }, []);

  const restoreSlot = useCallback((slotId: string, nextPlacements = placements) => {
    const target = document.querySelector<HTMLElement>(`[data-edit-id="${CSS.escape(slotId)}"]`);
    if (!target) return;
    removePlacementPreview(target);
    const entry = getEditableEntry(content, slotId);
    if (entry && entry.type !== "text") applyTransform(target, desktopTransform(entry), entry.mobile ? mobileTransform(entry) : undefined);
    const pending = pendingForSlot(nextPlacements, slotId);
    if (pending) {
      if (pending.kind === "사진") addPlacementPreview(target, placementFileUrl(pending), pending.alt);
      applyTransform(target, pending.desktop, pending.mobile);
      target.dataset.placementPending = pending.id;
    }
  }, [content, placements]);

  useEffect(() => { void refresh().catch((error) => setNotice(error.message)); }, [refresh]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>(imageSelector).forEach((target) => {
      const slotId = target.dataset.editId;
      if (slotId) restoreSlot(slotId, placements);
    });
    setLayoutTick((value) => value + 1);
  }, [placements, restoreSlot]);

  useEffect(() => {
    const update = () => setLayoutTick((value) => value + 1);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const selectTarget = useCallback((target: HTMLElement, mode: ViewMode = "desktop") => {
    const slotId = target.dataset.editId;
    if (!slotId) return;
    const entry = getEditableEntry(content, slotId);
    if (!entry || entry.type === "text") return;
    const pending = pendingForSlot(placements, slotId);
    setSelected({
      slotId,
      target,
      mode,
      desktop: pending?.desktop ?? desktopTransform(entry),
      mobile: pending?.mobile ?? entry.mobile,
    });
  }, [content, placements]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const origin = event.target as HTMLElement;
      if (origin.closest("[data-dev-editor]")) return;
      const target = origin.closest<HTMLElement>(imageSelector);
      if (target) selectTarget(target, selectedRef.current?.mode ?? "desktop");
    };
    const onDragOver = (event: DragEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(imageSelector);
      if (!target) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      target.dataset.placementDragover = "true";
    };
    const onDragLeave = (event: DragEvent) => {
      (event.target as HTMLElement).closest<HTMLElement>(imageSelector)?.removeAttribute("data-placement-dragover");
    };
    const onDrop = (event: DragEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(imageSelector);
      if (!target) return;
      event.preventDefault();
      target.removeAttribute("data-placement-dragover");
      const file = event.dataTransfer?.files[0];
      const slotId = target.dataset.editId;
      if (!file || !slotId) return;
      window.setTimeout(() => {
        if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
          setNotice("JPG, PNG, WebP 사진만 배치할 수 있습니다.");
          return;
        }
        const entry = getEditableEntry(content, slotId);
        if (!entry || entry.type === "text") return;
        const placement = pendingForSlot(placements, slotId);
        const meta = getImagePlacementMeta(slotId, target.dataset.placementName || entry.label);
        const objectUrl = URL.createObjectURL(file);
        addPlacementPreview(target, objectUrl, entry.alt);
        applyTransform(target, { x: 50, y: 50, zoom: 100 });
        setDropDraft({
          target,
          slotId,
          file,
          objectUrl,
          alt: placement?.alt ?? entry.alt,
          existing: Boolean(entry.src || placement),
          page: target.dataset.placementPage || meta.page,
          section: target.dataset.placementSection || meta.section,
          slotName: target.dataset.placementName || meta.slotName,
        });
        void fileDimensions(file).then(({ width, height }) => {
          const rect = target.getBoundingClientRect();
          const imageRatio = width && height ? width / height : 0;
          const slotRatio = rect.width && rect.height ? rect.width / rect.height : 0;
          const mismatch = imageRatio && slotRatio ? Math.max(imageRatio / slotRatio, slotRatio / imageRatio) : 1;
          setDropDraft((current) => current?.objectUrl === objectUrl ? {
            ...current,
            width,
            height,
            warning: mismatch > 1.6 ? "사진 비율이 자리와 크게 달라 일부가 많이 잘릴 수 있습니다." : undefined,
          } : current);
        });
      }, 0);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("dragover", onDragOver, true);
    document.addEventListener("dragleave", onDragLeave, true);
    document.addEventListener("drop", onDrop, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dragover", onDragOver, true);
      document.removeEventListener("dragleave", onDragLeave, true);
      document.removeEventListener("drop", onDrop, true);
    };
  }, [content, placements, selectTarget]);

  const currentTransform = useCallback((value: SelectedSlot) => value.mode === "mobile" ? value.mobile ?? value.desktop : value.desktop, []);

  const changeTransform = useCallback((change: (value: PlacementTransform) => PlacementTransform) => {
    setSelected((current) => {
      if (!current) return current;
      const nextTransform = normalizePlacementTransform(change(currentTransform(current)));
      const next = current.mode === "mobile" ? { ...current, mobile: nextTransform } : { ...current, desktop: nextTransform };
      applyTransform(next.target, next.desktop, next.mobile);
      return next;
    });
  }, [currentTransform]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const current = selectedRef.current;
      if (!current || event.button !== 0 || (event.target as HTMLElement).closest("[data-dev-editor]")) return;
      const target = (event.target as HTMLElement).closest<HTMLElement>(imageSelector);
      if (target !== current.target || !(target.querySelector("img") || target.querySelector("[data-placement-preview]"))) return;
      event.preventDefault();
      const transform = current.mode === "mobile" ? current.mobile ?? current.desktop : current.desktop;
      dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, transform };
      current.target.dataset.placementAdjusting = "true";
    };
    const onPointerMove = (event: PointerEvent) => {
      const current = selectedRef.current;
      const drag = dragRef.current;
      if (!current || !drag || drag.pointerId !== event.pointerId) return;
      const rect = current.target.getBoundingClientRect();
      changeTransform(() => ({
        ...drag.transform,
        x: drag.transform.x - (event.clientX - drag.startX) / Math.max(rect.width, 1) * 100,
        y: drag.transform.y - (event.clientY - drag.startY) / Math.max(rect.height, 1) * 100,
      }));
    };
    const onPointerUp = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      selectedRef.current?.target.removeAttribute("data-placement-adjusting");
      dragRef.current = null;
    };
    const onWheel = (event: WheelEvent) => {
      const current = selectedRef.current;
      if (!current || !(event.target instanceof Node) || !current.target.contains(event.target)) return;
      event.preventDefault();
      changeTransform((value) => ({ ...value, zoom: value.zoom + (event.deltaY < 0 ? 5 : -5) }));
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    document.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
      document.removeEventListener("wheel", onWheel, true);
    };
  }, [changeTransform]);

  useEffect(() => {
    document.body.classList.toggle("devPlacementMobilePreview", selected?.mode === "mobile");
    return () => document.body.classList.remove("devPlacementMobilePreview");
  }, [selected?.mode]);

  const cancelDrop = () => {
    if (!dropDraft) return;
    URL.revokeObjectURL(dropDraft.objectUrl);
    restoreSlot(dropDraft.slotId);
    setDropDraft(null);
  };

  const saveDrop = async () => {
    if (!dropDraft) return;
    setSaving(true);
    setNotice("");
    const form = new FormData();
    form.set("file", dropDraft.file);
    form.set("metadata", JSON.stringify({
      slotId: dropDraft.slotId,
      page: dropDraft.page,
      section: dropDraft.section,
      slotName: dropDraft.slotName,
      alt: dropDraft.alt,
      warning: dropDraft.warning,
      desktop: { x: 50, y: 50, zoom: 100 },
    }));
    try {
      const response = await fetch("/api/dev-image-placement", { method: "POST", body: form });
      const result = await response.json() as { placement?: ImagePlacement; error?: string };
      if (!response.ok || !result.placement) throw new Error(result.error || "임시 배치 저장에 실패했습니다.");
      URL.revokeObjectURL(dropDraft.objectUrl);
      const next = [...placements.filter((item) => item.status !== "임시" || item.slotId !== dropDraft.slotId), result.placement];
      setPlacements(next);
      setDropDraft(null);
      setSelected({ slotId: result.placement.slotId, target: dropDraft.target, mode: "desktop", desktop: result.placement.desktop });
      setNotice(dropDraft.alt.trim() ? "임시 배치가 저장되었습니다." : "임시 배치가 저장되었습니다. 사진 설명이 필요합니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "임시 배치 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const cancelPlacement = async (placement: ImagePlacement) => {
    setSaving(true);
    try {
      const response = await fetch("/api/dev-image-placement", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: placement.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "임시 배치를 취소하지 못했습니다.");
      const next = placements.filter((item) => item.id !== placement.id);
      setPlacements(next);
      restoreSlot(placement.slotId, next);
      if (selected?.slotId === placement.slotId) setSelected(null);
      setNotice("임시 배치를 취소했습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "임시 배치를 취소하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const saveAdjustment = async () => {
    if (!selected) return;
    const entry = getEditableEntry(content, selected.slotId);
    if (!entry || entry.type === "text") return;
    const pending = pendingForSlot(placements, selected.slotId);
    setSaving(true);
    try {
      const response = await fetch("/api/dev-image-placement", {
        method: pending ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending ? {
          id: pending.id,
          desktop: selected.desktop,
          mobile: selected.mobile ?? null,
        } : {
          slotId: selected.slotId,
          ...getImagePlacementMeta(selected.slotId, entry.label),
          sourceSrc: entry.src,
          alt: entry.alt,
          desktop: selected.desktop,
          mobile: selected.mobile,
        }),
      });
      const result = await response.json() as { placement?: ImagePlacement; error?: string };
      if (!response.ok || !result.placement) throw new Error(result.error || "조정값 저장에 실패했습니다.");
      const next = [...placements.filter((item) => item.status !== "임시" || item.slotId !== selected.slotId), result.placement];
      setPlacements(next);
      setNotice("위치·크기 조정값을 배치표에 저장했습니다.");
      selected.target.removeAttribute("data-placement-adjusting");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "조정값 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const pending = useMemo(() => placements.filter((item) => item.status === "임시"), [placements]);
  const selectedTransform = selected ? currentTransform(selected) : null;
  const selectedPlacement = selected ? pendingForSlot(placements, selected.slotId) : undefined;
  const selectedEntry = selected ? getEditableEntry(content, selected.slotId) : undefined;
  const toolRect = selected?.target.getBoundingClientRect();
  const qualityWarning = Boolean(
    selectedPlacement?.width && selectedPlacement.height && toolRect && selectedTransform &&
    (selectedPlacement.width < toolRect.width * selectedTransform.zoom / 100 || selectedPlacement.height < toolRect.height * selectedTransform.zoom / 100),
  );

  const slotCancelPortals = typeof document === "undefined" ? [] : pending.flatMap((placement) => {
    const target = document.querySelector<HTMLElement>(`[data-edit-id="${CSS.escape(placement.slotId)}"]`);
    if (!target) return [];
    return [createPortal(
      <button type="button" className={styles.slotCancel} data-dev-editor aria-label={`${placement.slotName} 임시 배치 취소`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void cancelPlacement(placement); }}>×</button>,
      target,
      placement.id,
    )];
  });

  void layoutTick;

  return (
    <>
      {slotCancelPortals}
      <aside className={styles.placementBadge} data-dev-editor>
        <button type="button" onClick={() => setListOpen((value) => !value)}><b>임시 배치 {pending.length}건</b><span>{listOpen ? "접기" : "목록"}</span></button>
        {listOpen ? <div className={styles.placementList}>
          {placements.length ? [...placements].reverse().slice(0, 40).map((placement) => (
            <article key={placement.id}>
              <button type="button" onClick={() => {
                const target = document.querySelector<HTMLElement>(`[data-edit-id="${CSS.escape(placement.slotId)}"]`);
                if (target) { target.scrollIntoView({ block: "center", behavior: "smooth" }); selectTarget(target); }
              }}>
                <b>{placement.page} · {placement.section}</b>
                <span>{placement.slotName}</span>
                <small>{placement.fileName}</small>
                <small className={!placement.alt.trim() ? styles.needsAlt : ""}>{placement.alt.trim() || "설명 필요"} · {placement.status}</small>
              </button>
              {placement.status === "임시" ? <button type="button" aria-label="배치 취소" onClick={() => void cancelPlacement(placement)}>×</button> : null}
            </article>
          )) : <p>아직 배치한 사진이 없습니다.</p>}
        </div> : null}
      </aside>

      {selected && selectedTransform && toolRect ? (
        <div
          className={styles.slotTools}
          data-dev-editor
          style={{ top: Math.max(8, toolRect.top - 48), left: Math.max(8, Math.min(toolRect.left, window.innerWidth - 530)) } as CSSProperties}
        >
          <div className={styles.viewSwitch}><button type="button" className={selected.mode === "desktop" ? styles.active : ""} onClick={() => setSelected({ ...selected, mode: "desktop" })}>PC</button><button type="button" className={selected.mode === "mobile" ? styles.active : ""} onClick={() => setSelected({ ...selected, mode: "mobile" })}>모바일</button></div>
          <button type="button" aria-label="축소" onClick={() => changeTransform((value) => ({ ...value, zoom: value.zoom - 10 }))}>−</button>
          <output>{selectedTransform.zoom}%</output>
          <button type="button" aria-label="확대" onClick={() => changeTransform((value) => ({ ...value, zoom: value.zoom + 10 }))}>+</button>
          <button type="button" onClick={() => changeTransform((value) => ({ ...value, x: 50, y: 50 }))}>가운데 맞춤</button>
          <button type="button" onClick={() => changeTransform(() => ({ x: 50, y: 50, zoom: 100 }))}>초기화</button>
          <button type="button" className={styles.done} disabled={saving || (!selectedPlacement && (!selectedEntry || selectedEntry.type === "text" || !selectedEntry.src))} onClick={() => void saveAdjustment()}>완료</button>
          {qualityWarning ? <span className={styles.qualityWarning}>원본 해상도가 부족해 화질이 떨어질 수 있습니다.</span> : null}
        </div>
      ) : null}

      {dropDraft ? <div className={styles.dropDialog} data-dev-editor role="dialog" aria-modal="true" aria-label="사진 임시 배치">
        <section>
          <span>PHOTO PLACEMENT</span>
          <h2>{dropDraft.existing ? "이 사진으로 교체할까요?" : "사진 설명을 입력해 주세요"}</h2>
          <p>{dropDraft.page} · {dropDraft.section} · {dropDraft.slotName}<br />{dropDraft.file.name}</p>
          {dropDraft.warning ? <p className={styles.dropWarning}>{dropDraft.warning}</p> : null}
          <label>사진 설명(alt)<input autoFocus value={dropDraft.alt} onChange={(event) => setDropDraft({ ...dropDraft, alt: event.currentTarget.value })} placeholder="비워두면 설명 필요로 표시됩니다" /></label>
          <div><button type="button" onClick={cancelDrop}>취소</button><button type="button" disabled={saving} onClick={() => void saveDrop()}>{saving ? "저장 중…" : dropDraft.existing ? "교체해 임시 저장" : "임시 저장"}</button></div>
        </section>
      </div> : null}

      {notice ? <div className={styles.notice} data-dev-editor role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div> : null}
    </>
  );
}
