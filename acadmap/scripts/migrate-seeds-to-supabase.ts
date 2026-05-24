#!/usr/bin/env node
/**
 * Migrate all JSON seeds in data/seeds/ to Supabase as approved roadmaps.
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Usage:
 *   npm run migrate:seeds
 *   npm run migrate:seeds -- --force
 */

import { existsSync, readFileSync } from "fs";
import path from "path";

import { runSeedMigration } from "../lib/migrate-seeds";

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    const existing = process.env[key];
    const isPlaceholder =
      !existing || existing === '""' || existing.length < 8;
    if (isPlaceholder && value && value !== '""' && value.length >= 8) {
      process.env[key] = value;
    } else if (!existing) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.length < 8
  ) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (Vercel env pull redacts secrets — copy service_role key from Supabase dashboard, or POST /api/admin/ops on production)",
    );
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const result = await runSeedMigration({ force });

  for (const line of result.logs) {
    console.log(line);
  }

  if (result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
