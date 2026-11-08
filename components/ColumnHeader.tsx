"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, megaMenuTreatmentOrder, treatments } from "@/content/treatments";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  variant?: "taupe" | "overlay";
};

export function ColumnHeader({ variant = "taupe" }: ColumnHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<string>(categories[0].slug);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const groups = categories.map((category) => ({
    ...category,
    items: megaMenuTreatmentOrder[category.slug].flatMap((slug) => {
      const treatment = treatments.find((item) => item.slug === slug);
      return treatment ? [treatment] : [];
    }),
  }));

  return (
    <div
      className={`${styles.shell} ${styles[variant]} ${isOpen ? styles.open : ""}`}
      onMouseLeave={() => setIsOpen(false)}
      data-megamenu-open={isOpen ? "true" : "false"}
    >
      <header className={styles.header}>
        <Link className={styles.brand} href="/column">
          <span>G 글로리의원</span>
          <span className={styles.badge}>원장 칼럼</span>
        </Link>

        <nav
          className={styles.nav}
          aria-label="칼럼 카테고리"
          onMouseEnter={() => setIsOpen(true)}
        >
          {groups.map((group) => (
            <Link
              key={group.slug}
              href={`/column?category=${group.slug}`}
              onFocus={() => setIsOpen(true)}
            >
              {group.name}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/column#search">칼럼 검색</Link>
          <Link href="/">홈페이지 →</Link>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="칼럼 메뉴 열기"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {isOpen ? (
        <div className={styles.megaMenu}>
          {groups.map((group) => (
            <section className={styles.megaGroup} key={group.slug}>
              <Link className={styles.groupTitle} href={`/column?category=${group.slug}`}>
                <span>{group.name}</span>
                <small>칼럼 [N]</small>
              </Link>
              <div className={styles.groupItems}>
                {group.items.map((item) => (
                  <Link href={`/column?category=${group.slug}&treatment=${item.slug}`} key={item.slug}>
                    <span className={styles.itemSlot}>[장비·제품]</span>
                    <span className={styles.itemCopy}>
                      <b>{item.name}</b>
                      <span>{item.desc}</span>
                      <small>관련 칼럼 [N]편 →</small>
                    </span>
                  </Link>
                ))}
              </div>
              <button type="button" aria-label={`${group.name} 시술 더 보기`} className={styles.moreButton}>+</button>
            </section>
          ))}
        </div>
      ) : null}

      {mobileOpen ? (
        <div className={styles.mobileMenu}>
          {groups.map((group) => {
            const expanded = mobileCategory === group.slug;
            return (
              <section key={group.slug}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setMobileCategory(expanded ? "" : group.slug)}
                >
                  <span>{group.name}</span><span>{expanded ? "−" : "+"}</span>
                </button>
                {expanded ? (
                  <div>
                    {group.items.map((item) => (
                      <Link href={`/column?category=${group.slug}&treatment=${item.slug}`} key={item.slug}>
                        <b>{item.name}</b><span>{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
          <div className={styles.mobileLinks}>
            <Link href="/column#search">칼럼 검색</Link>
            <Link href="/">홈페이지 →</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
