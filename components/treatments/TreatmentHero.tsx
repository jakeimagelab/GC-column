"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useId, useRef, type CSSProperties } from "react";
import type { TreatmentHeroData } from "@/content/treatments/types";
import styles from "./TreatmentHero.module.css";

type TreatmentHeroProps = {
  hero: TreatmentHeroData;
  categoryName: string;
  categoryPath: string;
  accent: string;
  accentLight: string;
  showReview: boolean;
  kakaoUrl: string;
};

const HERO_RAYS = Array.from({ length: 70 }, (_, index) => {
  const angle = (185 + index * 1.45) * Math.PI / 180;
  const coordinate = (value: number) => Number(value.toFixed(3));
  return {
    x1: coordinate(1700 + Math.cos(angle) * 520),
    y1: coordinate(980 + Math.sin(angle) * 520),
    x2: coordinate(1700 + Math.cos(angle) * 1900),
    y2: coordinate(980 + Math.sin(angle) * 1900),
    delay: Number((.9 + index * .018).toFixed(3)),
  };
});

function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index, lines) => (
    <Fragment key={`${line}-${index}`}>{line}{index < lines.length - 1 ? <br /> : null}</Fragment>
  ));
}

function HeroTitle({ title }: { title: string }) {
  const match = title.match(/^(.+?)([A-Za-z]+\d*)$/);
  if (!match || !match[1]) return title;
  return <>{match[1]}<strong>{match[2]}</strong></>;
}

export function TreatmentHero({ hero, categoryName, categoryPath, accent, accentLight, showReview, kakaoUrl }: TreatmentHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const patternRef = useRef<SVGSVGElement>(null);
  const rawId = useId().replace(/:/g, "");
  const backgroundId = `${rawId}-background`;
  const rayId = `${rawId}-ray`;
  const glowId = `${rawId}-glow`;
  const chips = hero.chips.filter((chip) => showReview || !chip.needsReview);

  useEffect(() => {
    const heroElement = heroRef.current;
    const pattern = patternRef.current;
    if (!heroElement || !pattern || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = heroElement.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      pattern.style.transform = `translate3d(0, ${progress * 120}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} style={{ "--hero-accent": accent, "--hero-accent-light": accentLight } as CSSProperties}>
      <svg ref={patternRef} className={styles.pattern} viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id={backgroundId} cx="90%" cy="100%" r="90%">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor="#130B1D" />
          </radialGradient>
          <radialGradient id={rayId} gradientUnits="userSpaceOnUse" cx="1700" cy="980" r="1500">
            <stop offset=".33" stopColor="#F3EAFF" stopOpacity=".9" />
            <stop offset="1" stopColor={accentLight} stopOpacity="0" />
          </radialGradient>
          <filter id={glowId} filterUnits="userSpaceOnUse" x="0" y="0" width="1440" height="820">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <rect width="1440" height="820" fill={`url(#${backgroundId})`} />
        <circle className={styles.glowCircle} cx="1700" cy="980" r="520" fill="none" stroke="#EADFFB" strokeWidth="26" opacity=".45" filter={`url(#${glowId})`} pathLength="1" />
        <circle className={styles.mainCircle} cx="1700" cy="980" r="520" fill="none" stroke="#F7F1FF" strokeWidth="3" pathLength="1" />
        <g className={styles.rays}>
          {HERO_RAYS.map((ray, index) => (
            <line
              key={index}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              pathLength="1"
              stroke={`url(#${rayId})`}
              strokeWidth="1.2"
              style={{ "--ray-delay": `${ray.delay}s` } as CSSProperties}
            />
          ))}
        </g>
      </svg>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <nav className={styles.breadcrumb} aria-label="현재 위치" data-hero-item style={{ "--hero-delay": ".04s" } as CSSProperties}>
            <Link href="/">홈</Link><span>›</span><Link href={categoryPath}>{categoryName}</Link><span>›</span><span aria-current="page">{hero.title}</span>
          </nav>
          <p className={styles.eyebrow} data-hero-item style={{ "--hero-delay": ".16s" } as CSSProperties}>{hero.eyebrow}</p>
          <h1 data-hero-item style={{ "--hero-delay": ".28s" } as CSSProperties}><HeroTitle title={hero.title} /></h1>
          <p className={styles.oneLiner} data-hero-item style={{ "--hero-delay": ".4s" } as CSSProperties}><Lines text={hero.oneLiner} /></p>
          {chips.length ? <div className={styles.chips} data-hero-item style={{ "--hero-delay": ".52s" } as CSSProperties}>
            {chips.map((chip) => <span key={chip.label}><b>{chip.label}</b>{chip.needsReview ? <i>[원장 확인]</i> : <i>{chip.value}</i>}</span>)}
          </div> : null}
          <div className={styles.actions} data-hero-item style={{ "--hero-delay": ".64s" } as CSSProperties}>
            <Link href="/consultation">원장 1:1 상담 예약</Link>
            <a href={kakaoUrl} target="_blank" rel="noreferrer">카카오톡 상담</a>
          </div>
        </div>

        <div className={styles.visual} data-hero-device>
          <span className={styles.floorShadow} aria-hidden="true" />
          {hero.image.src ? <Image src={hero.image.src} alt={hero.image.alt} width={380} height={660} sizes="(max-width: 760px) 76vw, 42vw" preload /> : null}
        </div>
      </div>
    </section>
  );
}
