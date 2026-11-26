"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { getConcernItems, getEquipmentItems, getHeroSlides, getImage, getText, getTypingExamples, getVisionPrinciples, type SiteContent } from "@/content/site-content-types";
import { getTreatment, isTreatmentPageVisible } from "@/content/treatments";
import { getTreatmentDetail } from "@/content/treatments/index";
import { ClinicOpenStatus } from "./ClinicOpenStatus";
import { FooterPolicyLinks } from "./FooterPolicyLinks";
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

const categoryCards = [
  { name: "리프팅", count: "9", description: "써마지FLX · 울쎄라피프라임 · 온다 외", href: "/column/category/lifting" },
  { name: "색소·모공", count: "5", description: "큐어젯 · 레블라이트SI · 셀렉IPL 외", href: "/column/category/pigment" },
  { name: "주사시술", count: "4", description: "줄기세포주사 · 보톡스 · 필러 외", href: "/column/category/injection" },
  { name: "스페셜필러", count: "4", description: "목주름 · 손등 · 눈위·눈밑 · 귓볼", href: "/column/category/filler" },
];

const equipmentOrder = ["onda", "thermage-flx", "ulthera-prime", "titanium", "xerf", "tuneface", "shurink", "oligio"];

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
  const questionCardRef = useRef<HTMLElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const [query, setQuery] = useState("");
  const [shortcutVisible, setShortcutVisible] = useState(false);
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
    const section = questionCardRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShortcutVisible(entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0));
    }, { rootMargin: "-64px 0px 0px", threshold: 0 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.mobileHome} data-home-mobile>
      {shortcutVisible ? <div className={`${styles.fixedBar} ${styles.stickySearch}`}>
        <span>{typingExamples[0]}</span>
        <button type="button" onClick={() => {
          questionCardRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
          questionInputRef.current?.focus({ preventScroll: true });
        }}>질문하기</button>
      </div> : null}
      <section className={styles.hero} aria-labelledby="mobile-home-title">
        <div className={styles.heroImage}>
          <Image src={hero?.bgImage.src || "/uploads/glory-home-hero-director.jpg"} alt={hero?.bgImage.alt || "글로리의원 이호 대표원장이 고객을 진료하는 모습"} fill priority sizes="(max-width: 430px) 100vw, 430px" />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroCopy}>
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
          {categoryCards.map((card) => <Link href={card.href} className={styles.categoryCard} key={card.name}>
            <span className={styles.categoryTitle}><b>{card.name}</b><i>{card.count}</i></span>
            <span className={styles.categoryDescription}>{card.description}</span>
            <span className={styles.categoryArrow}>→</span>
          </Link>)}
        </div>
      </section>

      <section className={styles.section} id="mobile-column">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Doctor&apos;s column</span><h2 className={styles.sectionTitle}>진료실 질문에<br /><b>원장이 직접 답합니다</b></h2></div><Link href="/column/all">전체 보기 →</Link></div>
        {feature ? <Link href={`/column/${feature.slug}`} className={styles.featureLink}>
          <span className={styles.featureImage}><Image src={feature.image} alt={`${feature.title} 대표 이미지`} fill sizes="calc(100vw - 40px)" /></span>
          <span className={styles.featureCategory}>{feature.category} · 비교</span>
          <b className={styles.featureTitle}>세르프와 써마지,<br />무엇이 다르고 누구에게 맞나요?</b>
          <span className={styles.featureDescription}>세르프는 써마지처럼 진피층에 에너지를 넣고,<br />DEEP 모드로 조금 더 깊은 층까지 전달하는 고주파 장비입니다.</span>
        </Link> : null}
        <div className={styles.questionListHeading}><b>원장이 답한 질문</b><span>지금까지 <b>{answerCount}</b>개 답변</span></div>
        {questions.slice(0, 3).map((question, index) => <details className={styles.answerQuestion} key={question.q}>
          <summary><small>Q{index + 1}</small><b>{question.q}</b><i>+</i></summary>
          <div className={styles.answerPanel}><p className={styles.answerText}>{lines(question.a)}</p><Link href={question.href}>칼럼에서 자세히 보기 →</Link></div>
        </details>)}
        <a href="#mobile-question" className={`${styles.primaryButton} ${styles.questionAction}`}>원장님께 질문 남기기</a>
      </section>

      <section className={`${styles.section} ${styles.director}`} id="mobile-director">
        <div className={styles.directorIntro}>
          <div className={styles.directorPhoto}><Image src={getImage(content, "home.doctor.photo").src || "/uploads/glory-director-lee-ho-profile.jpg"} alt={getImage(content, "home.doctor.photo").alt} fill sizes="132px" /></div>
          <div><span className={styles.eyebrow}>About the director</span><h2 className={`${styles.sectionTitle} ${styles.directorTitle}`}>대표원장 <b>이호</b></h2><p className={styles.years}><b>{getText(content, "home.doctor.years").match(/\d+/)?.[0]}</b>년 피부 진료</p></div>
        </div>
        <div className={styles.careerList}>
          {careers.slice(0, 4).map((career) => <div key={career}>{career}</div>)}
          {careersOpen ? careers.slice(4).map((career) => <div key={career}>{career}</div>) : null}
          <button type="button" className={styles.careerToggle} aria-expanded={careersOpen} onClick={() => setCareersOpen((value) => !value)}>{careersOpen ? "접기 −" : "경력 더 보기 +"}</button>
        </div>
        <div className={styles.visionCopy}><span className={styles.eyebrow}>Our vision</span><p>가족에게 할 수 있는 시술만<br /><b>권해드립니다</b></p><span className={styles.signature}><Image src="/uploads/glory-director-lee-ho-signature.png" alt="이호 대표원장 서명" fill sizes="82px" /></span></div>
        <div className={`${styles.horizontalRow} ${styles.principleTrack}`} aria-label="진료 철학">
          {principles.map((principle) => <article className={styles.principleCard} key={principle.num}><small>{principle.num}</small><b>{principle.title}</b><p>{lines(principle.desc)}</p></article>)}
        </div>
        <div className={styles.directorButtons}><Link className={styles.primaryButton} href="/doctor/lee-ho">원장 프로필</Link><Link className={styles.outlineButton} href="/column">원장 칼럼 →</Link></div>
      </section>

      <section className={styles.section} id="mobile-equipment">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Equipment</span><h2 className={styles.sectionTitle}>글로리의원 <b>보유 장비</b></h2></div><span className={styles.equipmentHint}>옆으로 넘겨보세요 →</span></div>
        <div className={`${styles.horizontalRow} ${styles.equipmentRow}`}>
          {equipment.map((item) => {
            const treatment = getTreatment(item.id);
            const detail = treatment && isTreatmentPageVisible(treatment.slug) && getTreatmentDetail(treatment.categorySlug, treatment.slug);
            return <article className={styles.equipmentCard} key={item.id}>
              <span className={styles.equipmentImage}><Image src={item.image.src || `/uploads/glory-equipment-${item.id}.png`} alt={item.image.alt || item.name} fill sizes="42vw" /></span>
              <b>{item.name}</b><span>{item.desc}</span>
              {treatment && detail ? <Link className={styles.equipmentAction} href={treatment.detailPath}>시술 안내 보기 →</Link> : null}
              {treatment ? <Link className={styles.equipmentAction} href={`/column/all?treatment=${treatment.slug}`}>관련 칼럼 읽기 →</Link> : null}
            </article>;
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles.facility}`} id="mobile-facility">
        <div className={styles.sectionHeading}>
          <div><span className={styles.eyebrow}>Facility</span><h2 className={styles.sectionTitle}>쾌적한 시술 환경을 위한<br /><b>시설과 장비</b></h2></div>
          <span className={styles.equipmentHint}>옆으로 넘겨보세요 →</span>
        </div>
        <div className={`${styles.horizontalRow} ${styles.facilityTrack}`}>
          {gallery.map((item) => <div className={styles.facilitySlide} key={item.key}><div className={styles.facilityPhoto}><Image src={item.image.src || "/uploads/glory-gallery-overview.webp"} alt={item.image.alt} fill sizes="(max-width: 430px) calc(100vw - 40px), 390px" /></div><b>{item.name}</b></div>)}
        </div>
      </section>

      <section className={`${styles.section} ${styles.visit}`} id="mobile-location">
        <span className={styles.eyebrow}>Visit &amp; Consultation</span><h2 className={styles.sectionTitle}>진료 안내와 <b>상담</b></h2>
        <a className={styles.facilityMap} href={mapImage.src || "/uploads/gloryclinic-location-map.svg"} aria-label="약도 크게 보기" target="_blank" rel="noopener noreferrer">
          <Image src={mapImage.src || "/uploads/gloryclinic-location-map.svg"} alt={mapImage.alt} fill unoptimized sizes="(max-width: 430px) calc(100vw - 40px), 390px" />
        </a>
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

      <nav className={`${styles.fixedBar} ${styles.bottomBar}`} aria-label="모바일 빠른 상담" data-mobile-bottom-bar="phone">
        <a className={styles.phoneLink} href={phoneHref}><ClinicOpenStatus content={content} /><b>전화</b></a>
        <a href="#mobile-location">오시는길</a>
        {consultKakaoUrl ? <a href={consultKakaoUrl} target="_blank" rel="noopener noreferrer">카카오톡 상담</a> : <a href="#mobile-question">질문하기</a>}
      </nav>
    </div>
  );
}
