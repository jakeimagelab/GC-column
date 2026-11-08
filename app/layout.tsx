import type { Metadata } from "next";
import {
  Montserrat,
  Nanum_Pen_Script,
  Noto_Sans_KR,
} from "next/font/google";
import { SITE_URL } from "@/content/site";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const nanumPenScript = Nanum_Pen_Script({
  variable: "--font-nanum-pen-script",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "글로리의원",
  description: "언주역 글로리의원",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${montserrat.variable} ${nanumPenScript.variable}`}>
        {children}
      </body>
    </html>
  );
}
