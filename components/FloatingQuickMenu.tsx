"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClinicOpenStatus } from "./ClinicOpenStatus";
import { getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import styles from "./FloatingQuickMenu.module.css";

type FloatingQuickMenuProps = { compact?: boolean; content: SiteContent };

export function FloatingQuickMenu({ content, compact = false }: FloatingQuickMenuProps) {
  const [showTop, setShowTop] = useState(false);
  const phone = getText(content, "common.clinic.phone");
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;
  const kakaoUrl = getText(content, "common.quick.kakaoUrl") || getText(content, "home.location.kakaoUrl");
  const reserveUrl = getText(content, "common.quick.reserveUrl");

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY >= 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const top = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <>
      <aside className={`${styles.menu} ${compact ? styles.compact : ""}`} aria-label="빠른 상담 메뉴">
        <div className={styles.head}><b {...textEditProps("common.quick.title")}>{getText(content, "common.quick.title")}</b><ClinicOpenStatus content={content} /></div>
        <Link href={phoneHref} data-contact-type="phone" {...textEditProps("common.quick.phone")}>{getText(content, "common.quick.phone")}</Link>
        {kakaoUrl ? <Link href={kakaoUrl} target="_blank" rel="noopener noreferrer" data-contact-type="kakao" {...textEditProps("common.quick.kakao")}>{getText(content, "common.quick.kakao")}</Link> : null}
        <Link href="/#location" {...textEditProps("common.quick.location")}>{getText(content, "common.quick.location")}</Link>
        <Link href={compact ? "/" : "/column"} {...textEditProps(compact ? "common.quick.homepage" : "common.quick.column")}>{getText(content, compact ? "common.quick.homepage" : "common.quick.column")}</Link>
      </aside>

      <nav className={styles.mobileBar} aria-label="모바일 빠른 상담">
        <Link href={phoneHref} data-contact-type="phone"><ClinicOpenStatus content={content} /><b {...textEditProps("common.quick.phone")}>{getText(content, "common.quick.phone")}</b></Link>
        {kakaoUrl ? <Link href={kakaoUrl} target="_blank" rel="noopener noreferrer" data-contact-type="kakao"><b {...textEditProps("common.quick.kakao")}>{getText(content, "common.quick.kakao")}</b></Link> : null}
        {reserveUrl ? <Link href={reserveUrl} target="_blank" rel="noopener noreferrer" data-contact-type="reservation"><b {...textEditProps("common.quick.reserve")}>{getText(content, "common.quick.reserve")}</b></Link> : null}
      </nav>

      <button type="button" className={`${styles.topButton} ${showTop ? styles.topButtonVisible : ""}`} onClick={top} aria-hidden={!showTop} tabIndex={showTop ? 0 : -1}>
        <span aria-hidden="true">↑</span><span {...textEditProps("common.backToTop")}>{getText(content, "common.backToTop")}</span>
      </button>
    </>
  );
}
