import type { Metadata } from "next";
import { SITE_URL } from "@/content/site";
import { montserrat, nanumPenScript, notoSansKr } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "글로리의원",
  description: "언주역 글로리의원",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${montserrat.variable} ${nanumPenScript.variable}`}>
      <body>{children}</body>
    </html>
  );
}
