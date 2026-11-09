"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const aiSources: Record<string, string> = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "gemini.google.com": "gemini",
  "copilot.microsoft.com": "copilot",
  "claude.ai": "claude",
};

function AnalyticsEvents() {
  useEffect(() => {
    const referrerHost = (() => {
      try { return document.referrer ? new URL(document.referrer).hostname : ""; } catch { return ""; }
    })();
    const source = aiSources[referrerHost];
    if (source) window.gtag?.("event", "ai_referral", { source });

    const contact = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("a, button");
      if (!target) return;
      const href = target instanceof HTMLAnchorElement ? target.href : "";
      const text = target.textContent?.trim() ?? "";
      const explicit = target.dataset.contactType;
      const type = explicit || (href.startsWith("tel:") ? "phone" : /카톡|카카오/.test(text + href) ? "kakao" : /예약|상담/.test(text) ? "reservation" : "");
      if (type) window.gtag?.("event", "contact_click", { contact_type: type, link_url: href || undefined });
    };
    document.addEventListener("click", contact);
    return () => document.removeEventListener("click", contact);
  }, []);
  return null;
}

export function SiteAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId.replace(/[^A-Z0-9-]/gi, "")}');`}</Script>
      <AnalyticsEvents />
    </>
  );
}
