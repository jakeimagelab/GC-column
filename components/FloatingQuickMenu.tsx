import Link from "next/link";
import styles from "./FloatingQuickMenu.module.css";

type FloatingQuickMenuProps = { compact?: boolean };

export function FloatingQuickMenu({ compact = false }: FloatingQuickMenuProps) {
  return (
    <aside className={`${styles.menu} ${compact ? styles.compact : ""}`} aria-label="빠른 상담 메뉴">
      <div className={styles.head}><b>예약·상담</b>{compact ? <span>02.6958.7525</span> : null}</div>
      <Link href={compact ? "#" : "tel:0269587525"}>{compact ? "카톡상담" : "전화"}</Link>
      <Link href="#">{compact ? "블로그" : "카톡상담"}</Link>
      <Link href="#location">오시는길</Link>
      <Link href={compact ? "/" : "/column"}>{compact ? "홈페이지" : "원장 칼럼"}</Link>
    </aside>
  );
}
