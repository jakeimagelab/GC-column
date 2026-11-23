"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { getText, type SiteContent } from "@/content/site-content-types";
import styles from "./ShareButtons.module.css";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: { sendDefault: (options: unknown) => void };
    };
  }
}
export function ShareButtons({ content, title, summary, url, image, kakaoKey, variant = "light" }: { content: SiteContent; title: string; summary: string; url: string; image: string; kakaoKey: string; variant?: "light" | "dark" }) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => setCopied(false), [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setMessage(getText(content, "column.share.copied"));
    window.setTimeout(() => setCopied(false), 2000);
  };
  const shareKakao = async () => {
    if (!kakaoKey || !window.Kakao?.Share) return copy();
    window.Kakao.Share.sendDefault({ objectType: "feed", content: { title, description: summary, imageUrl: image, link: { mobileWebUrl: url, webUrl: url } }, buttons: [{ title: getText(content, "column.share.action"), link: { mobileWebUrl: url, webUrl: url } }] });
  };
  const saveForConsult = async () => {
    if (typeof navigator.share === "function" && window.matchMedia("(max-width: 720px)").matches) {
      try { await navigator.share({ title, text: summary, url }); return; } catch { /* share sheet dismissed */ }
    }
    await copy();
    setMessage(getText(content, "column.detail.share.copiedConsult"));
  };

  return (
    <div className={`${styles.share} ${variant === "dark" ? styles.dark : ""}`}>
      {kakaoKey ? <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" strategy="afterInteractive" onLoad={() => { if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(kakaoKey); }} /> : null}
      <button type="button" className={styles.primary} onClick={() => void shareKakao()}><ChatBubbleLeftEllipsisIcon className={styles.kakaoIcon} aria-hidden="true" />{getText(content, "column.detail.share.kakao")}</button>
      <button type="button" onClick={() => void saveForConsult()}>{getText(content, "column.detail.share.consult")}</button>
      <button type="button" onClick={() => void copy()}>{getText(content, "column.detail.share.copy")}</button>
      <span role="status" aria-live="polite" className={copied ? styles.visible : ""}>{copied ? message : ""}</span>
    </div>
  );
}
