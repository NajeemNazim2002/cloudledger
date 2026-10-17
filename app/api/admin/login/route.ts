import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminAuthConfigured,
  adminSessionCookie,
  createAdminSessionToken,
  LEGACY_ADMIN_COOKIE_NAME,
  PREVIOUS_ADMIN_COOKIE_NAME,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

const loginSchema = z.object({
  username: z.string().min(1).max(128),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured. Set the admin values in your .env file." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a username and password." }, { status: 400 });
  }

  let credentials: Awaited<ReturnType<typeof verifyAdminCredentials>>;
  try {
    credentials = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
  } catch (error) {
    console.error("Could not verify admin credentials.", error);
    return NextResponse.json({ error: "Admin sign-in is temporarily unavailable. Please try again." }, { status: 503 });
  }
  if (!credentials) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  const session = createAdminSessionToken(credentials.sessionVersion);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie.name, session.token, {
    ...adminSessionCookie.options,
    maxAge: session.maxAge,
  });
  response.cookies.set(LEGACY_ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
  response.cookies.set(PREVIOUS_ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
