import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  getExpectedSessionValue,
  isAdminAccessConfigured,
  verifyAdminKey,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminAccessConfigured()) {
    return NextResponse.json({ error: "Admin access is not configured" }, { status: 503 });
  }

  let body: { key?: string };
  try {
    body = (await request.json()) as { key?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const key = body.key?.trim();
  if (!key) {
    return NextResponse.json({ error: "Access key is required" }, { status: 400 });
  }

  if (!verifyAdminKey(key)) {
    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  }

  const sessionValue = getExpectedSessionValue();
  if (!sessionValue) {
    return NextResponse.json({ error: "Admin access is not configured" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionValue, adminSessionCookieOptions());
  return response;
}
