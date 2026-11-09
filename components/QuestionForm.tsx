"use client";

import { useState, type FormEvent } from "react";
import { getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import styles from "./QuestionForm.module.css";

export function QuestionForm({ content, columnSlug, compact = false }: { content: SiteContent; columnSlug: string | null; compact?: boolean }) {
  const [question, setQuestion] = useState("");
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentPublic, setConsentPublic] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnSlug, question, consentPrivacy, consentPublic, website: form.get("website") }),
      });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || getText(content, "qna.preparing"));
      setSuccess(true);
      setMessage(result.message || getText(content, "qna.success"));
      setQuestion("");
      setConsentPrivacy(false);
      setConsentPublic(false);
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : getText(content, "qna.preparing"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`${styles.section} ${compact ? styles.compact : ""}`}>
      <div className={styles.heading}><h2 {...textEditProps("qna.title")}>{getText(content, "qna.title")}</h2><p {...textEditProps("qna.description")}>{getText(content, "qna.description")}</p></div>
      <form onSubmit={submit}>
        <label className="srOnly" htmlFor={`qna-question-${columnSlug ?? "home"}`}>질문</label>
        <textarea id={`qna-question-${columnSlug ?? "home"}`} minLength={10} maxLength={500} required value={question} onChange={(event) => setQuestion(event.currentTarget.value)} placeholder={getText(content, "qna.placeholder")} data-edit-control />
        <span className={styles.count} aria-live="polite">{question.length} / 500</span>
        <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" data-edit-control />
        <p className={styles.notice} {...textEditProps("qna.notice")}>{getText(content, "qna.notice")}</p>
        <label className={styles.check}><input type="checkbox" required checked={consentPrivacy} onChange={(event) => setConsentPrivacy(event.currentTarget.checked)} data-edit-control /><span><b>(필수)</b> <span {...textEditProps("qna.consentText")}>{getText(content, "qna.consentText")}</span></span></label>
        <label className={styles.check}><input type="checkbox" checked={consentPublic} onChange={(event) => setConsentPublic(event.currentTarget.checked)} data-edit-control /><span><b>(선택)</b> <span {...textEditProps("qna.publicConsentText")}>{getText(content, "qna.publicConsentText")}</span></span></label>
        <div className={styles.actions}><button type="submit" disabled={sending || question.length < 10 || !consentPrivacy} data-edit-control>{sending ? getText(content, "qna.sending") : getText(content, "qna.submit")}</button>{message ? <span className={success ? styles.success : styles.error} role="status">{message}</span> : null}</div>
      </form>
    </section>
  );
}
