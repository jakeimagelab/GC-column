"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BrandMark } from "./BrandMark";
import { ImageSlot } from "./ImageSlot";
import { getConcernItems, getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { categories, getTreatmentCategoryPath, megaMenuTreatmentOrder, treatments } from "@/content/treatments";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = { variant?: "taupe" | "overlay"; page?: "home" | "main" | "detail"; content: SiteContent };
type Panel = "concerns" | (typeof categories)[number]["slug"] | null;

const menuGroups = categories.map((category) => ({
  ...category,
  items: megaMenuTreatmentOrder[category.slug].flatMap((slug) => {
    const item = treatments.find((treatment) => treatment.slug === slug);
    if (!item || /\[[^\]]+\]/.test(item.name)) return [];
    return [{ ...item, menuLabel: item.menuName ?? item.name, menuDesc: item.desc.replace(/\s*\[[^\]]+\]\s*/g, " ").trim() }];
  }),
}));

function Flag({ locale }: { locale: "us" | "cn" | "jp" }) {
  if (locale === "us") return <svg viewBox="0 0 28 18" aria-hidden="true"><rect width="28" height="18" fill="#fff"/><path d="M0 1h28M0 4h28M0 7h28M0 10h28M0 13h28M0 16h28" stroke="#b22234" strokeWidth="2"/><rect width="12" height="10" fill="#3c3b6e"/><g fill="#fff"><circle cx="2" cy="2" r=".5"/><circle cx="5" cy="2" r=".5"/><circle cx="8" cy="2" r=".5"/><circle cx="10.5" cy="2" r=".5"/><circle cx="3.5" cy="4.5" r=".5"/><circle cx="6.5" cy="4.5" r=".5"/><circle cx="9.5" cy="4.5" r=".5"/><circle cx="2" cy="7" r=".5"/><circle cx="5" cy="7" r=".5"/><circle cx="8" cy="7" r=".5"/><circle cx="10.5" cy="7" r=".5"/></g></svg>;
  if (locale === "cn") return <svg viewBox="0 0 28 18" aria-hidden="true"><rect width="28" height="18" fill="#de2910"/><path d="m5 2.2.9 2.6h2.7L6.4 6.4l.9 2.6L5 7.4 2.7 9l.9-2.6-2.2-1.6h2.7z" fill="#ffde00"/></svg>;
  return <svg viewBox="0 0 28 18" aria-hidden="true"><rect width="28" height="18" fill="#fff"/><circle cx="14" cy="9" r="5" fill="#bc002d"/></svg>;
}

export function ColumnHeader({ content, variant = "taupe", page = "detail" }: ColumnHeaderProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [panelPinned, setPanelPinned] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  const isHome = page === "home";
  const isColumnMain = page === "main";
  const concerns = getConcernItems(content);

  useEffect(() => {
    if (isColumnMain) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isColumnMain]);

  useEffect(() => {
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (surfaceRef.current && !surfaceRef.current.contains(event.target as Node)) {
        setPanel(null);
        setPanelPinned(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setPanelPinned(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const selectedGroup = panel && panel !== "concerns" ? menuGroups.find((group) => group.slug === panel) : undefined;
  const lastHref = isHome ? "/column" : "/";
  const lastLabel = isHome ? getText(content, "home.header.column") : getText(content, "common.header.homepage");
  const showPanel = (next: Exclude<Panel, null>) => {
    setPanel(next);
    setPanelPinned(false);
  };
  const togglePanel = (next: Exclude<Panel, null>) => {
    if (panel === next && panelPinned) {
      setPanel(null);
      setPanelPinned(false);
      return;
    }
    setPanel(next);
    setPanelPinned(true);
  };
  const closePanel = () => {
    setPanel(null);
    setPanelPinned(false);
  };

  return (
    <div className={`${styles.shell} ${styles[variant]} ${isHome ? styles.home : ""} ${isColumnMain ? styles.main : ""}`}>
      <div
        ref={surfaceRef}
        className={`${styles.surface} ${panel || mobileOpen ? styles.open : ""} ${scrolled ? styles.scrolled : ""}`}
        onMouseLeave={() => { if (!panelPinned) setPanel(null); }}
        onBlur={(event) => { if (!panelPinned && !event.currentTarget.contains(event.relatedTarget)) setPanel(null); }}
      >
        <header className={styles.header}>
          <Link className={styles.brand} href={isHome ? "/" : "/column"} onMouseEnter={closePanel}>
            <BrandMark image={getImage(content, "common.header.logo")} name={getText(content, "common.brand.name")} compact plain />
            {!isHome ? <span className={styles.badge} {...textEditProps("common.header.columnBadge")}>{getText(content, "common.header.columnBadge")}</span> : null}
          </Link>

          <nav className={styles.nav} aria-label="주 메뉴">
            <button type="button" className={styles.hasMenu} onMouseEnter={() => showPanel("concerns")} onFocus={() => showPanel("concerns")} onClick={() => togglePanel("concerns")} aria-expanded={panel === "concerns"}>피부 고민 <i aria-hidden="true" /></button>
            {menuGroups.map((group) => group.items.length ? (
              <button type="button" key={group.slug} onMouseEnter={() => showPanel(group.slug)} onFocus={() => showPanel(group.slug)} onClick={() => togglePanel(group.slug)} aria-expanded={panel === group.slug}>{group.name}</button>
            ) : (
              <Link key={group.slug} href={`/column/category/${group.slug}`} onMouseEnter={closePanel}>{group.name}</Link>
            ))}
            <Link href={lastHref} onMouseEnter={closePanel}>{lastLabel}</Link>
          </nav>

          <div className={styles.locales} aria-label="언어 선택">
            <Link href="/?locale=en" aria-label="English"><Flag locale="us" /></Link>
            <Link href="/?locale=zh" aria-label="中文"><Flag locale="cn" /></Link>
            <Link href="/?locale=ja" aria-label="日本語"><Flag locale="jp" /></Link>
          </div>

          <div className={styles.mobileActions}>
            <Link className={styles.mobileSearch} href="/column#search" aria-label="칼럼 검색">
              <MagnifyingGlassIcon aria-hidden="true" />
            </Link>
            <button type="button" className={styles.menuButton} aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={mobileOpen} onClick={() => { closePanel(); setMobileOpen((value) => !value); }}>
              {mobileOpen ? <XMarkIcon aria-hidden="true" /> : <Bars3Icon aria-hidden="true" />}
            </button>
          </div>
        </header>

        <div className={`${styles.megaMenu} ${panel ? styles.megaMenuVisible : ""}`} aria-hidden={!panel}>
          {panel === "concerns" ? (
            <div className={styles.concernGrid}>
              {concerns.map((concern) => (
                <Link href={concern.link} key={concern.num} onClick={closePanel}>
                  <span>{concern.num}</span>
                  <span><b>{concern.name}</b><small>{concern.desc}</small></span>
                  <i aria-hidden="true">→</i>
                </Link>
              ))}
            </div>
          ) : selectedGroup ? (
            <section className={styles.treatmentPanel}>
              <header>
                <b>{selectedGroup.name}</b>
                <div className={styles.panelHeaderLinks}>
                  <Link href={getTreatmentCategoryPath(selectedGroup.slug)} onClick={closePanel}>{selectedGroup.name} 칼럼 전체 보기 →</Link>
                  <span>{selectedGroup.nameEn}</span>
                </div>
              </header>
              <div className={styles.treatmentGrid}>
                {selectedGroup.items.map((item) => {
                  const image = getImage(content, `treatments.${item.slug}.thumbnail`);
                  const hasLocalImage = image.src?.startsWith("/uploads/");
                  const menuNameId = `treatments.${item.slug}.menuName`;
                  const menuLabel = getText(content, menuNameId);
                  return (
                    <Link href={item.detailPath} key={item.slug} onClick={closePanel}>
                      <span className={styles.itemVisual}>
                        {hasLocalImage ? <ImageSlot className={styles.itemImage} label="" alt={image.alt} image={image} editId={`treatments.${item.slug}.thumbnail`} sizes="70px" unoptimized /> : <span className={styles.itemFallback} aria-hidden="true">{menuLabel.charAt(0)}</span>}
                      </span>
                      <span><b {...textEditProps(menuNameId)}>{menuLabel}</b>{item.menuDesc ? <small>{item.menuDesc}</small> : null}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuVisible : ""}`} aria-hidden={!mobileOpen}>
          <section>
            <button type="button" aria-expanded={mobileCategory === "concerns"} onClick={() => setMobileCategory(mobileCategory === "concerns" ? null : "concerns")}><span>피부 고민</span><span>{mobileCategory === "concerns" ? "−" : "+"}</span></button>
            {mobileCategory === "concerns" ? <div>{concerns.map((concern) => <Link href={concern.link} key={concern.num} onClick={() => setMobileOpen(false)}><b>{concern.name}</b><small>{concern.desc}</small></Link>)}</div> : null}
          </section>
          {menuGroups.map((group) => {
            const expanded = mobileCategory === group.slug;
            return group.items.length ? <section key={group.slug}><button type="button" aria-expanded={expanded} onClick={() => setMobileCategory(expanded ? null : group.slug)}><span>{group.name}</span><span>{expanded ? "−" : "+"}</span></button>{expanded ? <div>{group.items.map((item) => {
              const menuNameId = `treatments.${item.slug}.menuName`;
              return <Link href={item.detailPath} key={item.slug} onClick={() => { setMobileOpen(false); setMobileCategory(null); }}><b {...textEditProps(menuNameId)}>{getText(content, menuNameId)}</b>{item.menuDesc ? <small>{item.menuDesc}</small> : null}</Link>;
            })}</div> : null}</section> : <Link className={styles.mobileCategoryLink} key={group.slug} href={`/column/category/${group.slug}`} onClick={() => setMobileOpen(false)}>{group.name}</Link>;
          })}
          <Link className={styles.mobileLastLink} href={lastHref} onClick={() => setMobileOpen(false)}>{lastLabel}</Link>
          <div className={styles.mobileLocales} aria-label="언어 선택">
            <Link href="/?locale=en" aria-label="English"><Flag locale="us" /></Link>
            <Link href="/?locale=zh" aria-label="中文"><Flag locale="cn" /></Link>
            <Link href="/?locale=ja" aria-label="日本語"><Flag locale="jp" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
