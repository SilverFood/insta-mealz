import { createClient, type Client } from "@libsql/client";
import { getTursoConfig } from "@/lib/env";

let client: Client | null = null;

export function getDb(): Client {
  if (client) return client;

  const { url, authToken } = getTursoConfig();
  client = createClient({ url, authToken });
  return client;
}
