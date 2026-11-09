import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const indexNowKey = process.env.INDEXNOW_KEY?.trim();

  if (indexNowKey && pathname === `/${indexNowKey}.txt`) {
    return new Response(indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const lowerPath = pathname.toLowerCase();
  if (pathname !== lowerPath) {
    const url = request.nextUrl.clone();
    url.pathname = lowerPath;
    return NextResponse.redirect(url, 301);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2)$).*)"],
};
