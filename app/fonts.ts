import {
  Cormorant_Garamond,
  Montserrat,
  Nanum_Pen_Script,
  Noto_Sans_KR,
  Noto_Serif_KR,
} from "next/font/google";

export const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["300", "400", "500", "700"],
  preload: false,
  display: "swap",
});

export const montserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const nanumPenScript = Nanum_Pen_Script({
  variable: "--font-nanum-pen-script",
  weight: "400",
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

export const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["300", "400", "500"],
  preload: false,
  display: "swap",
});

export const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});
