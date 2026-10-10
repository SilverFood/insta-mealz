import { getDb } from "@/lib/db/client";

export type StoreSettings = {
  acceptingOrders: boolean;
  updatedAt: string | null;
};

function parseBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const db = getDb();
  try {
    const result = await db.execute({
      sql: `SELECT accepting_orders, updated_at
            FROM store_settings
            WHERE id = 1
            LIMIT 1`,
    });

    if (!result.rows.length) {
      return { acceptingOrders: true, updatedAt: null };
    }

    const row = result.rows[0];
    return {
      acceptingOrders: parseBool(row.accepting_orders),
      updatedAt: row.updated_at ? String(row.updated_at) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("no such table: store_settings")) {
      return { acceptingOrders: true, updatedAt: null };
    }
    throw error;
  }
}

export async function setAcceptingOrders(acceptingOrders: boolean): Promise<StoreSettings> {
  const db = getDb();
  const updatedAt = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO store_settings (id, accepting_orders, updated_at)
          VALUES (1, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            accepting_orders = excluded.accepting_orders,
            updated_at = excluded.updated_at`,
    args: [acceptingOrders ? 1 : 0, updatedAt],
  });

  return {
    acceptingOrders,
    updatedAt,
  };
}
