import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { environmentAdminSessionVersion, hashAdminPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
});
const genericResponse = {
  message: "If the address matches the configured recovery email, a password reset link will be sent.",
};
const tokenLifetimeMs = 30 * 60 * 1000;
const minimumRequestIntervalMs = 60 * 1000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const recoveryEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim().toLowerCase();
  const username = process.env.ADMIN_USERNAME;
  const initialPassword = process.env.ADMIN_PASSWORD;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const appUrl = getAppOrigin();
  if (!recoveryEmail || !username || !initialPassword || !apiKey || !from || !appUrl) {
    console.error("Admin password recovery is not configured. Set ADMIN_RECOVERY_EMAIL, Resend settings, and APP_URL.");
    return NextResponse.json(
      { error: "Password recovery is temporarily unavailable. Please contact the site administrator." },
      { status: 503 },
    );
  }

  if (parsed.data.email !== recoveryEmail) return NextResponse.json(genericResponse);

  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  let account: Awaited<ReturnType<typeof prisma.adminAccount.findUnique>>;
  try {
    account = await prisma.adminAccount.findUnique({ where: { id: "main" } });
    if (!account) {
      const passwordHash = await hashAdminPassword(initialPassword);
      try {
        await prisma.adminAccount.create({
          data: {
            id: "main",
            username,
            passwordHash,
            recoveryEmail,
            sessionVersion: environmentAdminSessionVersion(username, initialPassword),
            resetTokenHash: tokenHash,
            resetTokenExpiresAt: new Date(now.getTime() + tokenLifetimeMs),
            resetRequestedAt: now,
          },
        });
      } catch (error) {
        if (isUniqueConflict(error)) return NextResponse.json(genericResponse);
        throw error;
      }
    } else {
      if (account.resetRequestedAt && now.getTime() - account.resetRequestedAt.getTime() < minimumRequestIntervalMs) {
        return NextResponse.json(genericResponse);
      }
      const updated = await prisma.adminAccount.updateMany({
        where: { id: "main", resetRequestedAt: account.resetRequestedAt },
        data: {
          username,
          recoveryEmail,
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: new Date(now.getTime() + tokenLifetimeMs),
          resetRequestedAt: now,
        },
      });
      if (updated.count === 0) return NextResponse.json(genericResponse);
    }
  } catch (error) {
    console.error("Could not prepare the admin password reset.", error);
    return NextResponse.json(
      { error: "Password recovery is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const resetUrl = new URL("/admin/login/reset-password", appUrl);
  resetUrl.hash = new URLSearchParams({ token }).toString();
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recoveryEmail],
        subject: "Reset your CloudLedger admin password",
        text: [
          "A request was made to reset the CloudLedger admin password.",
          `Open this link within 30 minutes to choose a new password: ${resetUrl}`,
          "If you did not request this, you can ignore this email.",
        ].join("\n\n"),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error(`Resend rejected the admin password reset email (HTTP ${response.status}).`);
      await clearResetToken(tokenHash);
      return NextResponse.json(
        { error: "Could not send a password reset email. Please try again later." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Could not send the admin password reset email through Resend.", error);
    await clearResetToken(tokenHash);
    return NextResponse.json(
      { error: "Could not send a password reset email. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json(genericResponse);
}

function getAppOrigin() {
  const configuredUrl = process.env.APP_URL;
  if (!configuredUrl) return null;
  try {
    const url = new URL(configuredUrl);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      (process.env.NODE_ENV === "production" && url.protocol !== "https:")
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

async function clearResetToken(tokenHash: string) {
  try {
    await prisma.adminAccount.updateMany({
      where: { id: "main", resetTokenHash: tokenHash },
      data: { resetTokenHash: null, resetTokenExpiresAt: null },
    });
  } catch (error) {
    console.error("Could not clear the unsent admin password reset token.", error);
  }
}

function isUniqueConflict(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
