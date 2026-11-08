import Link from "next/link";
import { getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import styles from "./FloatingQuickMenu.module.css";

type FloatingQuickMenuProps = { compact?: boolean; content: SiteContent };

export function FloatingQuickMenu({ content, compact = false }: FloatingQuickMenuProps) {
  return (
    <aside className={`${styles.menu} ${compact ? styles.compact : ""}`} aria-label="빠른 상담 메뉴">
      <div className={styles.head}><b {...textEditProps("common.quick.title")}>{getText(content, "common.quick.title")}</b>{compact ? <span>{getText(content, "common.clinic.phone")}</span> : null}</div>
      <Link href={compact ? "#" : "tel:0269587525"} {...textEditProps(compact ? "common.quick.kakao" : "home.location.phoneLabel")}>{getText(content, compact ? "common.quick.kakao" : "home.location.phoneLabel")}</Link>
      <Link href="#" {...textEditProps(compact ? "common.quick.blog" : "common.quick.kakao")}>{getText(content, compact ? "common.quick.blog" : "common.quick.kakao")}</Link>
      <Link href="#location" {...textEditProps("common.quick.location")}>{getText(content, "common.quick.location")}</Link>
      <Link href={compact ? "/" : "/column"} {...textEditProps(compact ? "common.quick.homepage" : "common.quick.column")}>{getText(content, compact ? "common.quick.homepage" : "common.quick.column")}</Link>
    </aside>
  );
}
