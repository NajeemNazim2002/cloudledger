import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  LEGACY_ADMIN_COOKIE_NAME,
  PREVIOUS_ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie.name, "", {
    ...adminSessionCookie.options,
    maxAge: 0,
  });
  response.cookies.set(PREVIOUS_ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(LEGACY_ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
  return response;
}
