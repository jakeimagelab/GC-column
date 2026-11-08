import Link from "next/link";
import { columnNav } from "@/content/site";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  variant?: "taupe" | "overlay";
};

export function ColumnHeader({ variant = "taupe" }: ColumnHeaderProps) {
  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      <Link className={styles.brand} href="/column">
        <span>G 글로리의원</span>
        <span className={styles.badge}>원장 칼럼</span>
      </Link>
      <nav className={styles.nav} aria-label="칼럼 카테고리">
        {columnNav.map((item) => (
          <Link key={item} href="/column">
            {item}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <Link href="/column">칼럼 검색</Link>
        <Link href="/">홈페이지 →</Link>
      </div>
    </header>
  );
}
