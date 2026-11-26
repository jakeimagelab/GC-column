"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getConcernItems, getEquipmentItems, getHeroSlides, getImage, getText, getTypingExamples, getVisionPrinciples, type SiteContent } from "@/content/site-content-types";
import { getTreatment, isTreatmentPageVisible } from "@/content/treatments";
import { getTreatmentDetail } from "@/content/treatments/index";
import { ClinicOpenStatus } from "./ClinicOpenStatus";
import { FooterPolicyLinks } from "./FooterPolicyLinks";
import { ColumnHeader } from "./ColumnHeader";
import { getSuggestions, SearchAutocomplete, type SearchSuggestion } from "./SearchAutocomplete";
import type { HomeSearchColumn } from "./HomeQuestionSearch";
import styles from "./HomeMobile.module.css";

export type MobileHomeFeature = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  image: string;
};

export type MobileHomeQuestion = {
  q: string;
  a: string;
  href: string;
};

type HomeMobileProps = {
  content: SiteContent;
  columns: HomeSearchColumn[];
  feature: MobileHomeFeature | null;
  questions: MobileHomeQuestion[];
  answerCount: number;
  naverUrl: string;
  kakaoMapUrl: string;
  googleUrl: string;
  consultKakaoUrl: string;
  weekdayHours: string;
  saturdayHours: string;
};

type MapPoint = [number, number];

const categoryCards = [
  { name: "리프팅", count: "9", description: "써마지FLX · 울쎄라피프라임 · 온다 외", href: "/column/category/lifting" },
  { name: "색소·모공", count: "5", description: "큐어젯 · 레블라이트SI · 셀렉IPL 외", href: "/column/category/pigment" },
  { name: "주사시술", count: "4", description: "줄기세포주사 · 보톡스 · 필러 외", href: "/column/category/injection" },
  { name: "스페셜필러", count: "4", description: "목주름 · 손등 · 눈위·눈밑 · 귓볼", href: "/column/category/filler" },
];

const equipmentOrder = ["onda", "thermage-flx", "ulthera-prime", "titanium", "xerf", "tuneface", "shurink", "oligio"];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

function delay(value: number) {
  return { "--d": `${value}s` } as CSSProperties;
}

function lines(value: string) {
  return value.split("\n").map((line, index, list) => <span key={`${line}-${index}`}>{line}{index < list.length - 1 ? <br /> : null}</span>);
}

export function HomeMobile({
  content,
  columns,
  feature,
  questions,
  answerCount,
  naverUrl,
  kakaoMapUrl,
  googleUrl,
  consultKakaoUrl,
  weekdayHours,
  saturdayHours,
}: HomeMobileProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const stickySearchRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const signatureRef = useRef<HTMLSpanElement>(null);
  const principleWorldRef = useRef<HTMLDivElement>(null);
  const principleStickyRef = useRef<HTMLDivElement>(null);
  const principleTrackRef = useRef<HTMLDivElement>(null);
  const facilityRef = useRef<HTMLElement>(null);
  const facilityStickyRef = useRef<HTMLDivElement>(null);
  const facilityStageRef = useRef<HTMLDivElement>(null);
  const facilityTrackRef = useRef<HTMLDivElement>(null);
  const facilityMapRef = useRef<HTMLDivElement>(null);
  const facilityMapImageRef = useRef<HTMLImageElement>(null);
  const exteriorPhotoRef = useRef<HTMLDivElement>(null);
  const facilityTitleRef = useRef<HTMLDivElement>(null);
  const locationTitleRef = useRef<HTMLDivElement>(null);
  const facilityCounterRef = useRef<HTMLSpanElement>(null);
  const facilityProgressRef = useRef<HTMLElement>(null);
  const mapHintRef = useRef<HTMLSpanElement>(null);
  const composingRef = useRef(false);
  const [query, setQuery] = useState("");
  const [typingText, setTypingText] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [careersOpen, setCareersOpen] = useState(false);

  const slides = getHeroSlides(content);
  const hero = slides[0];
  const concernItems = getConcernItems(content);
  const principles = getVisionPrinciples(content);
  const careers = [0, 1, 2, 3, 4, 5].map((index) => getText(content, `home.doctor.career.${index}`));
  const equipment = useMemo(() => {
    const items = getEquipmentItems(content);
    return equipmentOrder.map((id) => items.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [content]);
  const typingExamples = useMemo(() => getTypingExamples(content), [content]);
  const popularQuestions = [0, 1, 2].map((index) => getText(content, `home.question.popular.${index}`));
  const suggestionIndex = useMemo<SearchSuggestion[]>(() => columns.flatMap((column) => [
    { id: `column-${column.slug}`, type: "column" as const, label: column.title, href: `/column/${column.slug}` },
    ...column.faqs.map((faq) => ({ id: `faq-${column.slug}-${faq.id}`, type: "faq" as const, label: faq.q, href: `/column/${column.slug}#${faq.id}` })),
  ]), [columns]);
  const suggestions = useMemo(() => getSuggestions(suggestionIndex, query), [query, suggestionIndex]);
  const suggestionsOpen = inputFocused && suggestions.length > 0;

  const gallery = [
    { key: "lounge", name: "병원 전경" },
    { key: "laser", name: "리셉션" },
    { key: "consult", name: "대기실" },
    { key: "powder", name: "레이저실" },
    { key: "treatment", name: "원장실" },
    { key: "exterior", name: "건물 외관" },
  ].map((item) => ({ ...item, image: getImage(content, `home.gallery.${item.key}`) }));
  const mapImage = getImage(content, "home.location.map");
  const phone = getText(content, "common.clinic.phone");
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setInputFocused(false);
    router.push(suggestion.href);
  };

  const submitQuestion = (event?: FormEvent) => {
    event?.preventDefault();
    const chosen = activeSuggestion >= 0 ? suggestions[activeSuggestion] : suggestions[0];
    if (chosen) {
      selectSuggestion(chosen);
      return;
    }
    const trimmed = query.trim();
    if (trimmed) router.push(`/column/all?q=${encodeURIComponent(trimmed)}`);
    else questionInputRef.current?.focus();
  };

  const handleQuestionKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestionsOpen) {
      event.preventDefault();
      setActiveSuggestion((value) => (value + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestionsOpen) {
      event.preventDefault();
      setActiveSuggestion((value) => value <= 0 ? suggestions.length - 1 : value - 1);
    } else if (event.key === "Escape") {
      setInputFocused(false);
    } else if (event.key === "Enter" && !composingRef.current) {
      event.preventDefault();
      submitQuestion();
    }
  };

  useEffect(() => {
    if (query || inputFocused || !typingExamples.length) {
      setTypingText("");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTypingText(typingExamples[0] ?? "");
      return;
    }
    let exampleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let wait = 0;
    const timer = window.setInterval(() => {
      if (wait > 0) {
        wait -= 1;
        return;
      }
      const word = typingExamples[exampleIndex] ?? "";
      if (!deleting) {
        characterIndex += 1;
        if (characterIndex >= word.length) {
          deleting = true;
          wait = 22;
        }
      } else {
        characterIndex -= 1;
        if (characterIndex <= 0) {
          deleting = false;
          exampleIndex = (exampleIndex + 1) % typingExamples.length;
          wait = 4;
        }
      }
      setTypingText(word.slice(0, Math.max(0, characterIndex)));
    }, 80);
    return () => window.clearInterval(timer);
  }, [inputFocused, query, typingExamples]);

  useEffect(() => {
    const root = rootRef.current;
    const heroImage = heroImageRef.current;
    const heroCopy = heroCopyRef.current;
    const questionCard = questionCardRef.current;
    const stickySearch = stickySearchRef.current;
    const bottomBar = bottomBarRef.current;
    const count = countRef.current;
    const signature = signatureRef.current;
    const principleWorld = principleWorldRef.current;
    const principleSticky = principleStickyRef.current;
    const principleTrack = principleTrackRef.current;
    const facility = facilityRef.current;
    const facilitySticky = facilityStickyRef.current;
    const facilityStage = facilityStageRef.current;
    const facilityTrack = facilityTrackRef.current;
    const facilityMap = facilityMapRef.current;
    const mapImageElement = facilityMapImageRef.current;
    const exteriorPhoto = exteriorPhotoRef.current;
    const facilityTitle = facilityTitleRef.current;
    const locationTitle = locationTitleRef.current;
    const facilityCounter = facilityCounterRef.current;
    const facilityProgress = facilityProgressRef.current;
    const mapHint = mapHintRef.current;
    if (!root || !heroImage || !heroCopy || !questionCard || !stickySearch || !bottomBar || !count || !signature || !principleWorld || !principleSticky || !principleTrack || !facility || !facilitySticky || !facilityStage || !facilityTrack || !facilityMap || !mapImageElement || !exteriorPhoto || !facilityTitle || !locationTitle || !facilityCounter || !facilityProgress || !mapHint) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = reducedQuery.matches || window.innerHeight > 1200;
    root.classList.add(styles.revealReady);
    if (reduced) root.classList.add(styles.reduced);

    const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    let revealObserver: IntersectionObserver | null = null;
    if (!("IntersectionObserver" in window) || reduced) {
      revealElements.forEach((element) => element.setAttribute("data-in", ""));
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).setAttribute("data-in", "");
          revealObserver?.unobserve(entry.target);
        });
      }, { threshold: .15 });
      revealElements.forEach((element) => revealObserver?.observe(element));
    }

    let counted = false;
    let countFrame = 0;
    const showDirector = () => {
      if (counted) return;
      counted = true;
      signature.classList.add(styles.signatureVisible);
      if (reduced) {
        count.textContent = "13";
        return;
      }
      const start = performance.now();
      const step = (time: number) => {
        const progress = Math.min(1, (time - start) / 1400);
        count.textContent = String(Math.round(13 * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) countFrame = requestAnimationFrame(step);
      };
      countFrame = requestAnimationFrame(step);
    };
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) showDirector();
      });
    }, { threshold: .4 });
    countObserver.observe(count);

    let mapScale = 1;
    let mapX = 0;
    let mapY = 0;
    const points = new Map<number, MapPoint>();
    let pointerStart: { scale: number; x: number; y: number; points: Map<number, MapPoint> } | null = null;
    let lastTap = 0;
    const clampMap = () => {
      mapScale = Math.min(4, Math.max(1, mapScale));
      const width = facilityMap.clientWidth;
      const height = facilityMap.clientHeight;
      mapX = Math.min(0, Math.max(width - width * mapScale, mapX));
      mapY = Math.min(0, Math.max(height - height * mapScale, mapY));
    };
    const applyMap = (animate: boolean) => {
      clampMap();
      mapImageElement.style.transition = animate ? "transform .25s ease" : "none";
      mapImageElement.style.transform = `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;
      facilityMap.classList.toggle(styles.facilityMapZoomed, mapScale > 1.01);
      if (mapScale > 1) mapHint.style.opacity = "0";
    };
    const zoomMapAt = (nextScale: number, centerX: number, centerY: number, animate: boolean) => {
      const ratio = nextScale / mapScale;
      mapX = centerX - (centerX - mapX) * ratio;
      mapY = centerY - (centerY - mapY) * ratio;
      mapScale = nextScale;
      applyMap(animate);
    };
    const relativePoint = (event: PointerEvent): MapPoint => {
      const rect = facilityMap.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!facilityMap.classList.contains(styles.facilityMapLive)) return;
      points.set(event.pointerId, relativePoint(event));
      if (points.size >= 2 || mapScale > 1) facilityMap.setPointerCapture(event.pointerId);
      pointerStart = { scale: mapScale, x: mapX, y: mapY, points: new Map(points) };
      const now = Date.now();
      if (points.size === 1 && now - lastTap < 300) {
        const [centerX, centerY] = relativePoint(event);
        zoomMapAt(mapScale > 1.5 ? 1 : 2.2, centerX, centerY, true);
      }
      lastTap = now;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!points.has(event.pointerId) || !pointerStart) return;
      points.set(event.pointerId, relativePoint(event));
      const currentPoints = Array.from(points.values());
      const startPoints = Array.from(pointerStart.points.values());
      if (currentPoints.length >= 2 && startPoints.length >= 2) {
        event.preventDefault();
        const initialDistance = Math.hypot(startPoints[0][0] - startPoints[1][0], startPoints[0][1] - startPoints[1][1]);
        const currentDistance = Math.hypot(currentPoints[0][0] - currentPoints[1][0], currentPoints[0][1] - currentPoints[1][1]);
        const initialCenter: MapPoint = [(startPoints[0][0] + startPoints[1][0]) / 2, (startPoints[0][1] + startPoints[1][1]) / 2];
        const currentCenter: MapPoint = [(currentPoints[0][0] + currentPoints[1][0]) / 2, (currentPoints[0][1] + currentPoints[1][1]) / 2];
        const nextScale = pointerStart.scale * currentDistance / initialDistance;
        const ratio = nextScale / pointerStart.scale;
        mapScale = nextScale;
        mapX = currentCenter[0] - (initialCenter[0] - pointerStart.x) * ratio;
        mapY = currentCenter[1] - (initialCenter[1] - pointerStart.y) * ratio;
        applyMap(false);
      } else if (currentPoints.length === 1 && mapScale > 1) {
        const origin = startPoints[0];
        mapX = pointerStart.x + currentPoints[0][0] - origin[0];
        mapY = pointerStart.y + currentPoints[0][1] - origin[1];
        applyMap(false);
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      points.delete(event.pointerId);
      pointerStart = { scale: mapScale, x: mapX, y: mapY, points: new Map(points) };
    };
    const preventMapTouch = (event: TouchEvent) => {
      if (facilityMap.classList.contains(styles.facilityMapLive) && (event.touches.length > 1 || mapScale > 1)) event.preventDefault();
    };
    facilityMap.addEventListener("pointerdown", onPointerDown);
    facilityMap.addEventListener("pointermove", onPointerMove);
    facilityMap.addEventListener("pointerup", onPointerUp);
    facilityMap.addEventListener("pointercancel", onPointerUp);
    facilityMap.addEventListener("touchstart", preventMapTouch, { passive: false });
    facilityMap.addEventListener("touchmove", preventMapTouch, { passive: false });

    let principleTravel = 0;
    const measurePrinciples = () => {
      principleTravel = Math.max(0, principleTrack.scrollWidth - principleSticky.clientWidth);
      principleWorld.style.height = `${principleSticky.offsetHeight + principleTravel}px`;
    };
    measurePrinciples();

    if (reduced) {
      facilityMap.classList.add(styles.facilityMapLive);
      mapHint.style.opacity = "1";
      showDirector();
      return () => {
        revealObserver?.disconnect();
        countObserver.disconnect();
        if (countFrame) cancelAnimationFrame(countFrame);
        facilityMap.removeEventListener("pointerdown", onPointerDown);
        facilityMap.removeEventListener("pointermove", onPointerMove);
        facilityMap.removeEventListener("pointerup", onPointerUp);
        facilityMap.removeEventListener("pointercancel", onPointerUp);
        facilityMap.removeEventListener("touchstart", preventMapTouch);
        facilityMap.removeEventListener("touchmove", preventMapTouch);
      };
    }

    let lastScrollY = window.scrollY;
    let generalFrame = 0;
    const updateGeneral = () => {
      generalFrame = 0;
      const scrollY = window.scrollY;
      heroImage.style.transform = `scale(${1 + Math.min(scrollY, 460) / 460 * .12})`;
      heroCopy.style.opacity = String(1 - clamp(scrollY / 260));
      stickySearch.classList.toggle(styles.stickySearchVisible, scrollY > questionCard.offsetTop + questionCard.offsetHeight);
      if (scrollY > lastScrollY + 4 && scrollY > 200) bottomBar.classList.add(styles.bottomBarHidden);
      else if (scrollY < lastScrollY - 4) bottomBar.classList.remove(styles.bottomBarHidden);
      lastScrollY = scrollY;
      const principleRect = principleWorld.getBoundingClientRect();
      const progress = principleTravel ? clamp((70 - principleRect.top) / principleTravel) : 0;
      principleTrack.style.transform = `translate3d(${-progress * principleTravel}px, 0, 0)`;
    };
    const scheduleGeneral = () => {
      if (!generalFrame) generalFrame = requestAnimationFrame(updateGeneral);
    };

    const slides = Array.from(facilityTrack.children) as HTMLElement[];
    let facilityProgressValue = 0;
    let facilityRunning = false;
    const facilityTarget = () => {
      const total = facility.offsetHeight - facilitySticky.offsetHeight;
      return clamp(-facility.getBoundingClientRect().top / Math.max(1, total));
    };
    const cubic = (value: number) => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
    const drawFacility = (progress: number) => {
      const count = slides.length;
      const photoProgress = clamp(progress / .56) * (count - 1);
      const index = Math.floor(photoProgress);
      const fraction = photoProgress - index;
      const position = Math.min(count - 1, index + (.35 * fraction + .65 * cubic(fraction)));
      const step = (slides[0]?.offsetWidth ?? 0) + 12;
      facilityTrack.style.transform = `translate3d(${-position * step}px, 0, 0)`;
      slides.forEach((slide, slideIndex) => {
        const distance = slideIndex - position;
        const image = slide.querySelector<HTMLElement>("img");
        if (image) image.style.transform = `translate3d(${-distance * 22}px, 0, 0) scale(1.04)`;
        slide.style.opacity = String(1 - Math.min(.45, Math.abs(distance) * .45));
      });
      facilityCounter.textContent = `0${Math.min(count, Math.round(position) + 1)} / 0${count}`;

      const mapWidth = facilityMap.offsetWidth;
      const mapHeight = facilityMap.offsetHeight;
      const imageHeight = Math.min(mapHeight, mapWidth * 800 / 1200);
      const imageWidth = imageHeight * 1200 / 800;
      const originX = (mapWidth - imageWidth) / 2;
      const originY = (mapHeight - imageHeight) / 2;
      const buildingX = originX + imageWidth * (678 / 1200);
      const buildingY = originY + imageHeight * (170 / 800);
      const mapLeft = -parseFloat(getComputedStyle(facilityMap).left) || 0;
      const centerX = mapLeft + 20 + (slides[0]?.offsetWidth ?? 0) / 2;
      const centerY = (facilityStage.offsetHeight - 30) / 2;
      const dissolve = smoothstep(.6, .7, progress);
      const zoom = cubic(clamp((progress - .7) / .24));
      const scale = 4.4 + (1 - 4.4) * zoom;
      const moveX = (centerX - buildingX) * (1 - zoom);
      const moveY = (centerY - buildingY) * (1 - zoom);
      facilityMap.style.transformOrigin = `${buildingX}px ${buildingY}px`;
      facilityMap.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale * (1.06 - .06 * dissolve)})`;
      facilityMap.style.opacity = String(dissolve);
      exteriorPhoto.style.transform = `scale(${1 + .12 * dissolve})`;
      exteriorPhoto.style.filter = `blur(${dissolve * 3}px)`;
      facilityTrack.style.opacity = String(1 - smoothstep(.62, .72, progress));
      const locationMode = progress > .74;
      facilityTitle.classList.toggle(styles.facilityTitleOff, locationMode);
      locationTitle.classList.toggle(styles.facilityTitleOff, !locationMode);
      facilityCounter.style.opacity = progress > .6 ? "0" : "1";
      const live = progress > .96;
      facilityMap.classList.toggle(styles.facilityMapLive, live);
      mapHint.style.opacity = live ? "1" : "0";
      facilityProgress.style.width = `${progress * 100}%`;
    };
    const tickFacility = () => {
      const target = facilityTarget();
      facilityProgressValue += (target - facilityProgressValue) * .14;
      if (Math.abs(target - facilityProgressValue) < .0005) facilityProgressValue = target;
      drawFacility(facilityProgressValue);
      if (facilityProgressValue !== target) requestAnimationFrame(tickFacility);
      else facilityRunning = false;
    };
    const scheduleFacility = () => {
      if (facilityRunning) return;
      facilityRunning = true;
      requestAnimationFrame(tickFacility);
    };

    facilityProgressValue = facilityTarget();
    drawFacility(facilityProgressValue);
    updateGeneral();
    window.addEventListener("scroll", scheduleGeneral, { passive: true });
    window.addEventListener("scroll", scheduleFacility, { passive: true });
    window.addEventListener("resize", measurePrinciples);
    window.addEventListener("resize", scheduleGeneral);
    window.addEventListener("resize", scheduleFacility);

    return () => {
      revealObserver?.disconnect();
      countObserver.disconnect();
      if (countFrame) cancelAnimationFrame(countFrame);
      if (generalFrame) cancelAnimationFrame(generalFrame);
      window.removeEventListener("scroll", scheduleGeneral);
      window.removeEventListener("scroll", scheduleFacility);
      window.removeEventListener("resize", measurePrinciples);
      window.removeEventListener("resize", scheduleGeneral);
      window.removeEventListener("resize", scheduleFacility);
      facilityMap.removeEventListener("pointerdown", onPointerDown);
      facilityMap.removeEventListener("pointermove", onPointerMove);
      facilityMap.removeEventListener("pointerup", onPointerUp);
      facilityMap.removeEventListener("pointercancel", onPointerUp);
      facilityMap.removeEventListener("touchstart", preventMapTouch);
      facilityMap.removeEventListener("touchmove", preventMapTouch);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.mobileHome} data-home-mobile>
      <div ref={stickySearchRef} className={`${styles.fixedBar} ${styles.stickySearch}`}>
        <MagnifyingGlassIcon aria-hidden="true" />
        <span className={styles.stickySearchText}>{typingText || typingExamples[0]}</span>
        <button type="button" className={styles.stickySearchButton} onClick={() => questionInputRef.current?.focus()}>질문하기</button>
      </div>

      <section className={styles.hero} aria-labelledby="mobile-home-title">
        <div ref={heroImageRef} className={styles.heroImage}>
          <Image src={hero?.bgImage.src || "/uploads/glory-home-hero-director.jpg"} alt={hero?.bgImage.alt || "글로리의원 이호 대표원장이 고객을 진료하는 모습"} fill priority sizes="(max-width: 430px) 100vw, 430px" />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <ColumnHeader content={content} variant="overlay" page="home" />
        <div ref={heroCopyRef} className={styles.heroCopy} data-rv>
          <span>{hero?.eyebrow || "NATURAL · PERSONAL · BY THE DIRECTOR"}</span>
          <h1 id="mobile-home-title">{hero?.title || "자연스러운 아름다움,"}<br /><b>{hero?.titleStrong || "대표원장이 직접 진행합니다"}</b></h1>
        </div>
      </section>

      <section ref={questionCardRef} className={styles.questionCard} id="mobile-question" aria-labelledby="mobile-question-title">
        <span className={styles.eyebrow}>Ask before treatment</span>
        <b id="mobile-question-title">시술 이름보다,<br />지금의 고민을 들려주세요</b>
        <form className={styles.questionForm} role="search" onSubmit={submitQuestion}>
          <div className={styles.questionField}>
            {!query ? <span className={styles.typedGhost} aria-hidden="true">{typingText}<i className={styles.caret} /></span> : null}
            <input
              ref={questionInputRef}
              className={styles.questionInput}
              type="search"
              aria-label="칼럼에서 질문 검색"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-controls="mobile-home-suggestions"
              aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 ? `mobile-home-suggestions-${activeSuggestion}` : undefined}
              value={query}
              placeholder={getText(content, "home.question.placeholder")}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onChange={(event) => { setQuery(event.target.value); setActiveSuggestion(-1); }}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={(event) => { composingRef.current = false; setQuery(event.currentTarget.value); }}
              onKeyDown={handleQuestionKey}
            />
          </div>
          <button className={styles.questionSubmit} type="submit">질문하기</button>
          {suggestionsOpen ? <div className={styles.autocomplete}><SearchAutocomplete id="mobile-home-suggestions" items={suggestions} query={query} activeIndex={activeSuggestion} onActive={setActiveSuggestion} onSelect={selectSuggestion} /></div> : null}
        </form>
        <div className={`${styles.horizontalRow} ${styles.popularRow}`}>
          {popularQuestions.map((question) => <button type="button" className={styles.chip} key={question} onClick={() => { setQuery(question); questionInputRef.current?.focus(); }}>{question}</button>)}
        </div>
      </section>

      <section className={`${styles.section} ${styles.finder}`} id="mobile-finder">
        <span className={styles.eyebrow}>Find by concern</span>
        <h2 className={styles.sectionTitle}>고민으로 <b>찾기</b></h2>
        <div className={`${styles.horizontalRow} ${styles.concernRow}`}>
          {concernItems.map((item) => <Link className={styles.pill} href={item.link} key={item.num}>{item.name}</Link>)}
        </div>
        <div className={styles.treatmentHeading}><span className={styles.eyebrow}>Find by treatment</span><h2 className={styles.sectionTitle}>시술로 <b>찾기</b></h2></div>
        <div className={styles.categoryGrid}>
          {categoryCards.map((card, index) => <Link href={card.href} className={styles.categoryCard} data-rv style={delay(index * .06)} key={card.name}>
            <span className={styles.categoryTitle}><b>{card.name}</b><i>{card.count}</i></span>
            <span className={styles.categoryDescription}>{card.description}</span>
            <span className={styles.categoryArrow}>→</span>
          </Link>)}
        </div>
      </section>

      <section className={styles.section} id="mobile-column">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Doctor&apos;s column</span><h2 className={styles.sectionTitle}>진료실 질문에<br /><b>원장이 직접 답합니다</b></h2></div><Link href="/column/all">전체 보기 →</Link></div>
        {feature ? <Link href={`/column/${feature.slug}`} className={styles.featureLink} data-rv>
          <span className={styles.featureImage}><Image src={feature.image} alt={`${feature.title} 대표 이미지`} fill sizes="calc(100vw - 40px)" /></span>
          <span className={styles.featureCategory}>{feature.category} · 비교</span>
          <b className={styles.featureTitle}>세르프와 써마지,<br />무엇이 다르고 누구에게 맞나요?</b>
          <span className={styles.featureDescription}>세르프는 써마지처럼 진피층에 에너지를 넣고,<br />DEEP 모드로 조금 더 깊은 층까지 전달하는 고주파 장비입니다.</span>
        </Link> : null}
        <div className={styles.questionListHeading}><b>원장이 답한 질문</b><span>지금까지 <b>{answerCount}</b>개 답변</span></div>
        {questions.slice(0, 3).map((question, index) => <details className={styles.answerQuestion} data-rv style={delay(index * .08)} key={question.q}>
          <summary><small>Q{index + 1}</small><b>{question.q}</b><i>+</i></summary>
          <div className={styles.answerPanel}><p className={styles.answerText}>{lines(question.a)}</p><Link href={question.href}>칼럼에서 자세히 보기 →</Link></div>
        </details>)}
        <a href="#mobile-question" className={`${styles.primaryButton} ${styles.questionAction}`}>원장님께 질문 남기기</a>
      </section>

      <section className={`${styles.section} ${styles.director}`} id="mobile-director">
        <div className={styles.directorIntro}>
          <div className={styles.directorPhoto} data-rv><Image src={getImage(content, "home.doctor.photo").src || "/uploads/glory-director-lee-ho-profile.jpg"} alt={getImage(content, "home.doctor.photo").alt} fill sizes="132px" /></div>
          <div data-rv style={delay(.1)}><span className={styles.eyebrow}>About the director</span><h2 className={`${styles.sectionTitle} ${styles.directorTitle}`}>대표원장 <b>이호</b></h2><p className={styles.years}><b ref={countRef}>0</b>년 피부 진료</p></div>
        </div>
        <div className={styles.careerList}>
          {careers.slice(0, 4).map((career) => <div key={career}>{career}</div>)}
          {careersOpen ? careers.slice(4).map((career) => <div key={career}>{career}</div>) : null}
          <button type="button" className={styles.careerToggle} aria-expanded={careersOpen} onClick={() => setCareersOpen((value) => !value)}>{careersOpen ? "접기 −" : "경력 더 보기 +"}</button>
        </div>
        <div className={styles.visionCopy}><span className={styles.eyebrow}>Our vision</span><p>가족에게 할 수 있는 시술만<br /><b>권해드립니다</b></p><span ref={signatureRef} className={styles.signature}><Image src="/uploads/glory-director-lee-ho-signature.png" alt="이호 대표원장 서명" fill sizes="82px" /></span></div>
        <div ref={principleWorldRef} className={styles.principleWorld}>
          <div ref={principleStickyRef} className={styles.principleSticky}>
            <div ref={principleTrackRef} className={styles.principleTrack}>
              {principles.map((principle) => <article className={styles.principleCard} key={principle.num}><small>{principle.num}</small><b>{principle.title}</b><p>{lines(principle.desc)}</p></article>)}
            </div>
          </div>
        </div>
        <div className={styles.directorButtons}><Link className={styles.primaryButton} href="/doctor/lee-ho">원장 프로필</Link><Link className={styles.outlineButton} href="/column">원장 칼럼 →</Link></div>
      </section>

      <section className={styles.section} id="mobile-equipment">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Equipment</span><h2 className={styles.sectionTitle}>글로리의원 <b>보유 장비</b></h2></div><span className={styles.equipmentHint}>옆으로 넘겨보세요 →</span></div>
        <div className={`${styles.horizontalRow} ${styles.equipmentRow}`}>
          {equipment.map((item, index) => {
            const treatment = getTreatment(item.id);
            const detail = treatment && isTreatmentPageVisible(treatment.slug) && getTreatmentDetail(treatment.categorySlug, treatment.slug);
            return <article className={styles.equipmentCard} data-rv style={delay(index * .05)} key={item.id}>
              <span className={styles.equipmentImage}><Image src={item.image.src || `/uploads/glory-equipment-${item.id}.png`} alt={item.image.alt || item.name} fill sizes="42vw" /></span>
              <b>{item.name}</b><span>{item.desc}</span>
              {treatment && detail ? <Link className={styles.equipmentAction} href={treatment.detailPath}>시술 안내 보기 →</Link> : null}
              {treatment ? <Link className={styles.equipmentAction} href={`/column/all?treatment=${treatment.slug}`}>관련 칼럼 읽기 →</Link> : null}
            </article>;
          })}
        </div>
      </section>

      <section ref={facilityRef} className={styles.facility} id="mobile-facility">
        <div ref={facilityStickyRef} className={styles.facilitySticky}>
          <div className={styles.facilityHeading}>
            <div className={styles.facilityTitleWrap}>
              <div ref={facilityTitleRef} className={styles.facilityTitle}><span className={styles.eyebrow}>Facility</span><h2 className={styles.sectionTitle}>쾌적한 시술 환경을 위한<br /><b>시설과 장비</b></h2></div>
              <div ref={locationTitleRef} className={`${styles.facilityTitle} ${styles.facilityTitleOff}`}><span className={styles.eyebrow}>Location</span><h2 className={styles.sectionTitle}>언주역 4번 출구에서 30m,<br /><b>KJ빌딩 3층 글로리의원</b></h2></div>
            </div>
            <span ref={facilityCounterRef} className={styles.facilityCounter}>01 / 06</span>
          </div>
          <div ref={facilityStageRef} className={styles.facilityStage}>
            <div ref={facilityTrackRef} className={styles.facilityTrack}>
              {gallery.map((item, index) => <div className={styles.facilitySlide} key={item.key}><div ref={index === gallery.length - 1 ? exteriorPhotoRef : undefined} className={styles.facilityPhoto}><Image src={item.image.src || "/uploads/glory-gallery-overview.webp"} alt={item.image.alt} fill sizes="calc(100vw - 40px)" /></div><b>{item.name}</b></div>)}
            </div>
            <div ref={facilityMapRef} className={styles.facilityMap}>
              <Image ref={facilityMapImageRef} src={mapImage.src || "/uploads/gloryclinic-location-map.svg"} alt={mapImage.alt} fill unoptimized sizes="570px" />
            </div>
            <span ref={mapHintRef} className={styles.mapHint}>두 손가락으로 확대 · 두 번 탭하면 크게</span>
          </div>
          <div className={styles.facilityProgress}><i ref={facilityProgressRef} /></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.visit}`} id="mobile-location">
        <span className={styles.eyebrow}>Visit &amp; Consultation</span><h2 className={styles.sectionTitle}>진료 안내와 <b>상담</b></h2>
        <dl className={styles.locationList}>
          <div><dt>주소</dt><dd>서울 강남구 봉은사로 207, KJ빌딩 3층</dd></div>
          <div><dt>지하철</dt><dd>언주역(9호선) 4번 출구에서 30m</dd></div>
          <div><dt>진료</dt><dd>월–금 {weekdayHours} · 토 {saturdayHours}<br />일·공휴일 휴무</dd></div>
          <div><dt>전화</dt><dd><a href={phoneHref}><b>{phone}</b></a></dd></div>
        </dl>
        <div className={styles.mapButtons}><a className={styles.outlineButton} href={naverUrl} target="_blank" rel="noopener noreferrer">네이버 지도</a><a className={styles.outlineButton} href={kakaoMapUrl} target="_blank" rel="noopener noreferrer">카카오맵</a><a className={styles.outlineButton} href={googleUrl} target="_blank" rel="noopener noreferrer">구글 지도</a></div>
        <p className={styles.consultPromise}>상담부터 시술까지,<br /><b>대표원장이 직접 진행합니다</b></p>
        {consultKakaoUrl ? <a className={`${styles.primaryButton} ${styles.consultButton}`} href={consultKakaoUrl} target="_blank" rel="noopener noreferrer">카카오톡 상담</a> : null}
      </section>

      <footer className={styles.footer}>
        <b>G 글로리의원</b>
        <p>서울 강남구 봉은사로 207, KJ빌딩 3층 · 대표원장 이호 · {phone}</p>
        <FooterPolicyLinks content={content} /><p><Link href="/column">원장 칼럼</Link></p>
        <p className={styles.notice}>시술 결과는 개인에 따라 다를 수 있으며,<br />부작용이 발생할 수 있습니다.</p>
      </footer>

      <nav ref={bottomBarRef} className={`${styles.fixedBar} ${styles.bottomBar}`} aria-label="모바일 빠른 상담" data-mobile-bottom-bar="phone">
        <a className={styles.phoneLink} href={phoneHref}><ClinicOpenStatus content={content} /><b>전화</b></a>
        <a href="#mobile-location">오시는길</a>
        {consultKakaoUrl ? <a href={consultKakaoUrl} target="_blank" rel="noopener noreferrer">카카오톡 상담</a> : <a href="#mobile-question">질문하기</a>}
      </nav>
    </div>
  );
}
