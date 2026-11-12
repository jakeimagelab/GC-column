"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { ImageSlot } from "./ImageSlot";
import { attributeEditProps, getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { categories, megaMenuTreatmentOrder, treatments } from "@/content/treatments";
import { TREATMENT_PAGES_READY } from "@/lib/config";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = { variant?: "taupe" | "overlay"; page?: "home" | "main" | "detail"; content: SiteContent };
type Panel = "intro" | "treatments" | null;

const introItems = [
  { key: "doctor" },
  { key: "vision" },
  { key: "equipment" },
  { key: "gallery" },
  { key: "location" },
] as const;

function Flag({ locale }: { locale: "KR" | "EN" | "CN" }) {
  if (locale === "KR") return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff" /><path d="M6.5 7a3.5 3.5 0 0 1 7 0z" fill="#CD2E3A" /><path d="M6.5 7a3.5 3.5 0 0 0 7 0z" fill="#0047A0" /></svg>;
  if (locale === "EN") return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff" /><rect width="20" height="2" fill="#B22234" /><rect y="4" width="20" height="2" fill="#B22234" /><rect y="8" width="20" height="2" fill="#B22234" /><rect y="12" width="20" height="2" fill="#B22234" /><rect width="9" height="8" fill="#3C3B6E" /></svg>;
  return <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#DE2910" /><polygon points="4,2 4.9,4.6 7.6,4.6 5.4,6.2 6.2,8.8 4,7.2 1.8,8.8 2.6,6.2 0.4,4.6 3.1,4.6" fill="#FFDE00" /></svg>;
}

function TreatmentTarget({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return TREATMENT_PAGES_READY ? <Link href={href} className={className}>{children}</Link> : <div className={className} aria-disabled="true">{children}</div>;
}

export function ColumnHeader({ content, variant = "taupe", page = "detail" }: ColumnHeaderProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const isHome = page === "home";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setPanel(null); setMobileOpen(false); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const groups = categories.map((category) => ({
    ...category,
    items: megaMenuTreatmentOrder[category.slug].flatMap((slug) => {
      const treatment = treatments.find((item) => item.slug === slug);
      const hasPlaceholder = treatment && [treatment.name, treatment.desc, treatment.equipmentType].some((value) => value?.trim().startsWith("["));
      return treatment && (process.env.NODE_ENV === "development" || !hasPlaceholder) ? [treatment] : [];
    }),
  }));
  const open = panel !== null || mobileOpen;

  return (
    <div className={`${styles.shell} ${styles[variant]} ${isHome ? styles.home : ""}`}>
      <div
        className={`${styles.surface} ${open ? styles.open : ""} ${scrolled ? styles.scrolled : ""}`}
        onMouseLeave={() => setPanel(null)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPanel(null); }}
        data-megamenu-open={panel ? "true" : "false"}
      >
        <header className={styles.header}>
          <Link className={styles.brand} href={isHome ? "/" : "/column"}>
            <BrandMark image={getImage(content, "common.header.logo")} name={getText(content, "common.brand.name")} nameEn={isHome ? getText(content, "common.brand.nameEn") : undefined} compact={!isHome} plain={!isHome} />
            {!isHome ? <span className={styles.badge} {...textEditProps("common.header.columnBadge")}>{getText(content, "common.header.columnBadge")}</span> : null}
          </Link>

          <nav className={styles.nav} aria-label={isHome ? "주 메뉴" : "칼럼 카테고리"}>
            {isHome ? <>
              <button type="button" onMouseEnter={() => setPanel("intro")} onFocus={() => setPanel("intro")} {...textEditProps("home.header.about")}>{getText(content, "home.header.about")}</button>
              {groups.map((group) => <button type="button" key={group.slug} onMouseEnter={() => setPanel("treatments")} onFocus={() => setPanel("treatments")}>{group.name}</button>)}
              <Link href="/column" onMouseEnter={() => setPanel(null)}><b {...textEditProps("home.header.column")}>{getText(content, "home.header.column")}</b></Link>
            </> : groups.map((group) => <Link key={group.slug} href={`/column/category/${group.slug}`} onMouseEnter={() => setPanel("treatments")} onFocus={() => setPanel("treatments")}>{group.name}</Link>)}
          </nav>

          <div className={styles.actions}>
            {isHome ? <div className={styles.locales}>{(["KR", "EN", "CN"] as const).map((locale) => { const id = `home.header.locale.${locale.toLowerCase()}`; return locale === "KR" ? <Link href="/" key={locale}><Flag locale={locale} /><span {...textEditProps(id)}>{getText(content, id)}</span></Link> : <span className={styles.localeDisabled} aria-disabled="true" title="준비 중" key={locale}><Flag locale={locale} /><span {...textEditProps(id)}>{getText(content, id)}</span></span>; })}</div>
              : page === "main" ? <><Link href="/" {...textEditProps("common.header.homepage")}>{getText(content, "common.header.homepage")}</Link><span {...textEditProps("common.header.locales")}>{getText(content, "common.header.locales")}</span></>
              : <><Link href="/column#search" {...textEditProps("common.header.search")}>{getText(content, "common.header.search")}</Link><Link href="/" {...textEditProps("common.header.homepage")}>{getText(content, "common.header.homepage")}</Link></>}
          </div>

          <button type="button" className={styles.menuButton} aria-label="메뉴 열기" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}><span /><span /><span /></button>
        </header>

        <div className={`${styles.megaMenu} ${panel ? styles.megaMenuVisible : ""}`} aria-hidden={!panel}>
          {panel === "intro" ? <div className={styles.introGrid}>{introItems.map((item) => { const prefix = `home.header.intro.${item.key}`; return <Link href={getText(content, `${prefix}.href`)} key={item.key} onClick={() => setPanel(null)} {...attributeEditProps(`${prefix}.href`, "href")}><ImageSlot className={styles.itemSlot} label="" alt="" editId={`${prefix}.thumbnail`} image={getImage(content, `${prefix}.thumbnail`)} sizes="72px" /><span className={styles.itemCopy}><b {...textEditProps(`${prefix}.label`)}>{getText(content, `${prefix}.label`)}</b><span {...textEditProps(`${prefix}.description`)}>{getText(content, `${prefix}.description`)}</span></span></Link>; })}</div>
            : panel === "treatments" ? groups.map((group) => <section className={styles.megaGroup} key={group.slug}><Link className={styles.groupTitle} href={`/column/category/${group.slug}`}><span>{group.name}</span><small {...textEditProps("common.header.columnCount")}>{getText(content, "common.header.columnCount")}</small></Link><div className={styles.groupItems}>{group.items.map((item) => <TreatmentTarget href={item.detailPath} key={item.slug}><ImageSlot className={styles.itemSlot} label="" alt="" editId={`treatments.${item.slug}.thumbnail`} image={getImage(content, `treatments.${item.slug}.thumbnail`)} sizes="72px" /><span className={styles.itemCopy}><b>{item.name}</b><span>{item.desc}</span><small {...textEditProps("common.treatment.preparing")}>{TREATMENT_PAGES_READY ? getText(content, "common.header.relatedCount") : getText(content, "common.treatment.preparing")}</small></span></TreatmentTarget>)}</div><Link className={styles.moreButton} href={`/column/category/${group.slug}`} aria-label={`${group.name} 시술 더 보기`}>+</Link></section>) : null}
        </div>

        <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuVisible : ""}`} aria-hidden={!mobileOpen}>
          {isHome ? <section><button type="button" aria-expanded={mobileCategory === "intro"} onClick={() => setMobileCategory((value) => value === "intro" ? "" : "intro")}><span>{getText(content, "home.header.about")}</span><span>{mobileCategory === "intro" ? "−" : "+"}</span></button>{mobileCategory === "intro" ? <div>{introItems.map((item) => { const prefix = `home.header.intro.${item.key}`; return <Link href={getText(content, `${prefix}.href`)} key={item.key} onClick={() => setMobileOpen(false)} {...attributeEditProps(`${prefix}.href`, "href")}>{getText(content, `${prefix}.label`)}</Link>; })}</div> : null}</section> : null}
          {groups.map((group) => { const expanded = mobileCategory === group.slug; return <section key={group.slug}><button type="button" aria-expanded={expanded} onClick={() => setMobileCategory(expanded ? "" : group.slug)}><span>{group.name}</span><span>{expanded ? "−" : "+"}</span></button>{expanded ? <div>{group.items.map((item) => <TreatmentTarget href={item.detailPath} key={item.slug}><b>{item.name}</b><span>{item.desc}</span></TreatmentTarget>)}</div> : null}</section>; })}
          <div className={styles.mobileLinks}>{isHome ? <Link href="/column">{getText(content, "home.header.column")}</Link> : page === "main" ? <><Link href="/">{getText(content, "common.header.homepage")}</Link><span>{getText(content, "common.header.locales")}</span></> : <><Link href="/column#search">{getText(content, "common.header.search")}</Link><Link href="/">{getText(content, "common.header.homepage")}</Link></>}</div>
        </div>
      </div>
    </div>
  );
}
