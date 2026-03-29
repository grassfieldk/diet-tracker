import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  const { pathname } = request.nextUrl;

  // 認証不要なパス
  const publicPaths = ["/login", "/auth/"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return authRes;
  }

  // 未認証なら /login へリダイレクト
  const session = await auth0.getSession(request);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return authRes;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw\\.js|swe-worker.*).*)",
  ],
};
