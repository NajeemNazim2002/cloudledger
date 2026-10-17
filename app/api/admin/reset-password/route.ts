import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashAdminPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(40).max(100),
  password: z.string().min(12).max(256),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Use a reset link and a password of at least 12 characters." }, { status: 400 });
  }

  const username = process.env.ADMIN_USERNAME;
  const recoveryEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim().toLowerCase();
  if (!username || !recoveryEmail) {
    console.error("Admin password reset is not configured. Set ADMIN_USERNAME and ADMIN_RECOVERY_EMAIL.");
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable. Please contact the site administrator." },
      { status: 503 },
    );
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  try {
    const passwordHash = await hashAdminPassword(parsed.data.password);
    const updated = await prisma.adminAccount.updateMany({
      where: {
        id: "main",
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
      data: {
        username,
        passwordHash,
        recoveryEmail,
        sessionVersion: randomBytes(32).toString("hex"),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        resetRequestedAt: null,
      },
    });
    if (updated.count === 0) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired. Request a new password reset link." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Could not reset the admin password.", error);
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
