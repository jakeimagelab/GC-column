import type { Metadata } from "next";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { ContentBoardPreviewBridge } from "@/components/ContentBoardPreviewBridge";
import { ScrollWorldJourney } from "@/components/motion/ScrollWorldJourney";
import { SITE_URL } from "@/content/site";
import { montserrat, nanumPenScript, notoSansKr } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "글로리의원", template: "%s" },
  description: "언주역 글로리의원",
  alternates: { types: { "application/rss+xml": `${SITE_URL}/rss.xml` } },
  robots: process.env.NODE_ENV === "development" ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${montserrat.variable} ${nanumPenScript.variable}`}>
      <body>
        {children}
        <ScrollWorldJourney />
        {process.env.NODE_ENV === "development" ? <ContentBoardPreviewBridge /> : null}
        {process.env.NEXT_PUBLIC_GA_ID ? <SiteAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
      </body>
    </html>
  );
}
