import "server-only";
import { createHash, createHmac, randomBytes, scrypt as cryptoScrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cloudledger_admin_session_v3";
export const PREVIOUS_ADMIN_COOKIE_NAME = "cloudledger_admin_session_v2";
export const LEGACY_ADMIN_COOKIE_NAME = "cloudledger_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const PASSWORD_HASH_BYTES = 64;
const PASSWORD_SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function adminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

export async function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword || !safeEqual(username, expectedUsername)) return null;

  let account: Awaited<ReturnType<typeof getAdminAccount>>;
  try {
    account = await getAdminAccount();
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    console.warn("Admin account database is unavailable; falling back to environment credentials.");
    account = null;
  }

  if (account) {
    if (account.username !== username || !(await verifyPasswordHash(password, account.passwordHash))) return null;
    return { sessionVersion: account.sessionVersion };
  }

  if (!safeEqual(password, expectedPassword)) return null;
  return { sessionVersion: environmentAdminSessionVersion(expectedUsername, expectedPassword) };
}

export function createAdminSessionToken(sessionVersion: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  }

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${expiresAt}.${sessionVersion}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return { token: `${payload}.${signature}`, maxAge: SESSION_DURATION_SECONDS };
}

export async function isAdminAuthenticated() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return false;

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [expiresAtText, sessionVersion, signature, ...extra] = token.split(".");
  if (
    extra.length ||
    !/^\d+$/.test(expiresAtText) ||
    !/^[a-f0-9]{64}$/.test(sessionVersion) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;

  const currentSessionVersion = await getCurrentSessionVersion();
  if (!currentSessionVersion || !safeEqual(sessionVersion, currentSessionVersion)) return false;

  const expected = createHmac("sha256", secret).update(`${expiresAtText}.${sessionVersion}`).digest();
  const actual = Buffer.from(signature, "hex");
  return timingSafeEqual(actual, expected);
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await derivePassword(password, salt);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPasswordHash(password: string, encodedHash: string) {
  const [algorithm, saltHex, hashHex, ...extra] = encodedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    extra.length ||
    !/^[a-f0-9]{32}$/.test(saltHex) ||
    !new RegExp(`^[a-f0-9]{${PASSWORD_HASH_BYTES * 2}}$`).test(hashHex)
  ) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = await derivePassword(password, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(actual, expected);
}

export const adminSessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  },
};

async function getAdminAccount() {
  if (!process.env.DATABASE_URL) return null;

  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.adminAccount.findUnique({ where: { id: "main" } });
  } catch (error) {
    if (isMissingAdminAccountTable(error) || isDatabaseUnavailable(error)) {
      if (isMissingAdminAccountTable(error)) {
        console.warn("Admin account table is missing. Apply the Prisma schema before enabling email password recovery.");
      }
      return null;
    }
    throw error;
  }
}

async function getCurrentSessionVersion() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;

  try {
    const account = await getAdminAccount();
    return account?.sessionVersion ?? environmentAdminSessionVersion(username, password);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      console.warn("Admin session database is unavailable; falling back to environment-based session verification.");
      return environmentAdminSessionVersion(username, password);
    }
    console.error("Could not verify the admin session because the credential database is unavailable.", error);
    return null;
  }
}

export function environmentAdminSessionVersion(username: string, password: string) {
  return createHash("sha256").update(`${username}\0${password}`).digest("hex");
}

function derivePassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    cryptoScrypt(password, salt, PASSWORD_HASH_BYTES, PASSWORD_SCRYPT_OPTIONS, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function isMissingAdminAccountTable(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const prismaError = error as { code?: string; errorCode?: string; name?: string; message?: string; cause?: { code?: string } };
  const errorCode = prismaError.code ?? prismaError.errorCode ?? prismaError.cause?.code ?? "";
  const message = prismaError.message ?? "";

  return (
    ["P1001", "P1002", "P1017", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(errorCode) ||
    prismaError.name === "PrismaClientInitializationError" ||
    /can't reach database server|database server.*(running|reachable)|ECONNREFUSED|timed out/i.test(message)
  );
}

function safeEqual(actual: string, expected: string) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}
