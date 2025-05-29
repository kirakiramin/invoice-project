export const runtime = 'nodejs'
import {NextResponse} from "next/server";

export async function POST() {
  const response = NextResponse.json({message: "로그인 성공"});

  response.cookies.set({
    name: "isLoggedIn",
    value: "true",
    httpOnly: true, // JavaScript에서 접근 불가능 (보안 강화)
    sameSite: "strict", // CSRF 공격 방지
    path: "/", // 모든 경로에서 사용 가능
    maxAge: 21600, // 6시간 유지
  });

  return response;
}
