import { NextResponse } from "next/server";
import { hasAdminSessionFromRequest } from "@/lib/admin/auth";
import { getStoreSettings, setAcceptingOrders } from "@/lib/db/store-settings";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getStoreSettings();
    return NextResponse.json(
      { settings },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("admin store settings load failed", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!hasAdminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let acceptingOrders: boolean;
  try {
    const body = (await request.json()) as { acceptingOrders?: boolean };
    if (typeof body.acceptingOrders !== "boolean") {
      return NextResponse.json({ error: "Invalid acceptingOrders value" }, { status: 400 });
    }
    acceptingOrders = body.acceptingOrders;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const settings = await setAcceptingOrders(acceptingOrders);
    return NextResponse.json(
      { settings },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("admin store settings update failed", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
