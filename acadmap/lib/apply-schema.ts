import { readFileSync } from "fs";
import path from "path";

import { Client } from "pg";

export type ApplySchemaResult = {
  statementsRun: number;
  message: string;
};

function getPostgresUrl(): string {
  const raw =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.SUPABASE_DB_URL;

  if (!raw || raw.length < 20) {
    throw new Error("Missing POSTGRES_URL for schema application");
  }

  const url = new URL(raw);
  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "no-verify");
  }

  return url.toString();
}

function splitSqlStatements(sql: string): string[] {
  const withoutComments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return withoutComments
    .split(";")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

export async function applyDatabaseSchema(): Promise<ApplySchemaResult> {
  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const sql = readFileSync(schemaPath, "utf-8");
  const statements = splitSqlStatements(sql);
  const connectionString = getPostgresUrl();
  const host = new URL(connectionString).hostname;

  const previousTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const client = new Client({
    connectionString,
    ssl: {
      requestCert: false,
      rejectUnauthorized: false,
    },
  });

  let statementsRun = 0;

  try {
    await client.connect();

    for (const statement of statements) {
      await client.query(statement);
      statementsRun++;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Schema apply failed (${host}): ${message}`);
  } finally {
    await client.end().catch(() => undefined);
    if (previousTls === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTls;
    }
  }

  return {
    statementsRun,
    message: `Applied ${statementsRun} SQL statements from supabase/schema.sql via ${host}`,
  };
}
