"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { isVisualEditingMode } from "@/lib/motion";
import styles from "./ColumnTransitionOverlay.module.css";

type ColumnNavigateDetail = { href?: string };
type TransitionDirection = "toColumn" | "toHome";
type TransitionPhase = "idle" | "sliding" | "arrived" | "covering" | "collapsing" | "reduced";
type StoredRect = { top:number; left:number; width:number; height:number; viewportWidth:number; viewportHeight:number };

const ORIGIN_KEY = "glory:column-transition-origin";
const SLIDE_DURATION = 850;
const SLIDE_DURATION_MOBILE = 640;
const ARRIVAL_SEAM_DURATION = 120;
const HOME_COVER_DURATION = 350;
const HOME_COLLAPSE_DURATION = 700;
const REDUCED_DURATION = 200;
const ROUTE_TIMEOUT = 3200;

function rectFromElement(element:Element | null):StoredRect {
  const rect = element?.getBoundingClientRect();
  if (!rect || rect.width < 2 || rect.height < 2) {
    return { top:window.innerHeight*.46, left:window.innerWidth*.46, width:window.innerWidth*.08, height:window.innerHeight*.08, viewportWidth:window.innerWidth, viewportHeight:window.innerHeight };
  }
  return { top:rect.top, left:rect.left, width:rect.width, height:rect.height, viewportWidth:window.innerWidth, viewportHeight:window.innerHeight };
}

function storedOrigin() {
  try {
    const value = JSON.parse(sessionStorage.getItem(ORIGIN_KEY) ?? "") as StoredRect;
    if ([value.top,value.left,value.width,value.height,value.viewportWidth,value.viewportHeight].every(Number.isFinite)) {
      const scaleX = window.innerWidth / Math.max(value.viewportWidth,1);
      const scaleY = window.innerHeight / Math.max(value.viewportHeight,1);
      return { top:value.top*scaleY, left:value.left*scaleX, width:value.width*scaleX, height:value.height*scaleY, viewportWidth:window.innerWidth, viewportHeight:window.innerHeight };
    }
  } catch {
    // The remembered home card is optional.
  }
  return rectFromElement(null);
}

function originStyle(rect:StoredRect):CSSProperties {
  return {
    "--column-origin-top":`${Math.max(0,rect.top)}px`,
    "--column-origin-right":`${Math.max(0,window.innerWidth-rect.left-rect.width)}px`,
    "--column-origin-bottom":`${Math.max(0,window.innerHeight-rect.top-rect.height)}px`,
    "--column-origin-left":`${Math.max(0,rect.left)}px`,
    "--column-origin-x":`${Math.max(0,rect.left+rect.width/2)}px`,
    "--column-origin-y":`${Math.max(0,rect.top+rect.height/2)}px`,
  } as CSSProperties;
}

export function ColumnTransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [href,setHref] = useState("");
  const [direction,setDirection] = useState<TransitionDirection>("toColumn");
  const [phase,setPhase] = useState<TransitionPhase>("idle");
  const [origin,setOrigin] = useState<StoredRect | null>(null);
  const targetPathRef = useRef("");
  const expansionDoneRef = useRef(false);
  const routeDoneRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const transitioningRef = useRef(false);

  const later = useCallback((callback:()=>void,delay:number) => {
    const timer = window.setTimeout(callback,delay);
    timersRef.current.push(timer);
  },[]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  },[]);

  const finish = useCallback(() => {
    clearTimers();
    transitioningRef.current = false;
    targetPathRef.current = "";
    expansionDoneRef.current = false;
    routeDoneRef.current = false;
    setHref("");
    setOrigin(null);
    setPhase("idle");
  },[clearTimers]);

  const revealColumn = useCallback(() => {
    if (!expansionDoneRef.current || !routeDoneRef.current) return;
    setPhase("arrived");
    later(finish,ARRIVAL_SEAM_DURATION);
  },[finish,later]);

  const start = useCallback((nextHref:string,nextDirection:TransitionDirection,source?:Element | null) => {
    if (transitioningRef.current || isVisualEditingMode()) return;
    const url = new URL(nextHref,window.location.origin);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextOrigin = nextDirection === "toColumn" ? rectFromElement(source ?? null) : storedOrigin();
    transitioningRef.current = true;
    targetPathRef.current = url.pathname;
    routeDoneRef.current = false;
    expansionDoneRef.current = false;
    setHref(`${url.pathname}${url.search}${url.hash}`);
    setDirection(nextDirection);
    setOrigin(nextOrigin);
    if (nextDirection === "toColumn") {
      try { sessionStorage.setItem(ORIGIN_KEY,JSON.stringify(nextOrigin)); } catch { /* optional */ }
    }
    if (reduceMotion) {
      setPhase("reduced");
      router.push(`${url.pathname}${url.search}${url.hash}`);
      later(finish,REDUCED_DURATION);
      return;
    }
    if (nextDirection === "toColumn") {
      const duration = window.matchMedia("(max-width: 640px)").matches ? SLIDE_DURATION_MOBILE : SLIDE_DURATION;
      setPhase("sliding");
      // Grow the magazine cover from the clicked card. Once the cover fully
      // fills the viewport, swap the route behind the identical brown surface.
      later(() => {
        expansionDoneRef.current = true;
        router.push(`${url.pathname}${url.search}${url.hash}`);
      },duration);
    } else {
      // Intentionally not the forward animation in reverse: first dissolve the
      // column into a full cover, then fold the cover into the remembered card.
      setPhase("covering");
      later(() => router.push(`${url.pathname}${url.search}${url.hash}`),HOME_COVER_DURATION);
    }
    later(finish,ROUTE_TIMEOUT);
  },[finish,later,router]);

  useEffect(() => {
    router.prefetch("/column");
    router.prefetch("/");
    const onClick = (event:MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href,window.location.href);
      if (url.origin !== window.location.origin) return;
      const currentPath = window.location.pathname;
      const nextDirection = currentPath === "/" && url.pathname.startsWith("/column") ? "toColumn"
        : currentPath.startsWith("/column") && url.pathname === "/" ? "toHome" : null;
      if (!nextDirection) return;
      const markedOrigin = anchor.querySelector<HTMLElement>("[data-column-transition-origin]")
        ?? anchor.closest<HTMLElement>("[data-column-transition-origin]") ?? anchor;
      event.preventDefault();
      start(`${url.pathname}${url.search}${url.hash}`,nextDirection,markedOrigin);
    };
    const onNavigate = (event:Event) => {
      const detail = (event as CustomEvent<ColumnNavigateDetail>).detail;
      if (window.location.pathname !== "/" || !detail?.href?.startsWith("/column")) return;
      event.preventDefault();
      start(detail.href,"toColumn",null);
    };
    document.addEventListener("click",onClick,true);
    window.addEventListener("glory:column-navigate",onNavigate);
    return () => {
      document.removeEventListener("click",onClick,true);
      window.removeEventListener("glory:column-navigate",onNavigate);
    };
  },[router,start]);

  useEffect(() => {
    if (phase === "idle" || !targetPathRef.current || pathname !== targetPathRef.current) return;
    routeDoneRef.current = true;
    if (direction === "toColumn") revealColumn();
    else if (direction === "toHome" && phase === "covering") {
      setPhase("collapsing");
      later(finish,HOME_COLLAPSE_DURATION);
    }
  },[direction,finish,later,pathname,phase,revealColumn]);

  useEffect(() => {
    const root = document.documentElement;
    const originProperties = ["--column-origin-x","--column-origin-y"] as const;
    if (origin) {
      root.style.setProperty("--column-origin-x",`${Math.max(0,origin.left+origin.width/2)}px`);
      root.style.setProperty("--column-origin-y",`${Math.max(0,origin.top+origin.height/2)}px`);
    } else {
      originProperties.forEach((property) => root.style.removeProperty(property));
    }
    if (phase === "idle") {
      delete root.dataset.columnTransition;
      delete root.dataset.columnTransitionDirection;
      delete root.dataset.columnTransitionPhase;
      return;
    }
    root.dataset.columnTransition = phase === "arrived" ? "arrived" : "active";
    root.dataset.columnTransitionDirection = direction === "toColumn" ? "to-column" : "to-home";
    root.dataset.columnTransitionPhase = phase;
  },[direction,origin,phase]);

  useEffect(() => () => {
    clearTimers();
    delete document.documentElement.dataset.columnTransition;
    delete document.documentElement.dataset.columnTransitionDirection;
    delete document.documentElement.dataset.columnTransitionPhase;
    document.documentElement.style.removeProperty("--column-origin-x");
    document.documentElement.style.removeProperty("--column-origin-y");
  },[clearTimers]);

  if (phase === "idle" || !href || !origin || typeof document === "undefined") return null;
  return createPortal(
    <div className={`${styles.layer} ${styles[direction]} ${styles[phase]}`} style={originStyle(origin)} role="status" aria-live="polite" aria-label={direction === "toColumn" ? "원장 칼럼으로 이동 중" : "홈페이지로 이동 중"}>
      <span className={styles.surface} aria-hidden="true" />
    </div>,
    document.body,
  );
}
