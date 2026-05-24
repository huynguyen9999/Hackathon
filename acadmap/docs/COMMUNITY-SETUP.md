# Live community writes — setup guide

Follow these steps once to enable Supabase-backed Q&A, reviews, and announcements.

## 1. Create Supabase project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Region: `us-east-1` (near Vercel iad1)
3. Save the database password

## 2. Run database schema

**SQL Editor** → New query → paste and run the full file:

```
acadmap/supabase/schema.sql
```

This creates roadmap tables, planner tables, and community tables (`user_profiles`, `community_questions`, `school_announcements`, etc.).

## 3. GitHub OAuth

### GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → New:

| Field | Value |
|-------|--------|
| Homepage URL | `https://hackathon-nu-taupe.vercel.app` |
| Callback URL | `https://<PROJECT-REF>.supabase.co/auth/v1/callback` |

### Supabase

**Authentication → Providers → GitHub** — paste Client ID + Secret, enable.

**Authentication → URL Configuration**

- Site URL: `https://hackathon-nu-taupe.vercel.app`
- Redirect URLs:
  - `https://hackathon-nu-taupe.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

## 3b. LinkedIn OAuth (OIDC)

Used for sign-in on `/contribute` and `/auth/sign-in` alongside GitHub.

1. [LinkedIn Developer Portal](https://www.linkedin.com/developers/) → **Create app**
2. **Products** → request **Sign In with LinkedIn using OpenID Connect**
3. **Auth** tab → add redirect URL: `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret**
5. Supabase → **Authentication → Providers → LinkedIn (OIDC)** → enable, paste credentials

No additional Next.js env vars — Supabase stores LinkedIn credentials.

**Troubleshooting:** If LinkedIn shows `redirect_uri_mismatch`, add this exact URL in the LinkedIn app **Auth** tab (not your Vercel URL):

`https://jhdxccwfisyhuqblartj.supabase.co/auth/v1/callback`

Also enable **Sign In with LinkedIn using OpenID Connect** under **Products**.

**Automated fix (optional):** With a [Supabase access token](https://supabase.com/dashboard/account/tokens) and LinkedIn credentials in `.env.local`:

```bash
cd acadmap
npm run configure:linkedin-oauth
```

Verify only (prints the callback URL Supabase sends to LinkedIn):

```bash
npm run configure:linkedin-oauth -- --verify-only
```

## 3c. Google OAuth

Primary sign-in for students on `/contribute` and `/auth/sign-in`.

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials** → **Create OAuth client ID**
2. Application type: **Web application**
3. Authorized redirect URI: `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret**
5. Supabase → **Authentication → Providers → Google** → enable, paste credentials

No additional Next.js env vars — Supabase stores Google credentials.

**Troubleshooting:** If sign-in shows `missing OAuth secret`, the Google provider is enabled but the **Client Secret** field in Supabase is empty. Re-paste both Client ID and Client Secret, click **Save**, wait ~30s, retry.

**Automated fix (optional):** With a [Supabase access token](https://supabase.com/dashboard/account/tokens) and Google OAuth credentials in `.env.local`:

```bash
cd acadmap
npm run configure:google-oauth
```

This also sets Site URL and redirect URLs via the Management API. Google Cloud redirect URI must be:

`https://jhdxccwfisyhuqblartj.supabase.co/auth/v1/callback`

## 4. Environment variables

### Vercel (Project → Settings → Environment Variables)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key |
| `NEXT_PUBLIC_SITE_URL` | `https://hackathon-nu-taupe.vercel.app` |

`SUPABASE_SERVICE_ROLE_KEY` is **local/scripts only** — add to `.env.local` for seed migration; do not expose as `NEXT_PUBLIC_*` on Vercel unless you add it as a server-only env var for admin routes.

Redeploy from `acadmap/`:

```bash
cd acadmap && vercel --prod --yes
```

Or push env vars from `.env.local` automatically:

```bash
cd acadmap
cp .env.example .env.local   # fill in Supabase URL + anon key
./scripts/push-community-env-to-vercel.sh
vercel --prod --yes
```

### Local

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# NEXT_PUBLIC_SITE_URL, and SUPABASE_SERVICE_ROLE_KEY (for migrate:seeds)
```

Verify:

```bash
npm run check:community-setup
```

Open `/contribute` — auth banner should offer sign-in (not dev setup text).

## 5. Bootstrap maintainer

1. Sign in: `/auth/sign-in?next=/schools/ucla`
2. Supabase → **Authentication → Users** → copy your UUID
3. SQL Editor → run [`supabase/scripts/bootstrap-community.sql`](../supabase/scripts/bootstrap-community.sql) with your UUID

## 6. Verified student badges

Answers show “Verified student” when your GitHub account’s **public email** ends with `@ucla.edu` or `@ucsb.edu`. Set this in GitHub → Settings → Emails → check “Keep my email addresses private” **off** and set a public school email.

## 7. Smoke test

1. `/schools/ucla` — pinned announcement from DB (not demo JSON)
2. Sign in → use **Ask a question** form on the hub
3. Submit a **course review** in the sidebar form
4. Maintainer: use **Pin announcement** form (visible only to maintainers)

## 8. Migrate seed roadmaps to Supabase

After schema is applied and `.env.local` includes `SUPABASE_SERVICE_ROLE_KEY`:

Copy the **service_role** key from Supabase → Project Settings → API (Vercel `env pull` omits this secret). Add to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then run:

```bash
cd acadmap
npm run migrate:seeds
```

This imports all files in `data/seeds/` as **approved** roadmaps (idempotent — skips majors that already have an approved v1 roadmap). Re-run with `--force` to replace existing approved rows:

```bash
npm run migrate:seeds -- --force
```

JSON seeds in the repo remain the canonical fallback for `/roadmap/...` pages until you change read precedence in `lib/roadmap.ts`.

## 9. Approve pending contributions (maintainers)

Contributors submit seed JSON at `/contribute` (status `pending`). Maintainers approve via API:

```bash
curl -X PATCH "https://hackathon-nu-taupe.vercel.app/api/roadmaps/<ROADMAP_UUID>" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session cookie after sign-in>" \
  -d '{"status":"approved"}'
```

Or locally while signed in as maintainer. Reject with `"status":"rejected"`.
