import { NextResponse } from "next/server";
import { SESSION_COOKIE, cookieSecure } from "@lib/auth/session";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(null),
    path: "/",
    maxAge: 0,
  });
  return res;
}