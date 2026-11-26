"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ConsultationAnswers, ConsultationTreatment } from "@/content/consultation-types";
import { getText, type SiteContent } from "@/content/site-content-types";
import { formatTreatmentPrice, matchConsultationTreatments } from "@/lib/consultation";
import styles from "./ConsultationGuide.module.css";

type ConsultationGuideProps = {
  content: SiteContent;
  treatments: ConsultationTreatment[];
};

const initialAnswers: ConsultationAnswers = {
  ageRange: "",
  gender: "",
  concern: "",
  budget: null,
  preference: "",
};

const ageOptions = ["20대 이하", "30대", "40대", "50대", "60대 이상", "응답하지 않음"];
const genderOptions = ["여성", "남성", "응답하지 않음"];
const concernOptions = [
  { value: "jawline-fat", label: "턱선·이중턱이 고민이에요" },
  { value: "sagging", label: "피부 탄력·처짐이 고민이에요" },
  { value: "volume-concern", label: "볼륨 감소가 걱정돼요" },
  { value: "compare-lifting", label: "리프팅 장비를 비교하고 싶어요" },
];
const budgetOptions = [
  { value: "500000", label: "50만원 이내" },
  { value: "1000000", label: "100만원 이내" },
  { value: "2000000", label: "200만원 이내" },
  { value: "", label: "예산보다 비교가 우선이에요" },
];
const preferenceOptions = [
  { value: "fat-concern", label: "지방량을 함께 살펴보고 싶어요" },
  { value: "dermis", label: "피부 탄력 중심으로 비교하고 싶어요" },
  { value: "deeper-layer", label: "더 깊은 층까지 비교하고 싶어요" },
  { value: "one-visit", label: "한 번의 내원으로 상담받고 싶어요" },
];

export function ConsultationGuide({ content, treatments }: ConsultationGuideProps) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const resultTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (submitted) resultTitle.current?.focus(); }, [submitted]);
  const matches = useMemo(() => matchConsultationTreatments(treatments, answers), [answers, treatments]);
  const phone = getText(content, "common.clinic.phone");
  const kakao = "https://pf.kakao.com/_xkRRPG";
  const complete = Boolean(answers.concern && answers.preference);

  const setAnswer = <Key extends keyof ConsultationAnswers>(key: Key, value: ConsultationAnswers[Key]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  };

  return (
    <div className={styles.guide}>
      <div className={styles.layout} data-show-results={submitted}>
        <form
          className={styles.form}
          onSubmit={(event) => { event.preventDefault(); if (complete) setSubmitted(true); }}
        >
          <div className={styles.formHeading}>
            <span>CONSULTATION GUIDE</span>
            <h2>{getText(content, "consultation.form.title")}</h2>
            <p>{getText(content, "consultation.form.description")}</p>
          </div>

          <fieldset>
            <legend><b>01</b> 가장 궁금한 고민</legend>
            <div className={styles.optionGrid}>
              {concernOptions.map((option) => <label key={option.value}><input type="radio" name="concern" value={option.value} checked={answers.concern === option.value} onChange={() => setAnswer("concern", option.value)} /><span>{option.label}</span></label>)}
            </div>
          </fieldset>

          <fieldset>
            <legend><b>02</b> 상담에서 우선할 기준</legend>
            <div className={styles.optionGrid}>
              {preferenceOptions.map((option) => <label key={option.value}><input type="radio" name="preference" value={option.value} checked={answers.preference === option.value} onChange={() => setAnswer("preference", option.value)} /><span>{option.label}</span></label>)}
            </div>
          </fieldset>

          <fieldset>
            <legend><b>03</b> 예산 범위</legend>
            <div className={styles.optionGrid}>
              {budgetOptions.map((option) => <label key={option.label}><input type="radio" name="budget" value={option.value} checked={(answers.budget === null ? "" : String(answers.budget)) === option.value} onChange={() => setAnswer("budget", option.value ? Number(option.value) : null)} /><span>{option.label}</span></label>)}
            </div>
          </fieldset>

          <div className={styles.optionalGroup}>
            <label>연령대 <small>선택</small><select value={answers.ageRange} onChange={(event) => setAnswer("ageRange", event.target.value)}><option value="">선택하지 않음</option>{ageOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>성별 <small>선택</small><select value={answers.gender} onChange={(event) => setAnswer("gender", event.target.value)}><option value="">선택하지 않음</option>{genderOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>

          <p className={styles.privacy}>{getText(content, "consultation.form.privacy")}</p>
          <button className={styles.submit} type="submit" disabled={!complete}>비교 정보 보기</button>
        </form>

        {submitted ? <section className={styles.result} aria-live="polite" aria-labelledby="consultation-result-title">
          <div className={styles.resultHeading}>
            <span>RESULT</span>
            <h2 id="consultation-result-title" ref={resultTitle} tabIndex={-1}>{getText(content, "consultation.result.title")}</h2>
            <p>{getText(content, "consultation.result.description")}</p>
          </div>

            {matches.length ? <div className={styles.cards}>{matches.map((treatment, index) => <article key={treatment.id}>
              <div><span>{String(index + 1).padStart(2, "0")}</span><small>{treatment.category}</small></div>
              <h3>{treatment.name}</h3>
              {treatment.priceMin !== null && treatment.priceMax !== null ? <b className={styles.price}>{formatTreatmentPrice(treatment)}</b> : null}
              <p>{treatment.effectSummary}</p>
              <dl><div><dt>함께 확인할 점</dt><dd>{treatment.limitSummary}</dd></div><div><dt>주의</dt><dd>{treatment.cautionSummary}</dd></div></dl>
              {treatment.sourceColumnSlugs[0] ? <Link href={`/column/${treatment.sourceColumnSlugs[0]}`}>근거 칼럼 읽기 →</Link> : null}
            </article>)}</div> : <div className={styles.empty}><b>공개된 비교 정보를 준비 중입니다.</b><p>대표원장 상담에서 피부 탄력과 지방량을 확인해 주세요.</p></div>}
            <div className={styles.disclaimer}><b>{getText(content, "consultation.result.noticeTitle")}</b><p>{getText(content, "consultation.result.notice")}</p></div>
            <div className={styles.actions}><a href={`tel:${phone.replace(/[^0-9+]/g, "")}`}>전화 상담</a>{kakao ? <a href={kakao} target="_blank" rel="noopener noreferrer">카카오톡 상담</a> : null}<button type="button" onClick={() => { setAnswers(initialAnswers); setSubmitted(false); }}>다시 입력하기</button></div>
        </section> : null}
      </div>
    </div>
  );
}
