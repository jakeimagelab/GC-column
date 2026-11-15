import Link from "next/link";
import type { SiteContent } from "@/content/site-content-types";
import { getText, textEditProps } from "@/content/site-content-types";
import { FooterPolicyLinks } from "./FooterPolicyLinks";
import styles from "./ColumnFooter.module.css";

export function ColumnFooter({ content }: { content: SiteContent }) {
  const youtube = getText(content, "clinic.sameAs.youtube");
  const instagram = getText(content, "clinic.sameAs.instagram");
  return (
    <footer className={styles.footer} data-scroll-world-scene data-scroll-world-strength="soft">
      <div data-scroll-world-layer="copy"><b {...textEditProps("column.footer.brand")}>{getText(content, "column.footer.brand")}</b><p {...textEditProps("column.footer.notice")}>{getText(content, "column.footer.notice")}</p><p {...textEditProps("column.footer.business")}>{getText(content, "column.footer.business")}</p></div>
      <nav aria-label="푸터 메뉴" data-scroll-world-layer="counter"><div><Link href="/">홈페이지</Link><Link href="/column">원장 칼럼</Link>{instagram ? <a href={instagram} target="_blank" rel="noopener noreferrer">인스타그램</a> : null}{youtube ? <a href={youtube} target="_blank" rel="noopener noreferrer">유튜브</a> : null}</div><FooterPolicyLinks content={content} /><div><a href="/rss.xml">RSS</a><a href="/sitemap.xml">사이트맵</a></div></nav>
    </footer>
  );
}
