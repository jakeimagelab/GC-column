import type { SiteContent } from "@/content/site-content-types";
import { getText, textEditProps } from "@/content/site-content-types";
import styles from "./ColumnFooter.module.css";

export function ColumnFooter({ content }: { content: SiteContent }) {
  return (
    <footer className={styles.footer} data-scroll-world-scene data-scroll-world-strength="soft">
      <div data-scroll-world-layer="copy"><b {...textEditProps("column.footer.brand")}>{getText(content, "column.footer.brand")}</b><p {...textEditProps("column.footer.notice")}>{getText(content, "column.footer.notice")}</p><p {...textEditProps("column.footer.business")}>{getText(content, "column.footer.business")}</p></div>
      <div data-scroll-world-layer="counter"><p {...textEditProps("column.footer.links")}>{getText(content, "column.footer.links")}</p><p {...textEditProps("column.footer.sitemap")}>{getText(content, "column.footer.sitemap")}</p></div>
    </footer>
  );
}
