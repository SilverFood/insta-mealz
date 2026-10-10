import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "instamealz_admin_session";

const SESSION_SALT = "instamealz-admin-session-v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAdminAccessKey(): string | null {
  const value = process.env.ADMIN_ACCESS_KEY?.trim();
  return value || null;
}

export function isAdminAccessConfigured(): boolean {
  return getAdminAccessKey() != null;
}

export function verifyAdminKey(input: string): boolean {
  const expected = getAdminAccessKey();
  if (!expected) return false;

  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function getExpectedSessionValue(): string | null {
  const key = getAdminAccessKey();
  if (!key) return null;
  return createHash("sha256").update(`${SESSION_SALT}:${key}`, "utf8").digest("hex");
}

export function isAdminSession(cookieValue: string | undefined): boolean {
  const expected = getExpectedSessionValue();
  if (!expected || !cookieValue) return false;

  const a = Buffer.from(cookieValue, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export type AdminSessionCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
  secure: boolean;
};

export function adminSessionCookieOptions(): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

export function clearAdminSessionCookieOptions(): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function hasAdminSessionFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  return isAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function hasAdminSessionFromRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_SESSION_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isAdminSession(value);
}
