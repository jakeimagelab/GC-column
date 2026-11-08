"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import { getImage, getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { categories, megaMenuTreatmentOrder, treatments } from "@/content/treatments";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  variant?: "taupe" | "overlay";
  page?: "main" | "detail";
  content: SiteContent;
};

export function ColumnHeader({ content, variant = "taupe", page = "detail" }: ColumnHeaderProps) {
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
          <BrandMark image={getImage(content, "common.header.logo")} name={getText(content, "common.brand.name")} compact plain />
          <span className={styles.badge} {...textEditProps("common.header.columnBadge")}>{getText(content, "common.header.columnBadge")}</span>
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
          {page === "main" ? (
            <>
              <Link href="/" {...textEditProps("common.header.homepage")}>{getText(content, "common.header.homepage")}</Link>
              <span {...textEditProps("common.header.locales")}>{getText(content, "common.header.locales")}</span>
            </>
          ) : (
            <>
              <Link href="/column#search" {...textEditProps("common.header.search")}>{getText(content, "common.header.search")}</Link>
              <Link href="/" {...textEditProps("common.header.homepage")}>{getText(content, "common.header.homepage")}</Link>
            </>
          )}
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
                <small {...textEditProps("common.header.columnCount")}>{getText(content, "common.header.columnCount")}</small>
              </Link>
              <div className={styles.groupItems}>
                {group.items.map((item) => (
                  <Link href={`/column?category=${group.slug}&treatment=${item.slug}`} key={item.slug}>
                    <span className={styles.itemSlot} {...textEditProps("common.header.equipmentLabel")}>{getText(content, "common.header.equipmentLabel")}</span>
                    <span className={styles.itemCopy}>
                      <b>{item.name}</b>
                      <span>{item.desc}</span>
                      <small {...textEditProps("common.header.relatedCount")}>{getText(content, "common.header.relatedCount")}</small>
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
            {page === "main" ? (
              <><Link href="/" {...textEditProps("common.header.homepage")}>{getText(content, "common.header.homepage")}</Link><span {...textEditProps("common.header.locales")}>{getText(content, "common.header.locales")}</span></>
            ) : (
              <><Link href="/column#search" {...textEditProps("common.header.search")}>{getText(content, "common.header.search")}</Link><Link href="/" {...textEditProps("common.header.homepage")}>{getText(content, "common.header.homepage")}</Link></>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
