import type { SiteContent } from "@/content/site-content-types";
import { attributeEditProps, getText, textEditProps } from "@/content/site-content-types";

export function FooterPolicyLinks({ content, className }: { content: SiteContent; className?: string }) {
  return (
    <p className={className}>
      <a href={getText(content, "home.footer.privacyUrl")} {...attributeEditProps("home.footer.privacyUrl", "href")}>
        <span {...textEditProps("home.footer.privacyLabel")}>{getText(content, "home.footer.privacyLabel")}</span>
      </a>
      <span aria-hidden="true"> · </span>
      <a href={getText(content, "home.footer.nonpayUrl")} {...attributeEditProps("home.footer.nonpayUrl", "href")}>
        <span {...textEditProps("home.footer.nonpayLabel")}>{getText(content, "home.footer.nonpayLabel")}</span>
      </a>
      <span aria-hidden="true"> · </span>
      <span {...textEditProps("home.footer.patientRightsLabel")}>{getText(content, "home.footer.patientRightsLabel")}</span>
    </p>
  );
}
