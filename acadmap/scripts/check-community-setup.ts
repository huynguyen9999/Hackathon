#!/usr/bin/env node
/**
 * Verifies community write prerequisites (env vars + optional Supabase reachability).
 * Usage: npm run check:community-setup
 */

import { existsSync, readFileSync } from "fs";
import path from "path";

import { verifyGoogleOAuth, verifyLinkedInOAuth } from "../lib/supabase-auth-config";

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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;

  let ok = true;

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing ${key}`);
      ok = false;
    } else {
      console.log(`OK ${key}`);
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    console.log(`OK NEXT_PUBLIC_SITE_URL=${process.env.NEXT_PUBLIC_SITE_URL}`);
  } else {
    console.warn(
      "WARN NEXT_PUBLIC_SITE_URL not set (OAuth redirects may fail locally)",
    );
  }

  if (!ok) {
    console.error(
      "\nSee docs/COMMUNITY-SETUP.md for Supabase + Vercel configuration.",
    );
    process.exit(1);
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("OK SUPABASE_SERVICE_ROLE_KEY");
  } else {
    console.warn(
      "WARN SUPABASE_SERVICE_ROLE_KEY not set (migrate:seeds will fail)",
    );
  }

  const google = await verifyGoogleOAuth();
  if (google.ok) {
    console.log("OK Google OAuth provider");
  } else {
    console.warn(`WARN Google OAuth: ${google.message}`);
    console.warn(
      "      Fix: docs/COMMUNITY-SETUP.md §3c or npm run configure:google-oauth",
    );
  }

  const linkedin = await verifyLinkedInOAuth();
  if (linkedin.ok) {
    console.log("OK LinkedIn OAuth provider");
  } else {
    console.warn(`WARN LinkedIn OAuth: ${linkedin.message}`);
    console.warn(
      "      Fix: docs/COMMUNITY-SETUP.md §3b or npm run configure:linkedin-oauth",
    );
  }

  console.log(
    "\nEnv check passed. Next: run schema.sql in Supabase, sign in, run bootstrap-community.sql, npm run migrate:seeds",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
