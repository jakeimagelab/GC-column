"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./ScrollWorldPreview.module.css";

export type ScrollWorldScene = {
  id: string;
  step: string;
  eyebrow: string;
  title: string;
  body: string;
  kind: "arrival" | "director" | "vision" | "equipment" | "column" | "gallery" | "location";
  accent: string;
  tags: string[];
};

type CameraMode = "walkthrough" | "fly" | "isometric";
type ScrollWorldPreviewProps = { scenes: ScrollWorldScene[] };

const cameraLabels: Record<CameraMode, string> = {
  walkthrough: "연속 워크스루",
  fly: "공간을 날아다니기",
  isometric: "고정 아이소메트릭",
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function ScrollWorldPreview({ scenes }: ScrollWorldPreviewProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [camera, setCamera] = useState<CameraMode>("walkthrough");
  const [ready, setReady] = useState(false);

  const updateProgress = useCallback(() => {
    frameRef.current = 0;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const rect = root.getBoundingClientRect();
    const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / scrollable);
    const sceneProgress = progress * Math.max(1, scenes.length - 1);
    const nextIndex = Math.min(scenes.length - 1, Math.max(0, Math.round(sceneProgress)));

    stage.style.setProperty("--world-progress", progress.toFixed(4));
    stage.style.setProperty("--scene-progress", sceneProgress.toFixed(4));
    stage.style.setProperty("--active-scene", String(nextIndex));

    stage.querySelectorAll<HTMLElement>("[data-world-scene]").forEach((scene, index) => {
      const distance = index - sceneProgress;
      const proximity = clamp(1 - Math.abs(distance));
      scene.style.setProperty("--scene-distance", distance.toFixed(4));
      scene.style.setProperty("--scene-proximity", proximity.toFixed(4));
    });

    if (nextIndex !== activeRef.current) {
      activeRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  }, [scenes.length]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const requestUpdate = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(updateProgress);
    };

    setReady(true);
    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [updateProgress]);

  const goToScene = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const top = window.scrollY + root.getBoundingClientRect().top;
    const distance = Math.max(1, root.offsetHeight - window.innerHeight);
    const target = top + distance * (index / Math.max(1, scenes.length - 1));
    window.scrollTo({ top: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const current = scenes[activeIndex] ?? scenes[0];

  return (
    <main className={styles.page}>
      <section
        ref={rootRef}
        className={`${styles.scrollRoot} ${ready ? styles.ready : ""}`}
        data-camera={camera}
        style={{ "--scene-count": scenes.length } as CSSProperties}
      >
        <div ref={stageRef} className={styles.stage}>
          <header className={styles.header}>
            <Link href="/" className={styles.brand} aria-label="글로리의원 홈으로 이동">
              <span>G</span>
              <b>글로리의원</b>
            </Link>
            <div className={styles.testLabel}><i /> SCROLL WORLD · FREE PREVIS</div>
            <Link href="/" className={styles.exit}>원래 사이트로 →</Link>
          </header>

          <div className={styles.viewport} aria-live="polite">
            <div className={styles.world}>
              {scenes.map((scene, index) => (
                <article
                  className={styles.scene}
                  data-world-scene
                  data-kind={scene.kind}
                  aria-hidden="true"
                  style={{ "--scene-index": index, "--scene-accent": scene.accent } as CSSProperties}
                  key={scene.id}
                >
                  <div className={styles.floor} />
                  <div className={styles.roomShell}>
                    <div className={styles.backWall} />
                    <div className={styles.sideWall} />
                    <div className={styles.ceilingLine} />
                    <SceneModel scene={scene} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.copy} key={current.id}>
            <span>{current.step} · {current.eyebrow}</span>
            <h1>{current.title}</h1>
            <p>{current.body}</p>
            <div>{current.tags.filter(Boolean).slice(0, 3).map((tag) => <small key={tag}>{tag}</small>)}</div>
          </div>

          <aside className={styles.modePanel} aria-label="카메라 테스트 모드">
            <span>카메라 테스트</span>
            {Object.entries(cameraLabels).map(([value, label]) => (
              <button
                type="button"
                aria-pressed={camera === value}
                onClick={() => setCamera(value as CameraMode)}
                key={value}
              >
                {label}
              </button>
            ))}
          </aside>

          <nav className={styles.route} aria-label="장면 이동">
            <span className={styles.routeLine}><i style={{ transform: `scaleX(${activeIndex / Math.max(1, scenes.length - 1)})` }} /></span>
            {scenes.map((scene, index) => (
              <button
                type="button"
                className={index === activeIndex ? styles.activeRoute : ""}
                aria-current={index === activeIndex ? "step" : undefined}
                onClick={() => goToScene(index)}
                key={scene.id}
              >
                <i />
                <span>{scene.step}</span>
              </button>
            ))}
          </nav>

          <div className={styles.scrollHint}><span /> 스크롤해서 공간 이동</div>
          <div className={styles.progressNumber}>{String(activeIndex + 1).padStart(2, "0")}<span>/</span>{String(scenes.length).padStart(2, "0")}</div>
        </div>
      </section>

      <section className={styles.noMotionFallback} aria-label="글로리의원 장면 목록">
        {scenes.map((scene) => <article key={scene.id}><span>{scene.step} · {scene.eyebrow}</span><h2>{scene.title}</h2><p>{scene.body}</p></article>)}
      </section>
    </main>
  );
}

function SceneModel({ scene }: { scene: ScrollWorldScene }) {
  if (scene.kind === "director") {
    return <div className={styles.directorModel}><div className={styles.portrait}><span>DIRECTOR</span></div><div className={styles.desk}><i /><i /><i /></div></div>;
  }
  if (scene.kind === "vision") {
    return <div className={styles.visionModel}><span>VISION</span><i /><blockquote>GLORY<br />CLINIC</blockquote></div>;
  }
  if (scene.kind === "equipment") {
    return <div className={styles.equipmentModel}>{[0, 1, 2, 3].map((item) => <div key={item}><i /><span /></div>)}</div>;
  }
  if (scene.kind === "column") {
    return <div className={styles.columnModel}>{["01", "02", "03"].map((item) => <div key={item}><i>{item}</i><span /><b /></div>)}</div>;
  }
  if (scene.kind === "gallery") {
    return <div className={styles.galleryModel}><div /><div /><div /><span>GLORY SPACE</span></div>;
  }
  if (scene.kind === "location") {
    return <div className={styles.locationModel}><div className={styles.mapGrid} /><i>G</i><span>언주역<br />글로리의원</span></div>;
  }
  return <div className={styles.arrivalModel}><div className={styles.portal}><span>G</span></div><i /><b>GLORY CLINIC</b></div>;
}
