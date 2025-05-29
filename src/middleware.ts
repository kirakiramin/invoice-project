import {NextRequest, NextResponse} from "next/server";

export function middleware(req: NextRequest) {
  console.log("[Middleware] 실행됨! 요청 URL:", req.nextUrl.pathname); // 미들웨어 실행 확인

  const isLoggedIn = req.cookies.get("isLoggedIn")?.value === "true"; // 서버에서 쿠키 확인
  console.log("로그인 상태:", isLoggedIn);

  const pathname = decodeURIComponent(req.nextUrl.pathname);

  const protectedPaths = ["/main", "/client-detail", "/balance", "sales"]; // 보호할 페이지 목록

  if (protectedPaths.some(path => pathname.startsWith(path)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/main",
    "/main/:path*",
    "/client-detail",
    "/client-detail/:path*",
    "/balance",
    "/balance/:path*",
    "/sales-monthly",
    "/sales-monthly/:path*",
    "/client-monthly",
    "/client-monthly/:path*",
  ],
};
