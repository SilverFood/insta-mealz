import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, clearAdminSessionCookieOptions } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clearAdminSessionCookieOptions());
  return response;
}
