#!/usr/bin/env node
/**
 * Configures Google OAuth + auth redirect URLs in Supabase via Management API.
 *
 * Required env (in .env.local or shell):
 *   SUPABASE_ACCESS_TOKEN
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   NEXT_PUBLIC_SUPABASE_URL
 *
 * Usage:
 *   npm run configure:google-oauth
 *   npm run configure:google-oauth -- --verify-only
 */

import { existsSync, readFileSync } from "fs";
import path from "path";

import {
  configureAuthUrls,
  configureGoogleOAuth,
  DEFAULT_AUTH_URL_CONFIG,
  GOOGLE_OAUTH_REDIRECT_URI,
  verifyGoogleOAuth,
} from "../lib/supabase-auth-config";

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

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  loadEnvLocal();

  const verifyOnly = process.argv.includes("--verify-only");

  if (verifyOnly) {
    const result = await verifyGoogleOAuth();
    console.log(
      result.ok ? "OK" : "FAIL",
      `(${result.status})`,
      result.message,
    );
    process.exit(result.ok ? 0 : 1);
  }

  const clientId = requireEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_OAUTH_CLIENT_SECRET");
  requireEnv("SUPABASE_ACCESS_TOKEN");
  requireEnv("NEXT_PUBLIC_SUPABASE_URL");

  console.log("Google Cloud redirect URI (must be in OAuth client):");
  console.log(`  ${GOOGLE_OAUTH_REDIRECT_URI}`);
  console.log("");

  console.log("Patching Supabase auth URL configuration…");
  await configureAuthUrls(DEFAULT_AUTH_URL_CONFIG);
  console.log("OK site_url + redirect URLs");

  console.log("Patching Supabase Google provider…");
  await configureGoogleOAuth({ clientId, clientSecret });
  console.log("OK Google client ID + secret");

  console.log("Verifying Google OAuth authorize endpoint…");
  let result = await verifyGoogleOAuth();
  for (let attempt = 1; !result.ok && attempt <= 6; attempt++) {
    console.log(
      `Waiting for Supabase auth config to propagate (attempt ${attempt}/6)…`,
    );
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    result = await verifyGoogleOAuth();
  }
  console.log(
    result.ok ? "OK" : "FAIL",
    `(${result.status})`,
    result.message,
  );

  if (!result.ok) {
    process.exit(1);
  }

  console.log("\nGoogle OAuth is ready. Test at /contribute → Continue with Google.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
