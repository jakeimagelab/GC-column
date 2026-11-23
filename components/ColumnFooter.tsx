import Link from "next/link";
import type { SiteContent } from "@/content/site-content-types";
import { getText, textEditProps } from "@/content/site-content-types";
import { FooterPolicyLinks } from "./FooterPolicyLinks";
import styles from "./ColumnFooter.module.css";

export function ColumnFooter({ content, legal }: { content: SiteContent; legal?: string }) {
  return (
    <footer className={`${styles.footer} ${legal ? styles.detail : ""}`}>
      <div>
        <p><b {...textEditProps("column.footer.brand")}>{getText(content, "column.footer.brand")}</b><span> | 원장 칼럼</span></p>
        {!legal ? <p {...textEditProps("column.footer.intro")}>{getText(content, "column.footer.intro")}</p> : null}
        {legal ? <p>{legal}</p> : null}
        <small>© 2026 글로리의원</small>
      </div>
      <nav aria-label="푸터 메뉴"><Link href="/">홈페이지</Link><FooterPolicyLinks content={content} includePatientRights={!legal} /></nav>
    </footer>
  );
}
