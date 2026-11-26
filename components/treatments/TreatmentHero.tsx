"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useId, type CSSProperties } from "react";
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

const HERO_CENTER_X = 1660;
const HERO_CENTER_Y = 960;

const HERO_RAYS = Array.from({ length: 70 }, (_, index) => {
  const angle = (185 + index * 1.45) * Math.PI / 180;
  const coordinate = (value: number) => Number(value.toFixed(3));
  return {
    x1: coordinate(HERO_CENTER_X + Math.cos(angle) * 520),
    y1: coordinate(HERO_CENTER_Y + Math.sin(angle) * 520),
    x2: coordinate(HERO_CENTER_X + Math.cos(angle) * 1900),
    y2: coordinate(HERO_CENTER_Y + Math.sin(angle) * 1900),
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
  const rawId = useId().replace(/:/g, "");
  const backgroundId = `${rawId}-background`;
  const rayId = `${rawId}-ray`;
  const glowId = `${rawId}-glow`;
  const chips = hero.chips.filter((chip) => showReview || !chip.needsReview);

  return (
    <section className={styles.hero} style={{ "--hero-accent": accent, "--hero-accent-light": accentLight } as CSSProperties}>
      <svg className={styles.pattern} viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id={backgroundId} cx="90%" cy="100%" r="90%">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor="#130B1D" />
          </radialGradient>
          <radialGradient id={rayId} gradientUnits="userSpaceOnUse" cx={HERO_CENTER_X} cy={HERO_CENTER_Y} r="1500">
            <stop offset=".33" stopColor="#F3EAFF" stopOpacity=".9" />
            <stop offset="1" stopColor={accentLight} stopOpacity="0" />
          </radialGradient>
          <filter id={glowId} filterUnits="userSpaceOnUse" x="0" y="0" width="1440" height="820">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <rect width="1440" height="820" fill={`url(#${backgroundId})`} />
        <circle className={styles.glowCircle} cx={HERO_CENTER_X} cy={HERO_CENTER_Y} r="520" fill="none" stroke="#EADFFB" strokeWidth="26" opacity=".2" filter={`url(#${glowId})`} pathLength="1" />
        <circle className={styles.mainCircle} cx={HERO_CENTER_X} cy={HERO_CENTER_Y} r="520" fill="none" stroke="#F7F1FF" strokeWidth="1" opacity=".16" pathLength="1" />
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
              strokeWidth="1"
            />
          ))}
        </g>
      </svg>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <nav className={styles.breadcrumb} aria-label="현재 위치">
            <Link href="/">홈</Link><span>›</span><Link href={categoryPath}>{categoryName}</Link><span>›</span><span aria-current="page">{hero.title}</span>
          </nav>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1><HeroTitle title={hero.title} /></h1>
          <p className={styles.oneLiner}><Lines text={hero.oneLiner} /></p>
          {chips.length ? <div className={styles.chips}>
            {chips.map((chip) => <span key={chip.label}><b>{chip.label}</b>{chip.needsReview ? <i>[원장 확인]</i> : <i>{chip.value}</i>}</span>)}
          </div> : null}
          <div className={styles.actions}>
            <Link href="/consultation">내원 전 가이드</Link>
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
