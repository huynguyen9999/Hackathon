#!/usr/bin/env bash
# Push Supabase env vars from .env.local to Vercel (run after creating Supabase project).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy .env.example and fill in Supabase keys first."
  exit 1
fi

# shellcheck disable=SC1091
source .env.local

for key in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_SITE_URL; do
  val="${!key:-}"
  if [[ -z "$val" ]]; then
    echo "Missing $key in .env.local"
    exit 1
  fi
  for env in production development; do
    printf '%s' "$val" | vercel env add "$key" "$env" --force
  done
  vercel env add "$key" preview --value "$val" --yes --force
  echo "Set $key on Vercel"
done

echo "Done. Redeploy: vercel --prod --yes"
