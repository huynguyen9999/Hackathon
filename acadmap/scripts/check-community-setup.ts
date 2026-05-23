#!/usr/bin/env node
/**
 * Verifies community write prerequisites (env vars + optional Supabase reachability).
 * Usage: npm run check:community-setup
 */

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
  console.warn("WARN NEXT_PUBLIC_SITE_URL not set (OAuth redirects may fail locally)");
}

if (!ok) {
  console.error("\nSee docs/COMMUNITY-SETUP.md for Supabase + Vercel configuration.");
  process.exit(1);
}

console.log("\nEnv check passed. Next: run schema.sql in Supabase, sign in, run bootstrap-community.sql");
