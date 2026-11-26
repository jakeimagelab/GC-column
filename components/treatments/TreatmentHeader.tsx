"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { getImage, getText, type SiteContent } from "@/content/site-content-types";
import { categories, getTreatmentCategoryPath } from "@/content/treatments";
import styles from "./TreatmentDetailTemplate.module.css";

export function TreatmentHeader({ content }: { content: SiteContent }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <Link className={styles.headerBrand} href="/">
          <BrandMark image={getImage(content, "common.header.logo")} name={getText(content, "common.brand.name")} nameEn={getText(content, "common.brand.nameEn")} plain />
        </Link>
        <nav className={styles.headerNav} aria-label="시술 카테고리">
          {categories.map((category) => <Link href={getTreatmentCategoryPath(category.slug)} key={category.slug}>{category.name}</Link>)}
        </nav>
        <Link className={styles.headerCta} href="/consultation">내원 전 가이드</Link>
        <button className={styles.headerMenuButton} type="button" aria-expanded={open} aria-controls="treatment-mobile-menu" onClick={() => setOpen((value) => !value)}>
          {open ? "닫기" : "메뉴"}
        </button>
      </div>
      <nav id="treatment-mobile-menu" className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ""}`} aria-label="모바일 시술 카테고리">
        {categories.map((category) => <Link href={getTreatmentCategoryPath(category.slug)} key={category.slug} onClick={() => setOpen(false)}>{category.name}</Link>)}
        <Link href="/consultation" onClick={() => setOpen(false)}>내원 전 가이드</Link>
      </nav>
    </header>
  );
}
