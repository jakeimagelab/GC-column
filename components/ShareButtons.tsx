"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
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
export function ShareButtons({ content, title, summary, url, image, kakaoKey }: { content: SiteContent; title: string; summary: string; url: string; image: string; kakaoKey: string }) {
  const [copied, setCopied] = useState(false);
  const [nativeShare, setNativeShare] = useState(false);
  useEffect(() => setNativeShare(typeof navigator.share === "function"), []);

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
    window.setTimeout(() => setCopied(false), 2000);
  };
  const shareKakao = () => window.Kakao?.Share.sendDefault({ objectType: "feed", content: { title, description: summary, imageUrl: image, link: { mobileWebUrl: url, webUrl: url } }, buttons: [{ title: getText(content, "column.share.action"), link: { mobileWebUrl: url, webUrl: url } }] });

  return (
    <div className={styles.share}>
      {kakaoKey ? <><Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" strategy="afterInteractive" onLoad={() => { if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(kakaoKey); }} /><button type="button" onClick={shareKakao}>{getText(content, "column.share.kakao")}</button></> : null}
      {nativeShare ? <button type="button" className={styles.native} onClick={() => void navigator.share({ title, text: summary, url })}>{getText(content, "column.share.native")}</button> : null}
      <button type="button" onClick={() => void copy()}>{getText(content, "column.share.copy")}</button>
      <span role="status" aria-live="polite" className={copied ? styles.visible : ""}>{copied ? getText(content, "column.share.copied") : ""}</span>
    </div>
  );
}
