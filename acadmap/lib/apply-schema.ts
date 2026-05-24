import { readFileSync } from "fs";
import path from "path";

import { Client } from "pg";

export type ApplySchemaResult = {
  statementsRun: number;
  message: string;
};

function getPostgresUrl(): string {
  const url =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.SUPABASE_DB_URL;

  if (!url || url.length < 20) {
    throw new Error("Missing POSTGRES_URL for schema application");
  }

  return url;
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

  const client = new Client({
    connectionString: getPostgresUrl(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  let statementsRun = 0;

  try {
    for (const statement of statements) {
      await client.query(statement);
      statementsRun++;
    }
  } finally {
    await client.end();
  }

  return {
    statementsRun,
    message: `Applied ${statementsRun} SQL statements from supabase/schema.sql`,
  };
}
