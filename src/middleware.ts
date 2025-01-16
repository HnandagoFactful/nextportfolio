import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export default createMiddleware(routing);

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const { pathname } = url
  if (pathname.includes(`json-to-sql`)) {
    return NextResponse.redirect(new URL('/en', req.url))
  }

  return NextResponse.next()

}

export const config = {
  matcher: ["/", "/(es|en)/:path*"], // At this line, define into the matcher all the availables language you have defined into routing.ts
};